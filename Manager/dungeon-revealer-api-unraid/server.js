// server.js - Express web server for Dungeon Revealer Map Manager
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const crypto = require("crypto");
const io = require("socket.io-client");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// Configuration paths
const DATA_DIR = process.env.DATA_DIR || "/data";
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const LOG_FILE = path.join(DATA_DIR, "process.log");
const CHECKPOINT_FILE = path.join(DATA_DIR, "upload-checkpoint.json");

// Ensure all required directories exist
async function ensureDirectories() {
  try {
    // Create base data directory
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Create Assets subdirectories
    await fs.mkdir(path.join(DATA_DIR, "Assets", "Maps"), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, "Assets", "Tokens"), {
      recursive: true,
    });

    console.log(`✓ Data directories ensured: ${DATA_DIR}`);
  } catch (error) {
    console.error("Failed to create directories:", error);
  }
}

// Default configuration
let config = {
  serverUrl: "",
  dmPassword: "",
  scanDirectory: path.join(DATA_DIR, "Assets", "Maps"),
  tokenDirectory: path.join(DATA_DIR, "Assets", "Tokens"),
  monsterDataFile: path.join(DATA_DIR, "Assets", "Monsters.xlsx"),
  supportedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  skipExisting: true,
  checkpointInterval: 25,
};

// Logging function
function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  try {
    fsSync.appendFileSync(LOG_FILE, logEntry, "utf8");
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
  console.log(logEntry.trim());
}

// Load configuration with password masking for logs
async function loadConfig() {
  try {
    if (fsSync.existsSync(CONFIG_FILE)) {
      const data = await fs.readFile(CONFIG_FILE, "utf8");
      config = { ...config, ...JSON.parse(data) };
      log("Configuration loaded successfully");
    } else {
      log("No existing configuration, using defaults");
      await saveConfig();
    }
  } catch (error) {
    log(`Error loading config: ${error.message}`, "ERROR");
  }
}

// Save configuration (password is stored in plaintext - needed for API authentication)
async function saveConfig() {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    log("Configuration saved");
  } catch (error) {
    log(`Error saving config: ${error.message}`, "ERROR");
  }
}

// File utilities
function calculateSHA256(filePath) {
  const fileBuffer = fsSync.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

function getExtension(filePath) {
  return path.extname(filePath).substring(1).toLowerCase();
}

async function findImageFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await findImageFiles(filePath, fileList);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (config.supportedExtensions.includes(ext)) {
          fileList.push(filePath);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist yet or is empty - not an error
  }
  return fileList;
}

function generateTitle(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const parsed = path.parse(relativePath);
  const folderName = parsed.dir ? path.basename(parsed.dir) + " - " : "";
  return folderName + parsed.name;
}

// Checkpoint management
async function saveCheckpoint(data) {
  await fs.writeFile(CHECKPOINT_FILE, JSON.stringify(data, null, 2));
}

async function loadCheckpoint() {
  try {
    if (fsSync.existsSync(CHECKPOINT_FILE)) {
      const data = await fs.readFile(CHECKPOINT_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Error loading checkpoint: ${error.message}`, "ERROR");
  }
  return null;
}

async function deleteCheckpoint() {
  try {
    if (fsSync.existsSync(CHECKPOINT_FILE)) {
      await fs.unlink(CHECKPOINT_FILE);
    }
  } catch (error) {
    log(`Error deleting checkpoint: ${error.message}`, "ERROR");
  }
}

// GraphQL Client for Dungeon Revealer API
class GraphQLClient {
  constructor(serverUrl, password) {
    this.socket = io(serverUrl, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });
    this.password = password;
    this.queryId = 0;
    this.authenticated = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.on("connect", () => {
        this.socket.emit("authenticate", {
          password: this.password,
          desiredRole: "admin",
        });
      });
      this.socket.on("authenticated", () => {
        this.authenticated = true;
        resolve();
      });
      this.socket.on("connect_error", (error) => {
        reject(new Error(`Connection failed: ${error.message}`));
      });
      setTimeout(() => reject(new Error("Connection timeout")), 10000);
    });
  }

  sendQuery(operation, operationName, variables = {}) {
    this.queryId++;
    this.socket.emit("@graphql/execute", {
      id: this.queryId,
      operationName,
      operation,
      variables,
    });
    return this.queryId;
  }

  onResult(handler) {
    this.socket.on("@graphql/result", handler);
  }

  onError(handler) {
    this.socket.on("@graphql/error", handler);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// ==================== API ROUTES ====================

// Get configuration (mask password in response)
app.get("/api/config", (req, res) => {
  const safeConfig = { ...config };
  // Return config as-is (frontend needs password for DR connection)
  res.json(safeConfig);
});

// Save configuration
app.post("/api/config", async (req, res) => {
  try {
    config = { ...config, ...req.body };
    await saveConfig();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get statistics
app.get("/api/stats", async (req, res) => {
  try {
    const imageFiles = await findImageFiles(config.scanDirectory);
    const byExtension = {};
    imageFiles.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      byExtension[ext] = (byExtension[ext] || 0) + 1;
    });
    const checkpoint = await loadCheckpoint();
    res.json({
      success: true,
      localFiles: imageFiles.length,
      byExtension,
      checkpoint,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List maps from Dungeon Revealer server
app.get("/api/maps", async (req, res) => {
  const client = new GraphQLClient(config.serverUrl, config.dmPassword);
  const allMaps = [];

  try {
    await client.connect();

    const fetchMaps = (cursor = null) => {
      const query = cursor
        ? `query GetMaps($after: String) { maps(first: 20, after: $after) { edges { node { id title mapImageUrl } } pageInfo { hasNextPage endCursor } } }`
        : `query GetMaps { maps(first: 20) { edges { node { id title mapImageUrl } } pageInfo { hasNextPage endCursor } } }`;
      client.sendQuery(query, "GetMaps", cursor ? { after: cursor } : {});
    };

    client.onResult((data) => {
      if (data.data?.maps) {
        const edges = data.data.maps.edges;
        edges.forEach((edge) => allMaps.push(edge.node));

        if (data.data.maps.pageInfo.hasNextPage) {
          fetchMaps(data.data.maps.pageInfo.endCursor);
        } else {
          client.disconnect();
          allMaps.sort((a, b) => a.title.localeCompare(b.title));
          res.json({ success: true, maps: allMaps });
        }
      }
    });

    client.onError((error) => {
      client.disconnect();
      res.status(500).json({ success: false, error: error.message });
    });

    fetchMaps();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List tokens from Dungeon Revealer server
app.post("/api/tokens/list", async (req, res) => {
  const { first = 50, cursor = null, titleFilter = null } = req.body;
  const client = new GraphQLClient(config.serverUrl, config.dmPassword);
  const allTokens = [];

  try {
    await client.connect();
    let queryCount = 0;
    const maxQueries = Math.ceil(first / 20);

    const fetchTokens = (cursorParam = null) => {
      queryCount++;
      if (queryCount > maxQueries) {
        client.disconnect();
        return res.json({
          success: true,
          tokens: allTokens,
          hasMore: false,
          cursor: null,
        });
      }

      const query = cursorParam
        ? `query GetTokens($first: Int!, $after: String, $titleFilter: String) { tokenImages(first: $first, after: $after, titleFilter: $titleFilter) { edges { node { id title url } } pageInfo { hasNextPage endCursor } } }`
        : `query GetTokens($first: Int!, $titleFilter: String) { tokenImages(first: $first, titleFilter: $titleFilter) { edges { node { id title url } } pageInfo { hasNextPage endCursor } } }`;

      client.sendQuery(query, "GetTokens", {
        first: 20,
        after: cursorParam,
        titleFilter,
      });
    };

    client.onResult((data) => {
      if (data.errors) {
        client.disconnect();
        return res
          .status(500)
          .json({
            success: false,
            error: data.errors[0]?.message || "Unknown error",
          });
      }

      if (data.data?.tokenImages) {
        const edges = data.data.tokenImages.edges;
        edges.forEach((edge) => allTokens.push(edge.node));

        if (
          data.data.tokenImages.pageInfo.hasNextPage &&
          allTokens.length < first
        ) {
          setTimeout(
            () => fetchTokens(data.data.tokenImages.pageInfo.endCursor),
            300
          );
        } else {
          client.disconnect();
          res.json({
            success: true,
            tokens: allTokens,
            hasMore: data.data.tokenImages.pageInfo.hasNextPage,
            cursor: data.data.tokenImages.pageInfo.endCursor,
          });
        }
      }
    });

    client.onError((error) => {
      client.disconnect();
      res.status(500).json({ success: false, error: error.message });
    });

    fetchTokens(cursor);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Parse monster data from Excel file
app.post("/api/monsters/parse", async (req, res) => {
  try {
    const xlsx = require("xlsx");

    if (!config.monsterDataFile || !fsSync.existsSync(config.monsterDataFile)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Monster data file not found or not configured",
        });
    }

    const workbook = xlsx.readFile(config.monsterDataFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const monsters = data
      .map((row) => {
        const name =
          row["Monster Name"] ||
          row["Name"] ||
          row["MONSTER NAME"] ||
          row["name"];
        return {
          name,
          searchName: name ? name.toLowerCase().trim() : "",
          data: row,
        };
      })
      .filter((m) => m.name);

    res.json({ success: true, monsters, count: monsters.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== INITIALIZATION ====================

async function init() {
  // Ensure all directories exist
  await ensureDirectories();

  // Load configuration
  await loadConfig();

  // Initialize log file
  try {
    await fs.writeFile(LOG_FILE, "", "utf8");
    log("=== Server Started ===");
  } catch (error) {
    console.error("Failed to initialize log file:", error);
  }

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`\n🎲 Dungeon Revealer Map Manager`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📁 Data: ${DATA_DIR}`);
    console.log(`📂 Maps: ${path.join(DATA_DIR, "Assets", "Maps")}`);
    console.log(`🎭 Tokens: ${path.join(DATA_DIR, "Assets", "Tokens")}`);
    console.log(`\nReady to manage your maps!\n`);
  });
}

// Start the server
init();

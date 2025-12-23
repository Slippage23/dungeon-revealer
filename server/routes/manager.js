"use strict";

const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

// Helper to get a temp file path
const getTmpFile = (extension = "") => {
  const tmpDir = os.tmpdir();
  const randomName = `dr-upload-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}${extension}`;
  return path.join(tmpDir, randomName);
};

// Helper to parse file extension from filename
const parseFileExtension = (filename) => {
  const ext = path.extname(filename);
  return ext ? ext.substring(1).toLowerCase() : "";
};

// Helper to calculate SHA256 of a file
const calculateFileSha256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
};

// Helper to decode Relay Global ID (base64 encoded "01:ResourceType:id")
const decodeRelayId = (globalId) => {
  try {
    const decoded = decodeURIComponent(
      Buffer.from(globalId, "base64").toString("utf-8")
    );
    const parts = decoded.split(":");
    if (parts.length === 3) {
      return { version: parts[0], type: parts[1], id: parts[2] };
    }
    return null;
  } catch (e) {
    return null;
  }
};

module.exports = ({
  roleMiddleware,
  maps,
  settings,
  fileStorage,
  db,
  fileStoragePath,
}) => {
  const router = express.Router();

  // Token image storage directory
  const tokenImageDir = path.join(fileStoragePath, "token-image");

  router.get("/manager/config", roleMiddleware.dm, (req, res) => {
    res.json({
      error: null,
      data: {
        scanDirectory: settings.get("scanDirectory"),
        tokenDirectory: settings.get("tokenDirectory"),
        skipExisting: settings.get("skipExisting"),
        checkpointInterval: settings.get("checkpointInterval"),
        monsterDataFile: settings.get("monsterDataFile"),
        supportedExtensions: settings.get("supportedExtensions"),
      },
    });
  });

  router.post("/manager/config", roleMiddleware.dm, async (req, res) => {
    try {
      const body = req.body || {};
      [
        "scanDirectory",
        "tokenDirectory",
        "skipExisting",
        "checkpointInterval",
        "monsterDataFile",
        "supportedExtensions",
      ].forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(body, k)) {
          settings.set(k, body[k]);
        }
      });
      res.json({ error: null, data: { success: true } });
    } catch (err) {
      res.status(500).json({ error: { message: err.message }, data: null });
    }
  });

  router.get("/manager/stats", roleMiddleware.dm, async (req, res) => {
    try {
      const scanDir = settings.get("scanDirectory");
      const tokenDir = settings.get("tokenDirectory");
      const supported = settings.get("supportedExtensions") || [];
      const listFiles = (dir) => {
        try {
          return fs.readdirSync(dir || "").filter((f) => {
            const ext = path.extname(f).toLowerCase();
            return supported.includes(ext);
          });
        } catch (e) {
          return [];
        }
      };

      const mapsList = listFiles(scanDir);
      const tokensList = listFiles(tokenDir);

      res.json({
        error: null,
        data: {
          localMapFiles: mapsList.length,
          localTokenFiles: tokensList.length,
        },
      });
    } catch (err) {
      res.status(500).json({ error: { message: err.message }, data: null });
    }
  });

  router.post("/manager/upload-maps", roleMiddleware.dm, async (req, res) => {
    try {
      const scanDir = settings.get("scanDirectory");
      const supported = settings.get("supportedExtensions") || [];
      if (!scanDir)
        return res
          .status(400)
          .json({ error: { message: "scanDirectory not configured" } });

      const files = fs
        .readdirSync(scanDir)
        .filter((f) => supported.includes(path.extname(f).toLowerCase()));
      const results = [];
      for (const file of files) {
        const tmpPath = path.join(scanDir, file);
        const fileExtension = path.extname(file).substring(1);
        const title = path.parse(file).name;
        // create map using maps.createMap by moving file into maps dir
        // eslint-disable-next-line no-await-in-loop
        const created = await maps.createMap({
          title,
          filePath: tmpPath,
          fileExtension,
        });
        results.push({ file, mapId: created.id });
      }

      res.json({ error: null, data: { imported: results.length, results } });
    } catch (err) {
      res.status(500).json({ error: { message: err.message }, data: null });
    }
  });

  router.post("/manager/upload-tokens", roleMiddleware.dm, async (req, res) => {
    try {
      const tokenDir = settings.get("tokenDirectory");
      const supported = settings.get("supportedExtensions") || [];
      if (!tokenDir)
        return res
          .status(400)
          .json({ error: { message: "tokenDirectory not configured" } });

      const files = fs
        .readdirSync(tokenDir)
        .filter((f) => supported.includes(path.extname(f).toLowerCase()));
      const results = [];
      for (const file of files) {
        const tmpPath = path.join(tokenDir, file);
        const fileExtension = path.extname(file).substring(1);
        const fileName = file;
        // eslint-disable-next-line no-await-in-loop
        const record = await fileStorage.store({
          filePath: tmpPath,
          fileExtension,
          fileName,
        });
        results.push({ file, imageId: record.id });
      }

      res.json({ error: null, data: { imported: results.length, results } });
    } catch (err) {
      res.status(500).json({ error: { message: err.message }, data: null });
    }
  });

  router.post(
    "/manager/parse-monsters",
    roleMiddleware.dm,
    async (req, res) => {
      try {
        const xlsx = require("xlsx");
        const filePath = settings.get("monsterDataFile");
        if (!filePath || !fs.existsSync(filePath))
          return res.status(400).json({
            error: { message: "monsterDataFile not configured or not found" },
          });
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        const monsters = data
          .map((row) => {
            const name =
              row["Monster Name"] || row["Name"] || row["name"] || "";
            return { name, data: row };
          })
          .filter((m) => m.name);
        res.json({ error: null, data: { monsters, count: monsters.length } });
      } catch (err) {
        res.status(500).json({ error: { message: err.message }, data: null });
      }
    }
  );

  // Parse monsters from browser-uploaded Excel file
  router.post(
    "/manager/parse-monsters-browser",
    roleMiddleware.dm,
    async (req, res) => {
      console.log("[Excel Import] POST /manager/parse-monsters-browser called");
      console.log("[Excel Import] Content-Type:", req.headers["content-type"]);
      console.log("[Excel Import] req.busboy exists:", !!req.busboy);

      try {
        await new Promise((resolve, reject) => {
          if (!req.busboy) {
            console.log("[Excel Import] ERROR: Busboy not initialized");
            return reject(new Error("Busboy not initialized"));
          }

          let fileReceived = false;
          req.pipe(req.busboy);

          req.busboy.on("file", (fieldname, file, info) => {
            fileReceived = true; // Mark that we received a file
            const filename = info.filename;
            console.log(
              "[Excel Import] File received:",
              filename,
              "field:",
              fieldname
            );
            const fileExtension = path.extname(filename).toLowerCase();

            if (fileExtension !== ".xlsx" && fileExtension !== ".xls") {
              file.resume(); // Drain the stream
              return reject(
                new Error("Only .xlsx or .xls files are supported")
              );
            }

            const tmpFile = getTmpFile(fileExtension);
            const writeStream = fs.createWriteStream(tmpFile);
            file.pipe(writeStream);

            writeStream.on("finish", async () => {
              console.log(
                "[Excel Import] File write finished, parsing XLSX..."
              );
              try {
                const xlsx = require("xlsx");
                const workbook = xlsx.readFile(tmpFile);
                console.log(
                  "[Excel Import] Workbook loaded, sheets:",
                  workbook.SheetNames
                );
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(worksheet);
                console.log("[Excel Import] Parsed rows:", data.length);
                const monsters = data
                  .map((row) => {
                    const name =
                      row["Monster Name"] || row["Name"] || row["name"] || "";
                    return { name, data: row };
                  })
                  .filter((m) => m.name);

                console.log("[Excel Import] Found monsters:", monsters.length);

                // Clean up temp file
                fs.unlink(tmpFile, () => {});

                res.json({
                  error: null,
                  data: { monsters, count: monsters.length },
                });
                resolve();
              } catch (err) {
                console.log("[Excel Import] Parse error:", err.message);
                fs.unlink(tmpFile, () => {});
                reject(err);
              }
            });

            writeStream.on("error", (err) => {
              console.log("[Excel Import] Write stream error:", err.message);
              fs.unlink(tmpFile, () => {});
              reject(err);
            });
          });

          req.busboy.on("error", (err) => {
            console.log("[Excel Import] Busboy error:", err.message);
            reject(err);
          });

          req.busboy.on("close", () => {
            console.log(
              "[Excel Import] Busboy close event, fileReceived:",
              fileReceived
            );
            // Only send error if no file was received at all
            // If file was received, the writeStream.on("finish") will handle the response
            if (!fileReceived) {
              // No file was received
              if (!res.headersSent) {
                res
                  .status(400)
                  .json({ error: { message: "No file received" }, data: null });
              }
              resolve();
            }
            // Don't resolve here if file was received - let writeStream.on("finish") do it
          });
        });
      } catch (err) {
        if (!res.headersSent) {
          res.status(500).json({ error: { message: err.message }, data: null });
        }
      }
    }
  );

  // ========================================
  // Browser-based file upload endpoints
  // ========================================

  // Upload multiple map files from browser
  router.post(
    "/manager/upload-maps-browser",
    roleMiddleware.dm,
    async (req, res) => {
      const results = [];
      const errors = [];
      const fileProcessingPromises = [];
      let replaceIds = [];
      let renameFiles = [];
      let replaced = 0;
      let renamed = 0;

      console.log("[Manager] upload-maps-browser called");
      console.log("[Manager] Content-Type:", req.headers["content-type"]);
      console.log("[Manager] req.busboy exists:", !!req.busboy);

      try {
        await new Promise((resolve, reject) => {
          if (!req.busboy) {
            console.log("[Manager] ERROR: req.busboy is not available");
            return reject(
              new Error("Busboy not initialized - check Content-Type header")
            );
          }

          req.pipe(req.busboy);

          // Handle form fields (replaceIds and renameFiles)
          req.busboy.on("field", (fieldname, value) => {
            console.log("[Manager] Field received:", fieldname, value);
            if (fieldname === "replaceIds") {
              try {
                replaceIds = JSON.parse(value);
              } catch (e) {
                console.log("[Manager] Failed to parse replaceIds:", e.message);
              }
            }
            if (fieldname === "renameFiles") {
              try {
                renameFiles = JSON.parse(value);
              } catch (e) {
                console.log(
                  "[Manager] Failed to parse renameFiles:",
                  e.message
                );
              }
            }
          });

          req.busboy.on("file", (fieldname, file, info) => {
            console.log(
              "[Manager] File received:",
              info.filename,
              "field:",
              fieldname
            );
            const filename = info.filename;
            const fileExtension = parseFileExtension(filename);
            let title = path.parse(filename).name;
            const tmpFile = getTmpFile(`.${fileExtension}`);

            const writeStream = fs.createWriteStream(tmpFile);
            file.pipe(writeStream);

            // Ensure file stream is fully consumed to prevent unpipe errors
            file.on("error", () => file.resume());

            // Create a Promise that resolves when file processing is complete
            const processingPromise = new Promise((resolveFile) => {
              writeStream.on("close", async () => {
                try {
                  // Check if this file should be renamed (add timestamp suffix)
                  const shouldRename = renameFiles.includes(filename);
                  if (shouldRename) {
                    const timestamp = Date.now();
                    title = `${title}_${timestamp}`;
                    renamed++;
                    console.log("[Manager] Renaming map to:", title);
                  }

                  // Check if this file should replace an existing map
                  const replaceIndex =
                    replaceIds.length > 0
                      ? renameFiles.includes(filename)
                        ? -1
                        : replaceIds.shift()
                      : -1;

                  if (replaceIndex && replaceIndex !== -1) {
                    // Delete the existing map first
                    try {
                      await maps.deleteMap(replaceIndex);
                      replaced++;
                      console.log("[Manager] Replaced map:", replaceIndex);
                    } catch (delErr) {
                      console.log(
                        "[Manager] Failed to delete existing map:",
                        delErr.message
                      );
                    }
                  }

                  const created = await maps.createMap({
                    title,
                    filePath: tmpFile,
                    fileExtension,
                  });
                  results.push({ file: filename, mapId: created.id });
                } catch (err) {
                  errors.push({ file: filename, error: err.message });
                } finally {
                  // Clean up temp file
                  try {
                    fs.unlinkSync(tmpFile);
                  } catch (e) {
                    // ignore
                  }
                  resolveFile();
                }
              });

              writeStream.on("error", (err) => {
                errors.push({ file: filename, error: err.message });
                resolveFile();
              });
            });

            fileProcessingPromises.push(processingPromise);
          });

          req.busboy.on("close", () => {
            console.log(
              "[Manager] Maps busboy close, promises:",
              fileProcessingPromises.length
            );
            resolve();
          });

          req.busboy.on("error", (err) => {
            reject(err);
          });
        });

        // Wait for ALL file processing to complete
        console.log(
          "[Manager] Maps waiting for promises:",
          fileProcessingPromises.length
        );
        await Promise.all(fileProcessingPromises);
        console.log(
          "[Manager] Maps done, imported:",
          results.length,
          "replaced:",
          replaced,
          "renamed:",
          renamed
        );

        res.json({
          error:
            errors.length > 0
              ? { message: `${errors.length} files failed`, details: errors }
              : null,
          data: {
            imported: results.length,
            replaced,
            renamed,
            results,
            errors,
          },
        });
      } catch (err) {
        res.status(500).json({ error: { message: err.message }, data: null });
      }
    }
  );

  // Upload multiple token files from browser
  router.post(
    "/manager/upload-tokens-browser",
    roleMiddleware.dm,
    async (req, res) => {
      const results = [];
      const errors = [];
      const fileProcessingPromises = [];
      let replaceIds = [];
      let renameFiles = [];
      let replaced = 0;
      let renamed = 0;

      // Ensure token image directory exists
      await fs.ensureDir(tokenImageDir);

      try {
        await new Promise((resolve, reject) => {
          req.pipe(req.busboy);

          // Handle form fields (replaceIds and renameFiles)
          req.busboy.on("field", (fieldname, value) => {
            console.log("[Manager] Token field received:", fieldname, value);
            if (fieldname === "replaceIds") {
              try {
                replaceIds = JSON.parse(value);
              } catch (e) {
                console.log("[Manager] Failed to parse replaceIds:", e.message);
              }
            }
            if (fieldname === "renameFiles") {
              try {
                renameFiles = JSON.parse(value);
              } catch (e) {
                console.log(
                  "[Manager] Failed to parse renameFiles:",
                  e.message
                );
              }
            }
          });

          req.busboy.on("file", (fieldname, file, info) => {
            const filename = info.filename;
            const fileExtension = parseFileExtension(filename);
            let title = path.parse(filename).name;
            const tmpFile = getTmpFile(`.${fileExtension}`);

            const writeStream = fs.createWriteStream(tmpFile);
            file.pipe(writeStream);

            // Ensure file stream is fully consumed to prevent unpipe errors
            file.on("error", () => file.resume());

            // Create a Promise that resolves when file processing is complete
            const processingPromise = new Promise((resolveFile) => {
              writeStream.on("close", async () => {
                try {
                  // Check if this file should be renamed (add timestamp suffix)
                  const shouldRename = renameFiles.includes(filename);
                  if (shouldRename) {
                    const timestamp = Date.now();
                    title = `${title}_${timestamp}`;
                    renamed++;
                    console.log("[Manager] Renaming token to:", title);
                  }

                  // Check if this file should replace an existing token
                  // We need to match by filename to the replaceIds array
                  const shouldReplace = !shouldRename && replaceIds.length > 0;
                  let replaceId = null;
                  if (shouldReplace) {
                    replaceId = replaceIds.shift();
                  }

                  if (replaceId) {
                    // Delete the existing token first
                    try {
                      // Decode the Relay ID to get the actual database ID
                      let actualId = replaceId;
                      try {
                        const decoded = Buffer.from(
                          replaceId,
                          "base64"
                        ).toString("utf-8");
                        const parts = decoded.split(":");
                        if (parts.length >= 3) {
                          actualId = parts.slice(2).join(":");
                        }
                      } catch (e) {
                        // Use as-is if decoding fails
                      }

                      // Get the existing token's file info before deleting
                      const existingToken = await db.get(
                        `SELECT sha256, extension FROM "tokenImages" WHERE id = ?`,
                        actualId
                      );

                      if (existingToken) {
                        // Delete from database
                        await db.run(
                          `DELETE FROM "tokenImages" WHERE id = ?`,
                          actualId
                        );

                        // Delete the file
                        const oldFilePath = path.join(
                          tokenImageDir,
                          `${existingToken.sha256.toString("hex")}.${
                            existingToken.extension
                          }`
                        );
                        try {
                          await fs.remove(oldFilePath);
                        } catch (e) {
                          // File might not exist, ignore
                        }
                        replaced++;
                        console.log("[Manager] Replaced token:", actualId);
                      }
                    } catch (delErr) {
                      console.log(
                        "[Manager] Failed to delete existing token:",
                        delErr.message
                      );
                    }
                  }

                  // Calculate SHA256 of the file
                  const sha256 = await calculateFileSha256(tmpFile);

                  // Destination path in token-image directory
                  const destPath = path.join(
                    tokenImageDir,
                    `${sha256}.${fileExtension}`
                  );

                  // Check if this token already exists (by SHA256) - only if not replacing
                  const existingToken = await db.get(
                    `SELECT id FROM "tokenImages" WHERE sha256 = ?`,
                    Buffer.from(sha256, "hex")
                  );

                  if (existingToken && !replaceId && !shouldRename) {
                    // Token already exists (same file content), skip
                    results.push({
                      file: filename,
                      tokenId: existingToken.id,
                      skipped: true,
                    });
                  } else {
                    // Copy file to token-image directory
                    await fs.copy(tmpFile, destPath);

                    // Insert into tokenImages table
                    const result = await db.run(
                      `INSERT INTO "tokenImages" ("title", "sha256", "sourceSha256", "extension", "createdAt")
                       VALUES (?, ?, NULL, ?, ?)`,
                      title,
                      Buffer.from(sha256, "hex"),
                      fileExtension,
                      Date.now()
                    );

                    results.push({
                      file: filename,
                      tokenId: result.lastID,
                    });
                  }
                } catch (err) {
                  errors.push({ file: filename, error: err.message });
                } finally {
                  // Clean up temp file
                  try {
                    fs.unlinkSync(tmpFile);
                  } catch (e) {
                    // ignore
                  }
                  resolveFile();
                }
              });

              writeStream.on("error", (err) => {
                errors.push({ file: filename, error: err.message });
                resolveFile();
              });
            });

            fileProcessingPromises.push(processingPromise);
          });

          req.busboy.on("close", () => {
            resolve();
          });

          req.busboy.on("error", (err) => {
            reject(err);
          });
        });

        // Wait for ALL file processing to complete
        await Promise.all(fileProcessingPromises);
        console.log(
          "[Manager] Tokens done, imported:",
          results.length,
          "replaced:",
          replaced,
          "renamed:",
          renamed
        );

        res.json({
          error:
            errors.length > 0
              ? { message: `${errors.length} files failed`, details: errors }
              : null,
          data: {
            imported: results.length,
            replaced,
            renamed,
            results,
            errors,
          },
        });
      } catch (err) {
        res.status(500).json({ error: { message: err.message }, data: null });
      }
    }
  );

  // Delete a token image by ID
  router.delete("/manager/token/:id", roleMiddleware.dm, async (req, res) => {
    const { id: rawId } = req.params;
    console.log("[Manager] Delete token requested:", rawId);

    // Decode Relay Global ID to get the actual database ID
    const decoded = decodeRelayId(rawId);
    const dbId = decoded ? decoded.id : rawId;
    console.log("[Manager] Decoded token ID:", dbId);

    try {
      // Get the token info first
      const token = await db.get(
        `SELECT id, sha256, extension FROM "tokenImages" WHERE id = ?`,
        dbId
      );

      if (!token) {
        return res.status(404).json({
          error: { message: `Token with id "${rawId}" not found` },
          data: null,
        });
      }

      // Delete the file
      const filePath = path.join(
        tokenImageDir,
        `${token.sha256.toString("hex")}.${token.extension}`
      );
      try {
        await fs.remove(filePath);
        console.log("[Manager] Deleted token file:", filePath);
      } catch (e) {
        console.log(
          "[Manager] Token file not found (may be shared):",
          filePath
        );
      }

      // Delete from database
      await db.run(`DELETE FROM "tokenImages" WHERE id = ?`, dbId);
      console.log("[Manager] Deleted token from database:", dbId);

      res.json({
        error: null,
        data: { deletedTokenId: rawId },
      });
    } catch (err) {
      console.error("[Manager] Delete token error:", err);
      res.status(500).json({ error: { message: err.message }, data: null });
    }
  });

  return { router };
};

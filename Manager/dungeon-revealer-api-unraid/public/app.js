// app.js - Client-side JavaScript for web-based Dungeon Revealer Map Manager

const API_BASE = "/api";

// State management
const state = {
  config: null,
  maps: [],
  tokens: [],
  tokenCursor: null,
};

// API wrapper functions
const api = {
  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  },

  async saveConfig(config) {
    const res = await fetch(`${API_BASE}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async listMaps() {
    const res = await fetch(`${API_BASE}/maps`);
    return res.json();
  },

  async listTokens(params) {
    const res = await fetch(`${API_BASE}/tokens/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async parseMonsterData() {
    const res = await fetch(`${API_BASE}/monsters/parse`, {
      method: "POST",
    });
    return res.json();
  },
};

// Initialize
async function init() {
  state.config = await api.getConfig();
  showDashboard();
  refreshStats();
}

// Navigation
function showDashboard() {
  hideAllViews();
  document.getElementById("dashboardView").classList.remove("hidden");
  refreshStats();
}

function showMapList() {
  hideAllViews();
  document.getElementById("mapListView").classList.remove("hidden");
}

function showUpload() {
  hideAllViews();
  document.getElementById("uploadView").classList.remove("hidden");
}

function showSettings() {
  hideAllViews();
  document.getElementById("settingsView").classList.remove("hidden");
  setTimeout(() => loadConfigForm(), 50);
}

function showTokenList() {
  hideAllViews();
  document.getElementById("tokenListView").classList.remove("hidden");
}

function showTokenUpload() {
  hideAllViews();
  document.getElementById("tokenUploadView").classList.remove("hidden");
}

function showNoteImport() {
  hideAllViews();
  document.getElementById("noteImportView").classList.remove("hidden");
}

function hideAllViews() {
  document.getElementById("dashboardView").classList.add("hidden");
  document.getElementById("mapListView").classList.add("hidden");
  document.getElementById("uploadView").classList.add("hidden");
  document.getElementById("settingsView").classList.add("hidden");
  document.getElementById("tokenListView").classList.add("hidden");
  document.getElementById("tokenUploadView").classList.add("hidden");
  document.getElementById("noteImportView").classList.add("hidden");
}

// Stats
async function refreshStats() {
  try {
    const stats = await api.getStats();

    if (stats.success) {
      document.getElementById("localFilesCount").textContent = stats.localFiles;

      if (stats.checkpoint) {
        document.getElementById("checkpointCard").classList.remove("hidden");
        document.getElementById("cpProcessed").textContent =
          stats.checkpoint.processedTitles?.length || 0;
        document.getElementById("cpSuccess").textContent =
          stats.checkpoint.successCount || 0;
        document.getElementById("cpSkipped").textContent =
          stats.checkpoint.skippedCount || 0;
        document.getElementById("cpFailed").textContent =
          stats.checkpoint.failCount || 0;
      } else {
        document.getElementById("checkpointCard").classList.add("hidden");
      }
    }

    // Try to get server count
    const mapsResult = await api.listMaps();
    if (mapsResult.success) {
      document.getElementById("serverMapsCount").textContent =
        mapsResult.maps.length;
      document.getElementById("connectionStatus").textContent = "✓ Online";
      document.getElementById("connectionStatus").style.color = "#3d6b3d";
    } else {
      document.getElementById("serverMapsCount").textContent = "Error";
      document.getElementById("connectionStatus").textContent = "✗ Offline";
      document.getElementById("connectionStatus").style.color = "#a02c2c";
    }
  } catch (error) {
    console.error("Error refreshing stats:", error);
    document.getElementById("connectionStatus").textContent = "✗ Offline";
    document.getElementById("connectionStatus").style.color = "#a02c2c";
  }
}

// Map List
async function loadMaps() {
  const btn = document.getElementById("loadMapsBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Loading...';

  try {
    const result = await api.listMaps();

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔄</span> Load Maps';

    if (result.success) {
      state.maps = result.maps;
      document.getElementById("mapCount").textContent = state.maps.length;
      document.getElementById("mapListContainer").classList.remove("hidden");

      const mapList = document.getElementById("mapList");
      mapList.innerHTML = "";

      state.maps.forEach((map, index) => {
        const item = document.createElement("div");
        item.className = "map-item";

        const mapImageUrl = `${state.config.serverUrl}/api/map/${
          map.id
        }/map?authorization=${encodeURIComponent(state.config.dmPassword)}`;

        item.innerHTML = `
          <div class="map-number">#${index + 1}</div>
          <div class="map-icon">
            <img src="${mapImageUrl}" alt="${escapeHtml(
          map.title
        )}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ccc%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22%3E🗺️%3C/text%3E%3C/svg%3E'">
          </div>
          <div class="map-info">
            <div class="map-title">${escapeHtml(map.title)}</div>
            <div class="map-id">${map.id}</div>
            <a href="${mapImageUrl}" target="_blank" class="map-link">
              <span>🔗</span>
              <span>Open Map</span>
            </a>
          </div>
        `;
        mapList.appendChild(item);
      });
    } else {
      alert("Error loading maps: " + result.error);
    }
  } catch (error) {
    alert("Error loading maps: " + error.message);
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔄</span> Load Maps';
  }
}

// Settings
async function loadConfigForm() {
  state.config = await api.getConfig();

  document.getElementById("serverUrl").value = state.config.serverUrl || "";
  document.getElementById("dmPassword").value = state.config.dmPassword || "";
  document.getElementById("scanDirectory").value =
    state.config.scanDirectory || "/data/Assets/Maps";
  document.getElementById("tokenDirectory").value =
    state.config.tokenDirectory || "/data/Assets/Tokens";
  document.getElementById("skipExisting").checked =
    state.config.skipExisting !== false;
  document.getElementById("checkpointInterval").value =
    state.config.checkpointInterval || 25;
}

async function saveSettings(e) {
  e.preventDefault();

  const newConfig = {
    serverUrl: document.getElementById("serverUrl").value,
    dmPassword: document.getElementById("dmPassword").value,
    scanDirectory: document.getElementById("scanDirectory").value,
    tokenDirectory: document.getElementById("tokenDirectory").value,
    skipExisting: document.getElementById("skipExisting").checked,
    checkpointInterval: parseInt(
      document.getElementById("checkpointInterval").value
    ),
  };

  try {
    const result = await api.saveConfig(newConfig);

    if (result.success) {
      state.config = { ...state.config, ...newConfig };
      alert("Configuration saved successfully!");
    } else {
      alert("Error saving configuration");
    }
  } catch (error) {
    alert("Error saving configuration: " + error.message);
  }
}

// Token Management
let tokenCursor = null;

async function loadTokens(reset = true) {
  if (reset) {
    state.tokens = [];
    tokenCursor = null;
    document.getElementById("tokenGrid").innerHTML = "";
  }

  const btn = document.getElementById("loadTokensBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Loading...';

  const tokenSearchFilter = document
    .getElementById("tokenSearchInput")
    .value.trim();

  try {
    const result = await api.listTokens({
      first: 50,
      cursor: tokenCursor,
      titleFilter: tokenSearchFilter || null,
    });

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔄</span> Load Tokens';

    if (result.success) {
      state.tokens = state.tokens.concat(result.tokens);

      document.getElementById("tokenCount").textContent = state.tokens.length;
      document.getElementById("tokenListContainer").classList.remove("hidden");

      renderTokens();

      if (result.hasMore) {
        tokenCursor = result.cursor;
        document.getElementById("tokenLoadMore").classList.remove("hidden");
      } else {
        document.getElementById("tokenLoadMore").classList.add("hidden");
      }
    } else {
      alert("Error loading tokens: " + result.error);
    }
  } catch (error) {
    alert("Error loading tokens: " + error.message);
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔄</span> Load Tokens';
  }
}

async function loadMoreTokens() {
  await loadTokens(false);
}

function renderTokens() {
  const tokenGrid = document.getElementById("tokenGrid");

  // Only render new tokens
  const startIndex = tokenGrid.children.length;

  for (let i = startIndex; i < state.tokens.length; i++) {
    const token = state.tokens[i];
    const card = document.createElement("div");
    card.className = "token-card";

    const tokenImageUrl = `${state.config.serverUrl}${
      token.url
    }?authorization=${encodeURIComponent(state.config.dmPassword)}`;

    card.innerHTML = `
      <div class="token-image-wrapper">
        <img src="${tokenImageUrl}" alt="${escapeHtml(
      token.title
    )}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2240%22%3E🎭%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="token-name">${escapeHtml(token.title)}</div>
    `;
    tokenGrid.appendChild(card);
  }
}

// Search functionality
let tokenSearchTimeout;
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("tokenSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(tokenSearchTimeout);
      tokenSearchTimeout = setTimeout(() => {
        loadTokens(true);
      }, 500);
    });
  }
});

// Utility functions
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Start the app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

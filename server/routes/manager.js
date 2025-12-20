"use strict";

const express = require("express");
const fs = require("fs-extra");
const path = require("path");
module.exports = ({ roleMiddleware, maps, settings, fileStorage }) => {
  const router = express.Router();

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

  return { router };
};

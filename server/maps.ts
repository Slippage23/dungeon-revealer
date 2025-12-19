import path from "path";
import fs from "fs-extra";
import junk from "junk";
import { randomUUID } from "crypto";

const isDirectory = (source: string) => fs.lstatSync(source).isDirectory();

const prepareToken = (token: { [key: string]: unknown }) => {
  if (typeof token.type !== "string") {
    token.type = "entity";
  }
  if (typeof token.title !== "string") {
    token.title = "";
  }
  if (typeof token.title !== "string") {
    token.description = "";
  }
  if (token.isLocked === undefined) {
    token.isLocked = false;
  }
  if (token.isMovableByPlayers === undefined) {
    token.isMovableByPlayers = true;
  }
  if (token.rotation === undefined) {
    token.rotation = 0;
  }
  if (token.reference === undefined) {
    token.reference = null;
  }
  if ("tokenImageId" in token === false) {
    token.tokenImageId = null;
  }

  return token;
};

export type MapGridEntity = {
  color: string;
  offsetX: number;
  offsetY: number;
  columnWidth: number;
  columnHeight: number;
};

export type MapTokenEntity = {
  id: string;
  radius: number;
  rotation: number;
  color: string;
  label: string;
  x: number;
  y: number;
  isVisibleForPlayers: boolean;
  isMovableByPlayers: boolean;
  isLocked: boolean;
  reference: null | {
    type: "note";
    id: string;
  };
  tokenImageId: string | null;
};

const prepareGrid = (
  grid: null | undefined | { [key: string]: unknown },
  gridColor: string | null | undefined
): MapGridEntity | null => {
  if (!grid) {
    return null;
  }

  const _gridColor = grid?.color ?? gridColor;
  const _offsetX = grid?.offsetX ?? grid?.x;
  const _offsetY = grid?.offsetY ?? grid?.y;
  const _columnWidth = grid?.columnWidth ?? grid?.sideLength;
  const _columnHeight = grid?.columnHeight ?? grid?.sideLength;

  return {
    color: typeof _gridColor === "string" ? _gridColor : "red",
    offsetX: typeof _offsetX === "number" ? _offsetX : 0,
    offsetY: typeof _offsetY === "number" ? _offsetY : 0,
    columnWidth: typeof _columnWidth === "number" ? _columnWidth : 10,
    columnHeight: typeof _columnHeight === "number" ? _columnHeight : 10,
  };
};

type LegacyMapEntity = {
  id: string;
  title: string;
  fogProgressPath: string;
  fogLivePath: string;
  mapPath: string;
  showGrid?: boolean;
  showGridToPlayers?: boolean;
  gridColor?: string;
  grid?: {
    x: number;
    y: number;
    sideLength: number;
  };
};

export type MapEntity = {
  id: string;
  title: string;
  fogProgressPath: string | null;
  fogLivePath: string | null;
  mapPath: string;
  showGrid: boolean;
  showGridToPlayers: boolean;
  grid: null | MapGridEntity;
  tokens: Array<any>;
  fogLiveRevision: string;
  fogProgressRevision: string;
};

export class Maps {
  private _maps: Array<MapEntity>;
  private _mapsDirectoryPath: string;
  private _processTask: <TReturnType = unknown>(
    operationIdentifier: string,
    process: () => unknown
  ) => Promise<TReturnType>;

  constructor({
    processTask,
    dataDirectory,
  }: {
    processTask: <TReturnType = unknown>(
      operationIdentifier: string,
      process: () => unknown
    ) => Promise<TReturnType>;
    dataDirectory: string;
  }) {
    this._mapsDirectoryPath = path.join(dataDirectory, "maps");
    fs.mkdirpSync(this._mapsDirectoryPath);
    this._processTask = processTask;
    this._maps = this._loadMaps();
  }

  _buildMapFolderPath(mapId: string) {
    return path.join(this._mapsDirectoryPath, mapId);
  }

  _loadMaps() {
    const mapDirectories = fs
      .readdirSync(this._mapsDirectoryPath)
      .filter(junk.not)
      .map((id) => this._buildMapFolderPath(id))
      .filter(isDirectory);

    return mapDirectories.map((directory) => {
      const rawConfig = fs.readFileSync(
        path.join(directory, "settings.json"),
        "utf-8"
      );
      const rawMap = JSON.parse(rawConfig) as LegacyMapEntity | MapEntity;
      const map: MapEntity = {
        id: rawMap.id,
        title: rawMap.title,
        mapPath: rawMap.mapPath,
        fogProgressPath: rawMap.fogProgressPath ?? null,
        fogLivePath: rawMap.fogLivePath ?? null,
        showGrid: rawMap.showGrid ?? false,
        showGridToPlayers: rawMap.showGridToPlayers ?? false,
        grid: prepareGrid(
          rawMap.grid,
          "gridColor" in rawMap ? rawMap.gridColor : null
        ),
        tokens: "tokens" in rawMap ? rawMap.tokens.map(prepareToken) : [],
        fogProgressRevision:
          "fogProgressRevision" in rawMap
            ? rawMap.fogProgressRevision
            : randomUUID(),
        fogLiveRevision:
          "fogLiveRevision" in rawMap
            ? rawMap.fogProgressRevision
            : randomUUID(),
      };

      return map;
    });
  }

  getBasePath(map: { id: string }) {
    return path.join(this._mapsDirectoryPath, map.id);
  }

  getAll() {
    return this._maps;
  }

  get(id: string) {
    return this._maps.find((map) => map.id === id) ?? null;
  }

  async createMap({
    title,
    filePath,
    fileExtension,
  }: {
    title: string;
    filePath: string;
    fileExtension: string | null;
  }) {
    const id = randomUUID();
    return this._processTask<MapEntity>(`map:${id}`, async () => {
      fs.mkdirp(this._buildMapFolderPath(id));
      const mapPath = `map${fileExtension ? `.${fileExtension}` : ``}`;
      const map: MapEntity = {
        id,
        title,
        // automatically saved after interaction
        fogProgressPath: null,
        // progress becomes live when DM publishes map
        fogLivePath: null,
        mapPath,
        grid: null,
        showGrid: false,
        showGridToPlayers: false,
        tokens: [],
        fogProgressRevision: randomUUID(),
        fogLiveRevision: randomUUID(),
      };

      await fs.move(filePath, path.join(this._buildMapFolderPath(id), mapPath));
      await fs.writeFile(
        path.join(this._mapsDirectoryPath, id, "settings.json"),
        JSON.stringify(map, undefined, 2)
      );

      this._maps.push(map);

      return map;
    });
  }

  async _updateMapSettings(map: MapEntity, data: Partial<MapEntity>) {
    Object.assign(map, data);

    await fs.writeFile(
      path.join(this._buildMapFolderPath(map.id), "settings.json"),
      JSON.stringify(map, undefined, 2)
    );

    return map;
  }

  async updateMapSettings(id: string, data: Partial<MapEntity>) {
    return await this._processTask<MapEntity>(`map:${id}`, async () => {
      const map = this._maps.find((map) => map.id === id);
      if (!map) {
        throw new Error(`Map with id "${id}" not found.`);
      }
      return await this._updateMapSettings(map, data);
    });
  }

  async updateFogProgressImage(id: string, filePath: string) {
    return await this._processTask<MapEntity>(`map:${id}`, async () => {
      const map = this._maps.find((map) => map.id === id);
      if (!map) {
        throw new Error(`Map with id "${id}" not found.`);
      }

      const mapFolderPath = this._buildMapFolderPath(map.id);

      if (map.fogProgressPath) {
        await fs.remove(path.join(mapFolderPath, map.fogProgressPath));
      }

      const newMapData = {
        fogProgressPath: "fog.progress.png",
        fogProgressRevision: randomUUID(),
      };

      const fileDestination = path.join(
        mapFolderPath,
        newMapData.fogProgressPath
      );
      await fs.move(filePath, fileDestination);
      return await this._updateMapSettings(map, newMapData);
    });
  }

  async updateFogLiveImage(id: string, filePath: string) {
    return await this._processTask<MapEntity>(`map:${id}`, async () => {
      const map = this._maps.find((map) => map.id === id);
      if (!map) {
        throw new Error(`Map with id "${id}" not found.`);
      }

      const newMapData = {
        fogLivePath: "fog.live.png",
        fogProgressPath: "fog.progress.png",
        fogLiveRevision: randomUUID(),
      };

      if (map.fogProgressPath) {
        await fs.remove(
          path.join(this._buildMapFolderPath(map.id), map.fogProgressPath)
        );
      }
      if (map.fogLivePath) {
        await fs.remove(
          path.join(this._buildMapFolderPath(map.id), map.fogLivePath)
        );
      }

      const livePath = path.join(
        this._mapsDirectoryPath,
        id,
        newMapData.fogLivePath
      );
      // prettier-ignore
      const progressPath = path.join(this._buildMapFolderPath(map.id), newMapData.fogProgressPath);

      await fs.copyFile(filePath, livePath);
      await fs.move(filePath, progressPath);

      const updatedMap = await this._updateMapSettings(map, newMapData);

      return updatedMap;
    });
  }

  /**
   * Reset fog to a completely black (hidden) state.
   * This creates a new solid black fog image that hides the entire map.
   */
  async resetFog(id: string) {
    return await this._processTask<MapEntity>(`map:${id}`, async () => {
      const map = this._maps.find((map) => map.id === id);
      if (!map) {
        throw new Error(`Map with id "${id}" not found.`);
      }

      const mapFolderPath = this._buildMapFolderPath(map.id);

      // Remove existing fog files if they exist
      if (map.fogProgressPath) {
        const fogProgressFullPath = path.join(
          mapFolderPath,
          map.fogProgressPath
        );
        if (await fs.pathExists(fogProgressFullPath)) {
          await fs.remove(fogProgressFullPath);
        }
      }
      if (map.fogLivePath) {
        const fogLiveFullPath = path.join(mapFolderPath, map.fogLivePath);
        if (await fs.pathExists(fogLiveFullPath)) {
          await fs.remove(fogLiveFullPath);
        }
      }

      // Create a minimal 1x1 black PNG (the frontend will scale it to cover the map)
      // This is a valid PNG file with a single black pixel
      const blackPixelPng = Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a, // PNG signature
        0x00,
        0x00,
        0x00,
        0x0d, // IHDR length
        0x49,
        0x48,
        0x44,
        0x52, // IHDR type
        0x00,
        0x00,
        0x00,
        0x01, // width: 1
        0x00,
        0x00,
        0x00,
        0x01, // height: 1
        0x08,
        0x02, // bit depth: 8, color type: RGB
        0x00,
        0x00,
        0x00, // compression, filter, interlace
        0x90,
        0x77,
        0x53,
        0xde, // IHDR CRC
        0x00,
        0x00,
        0x00,
        0x0c, // IDAT length
        0x49,
        0x44,
        0x41,
        0x54, // IDAT type
        0x08,
        0xd7,
        0x63,
        0x60,
        0x60,
        0x60,
        0x00,
        0x00, // compressed black pixel
        0x00,
        0x04,
        0x00,
        0x01, // IDAT data continued
        0x27,
        0x34,
        0x27,
        0x0a, // IDAT CRC
        0x00,
        0x00,
        0x00,
        0x00, // IEND length
        0x49,
        0x45,
        0x4e,
        0x44, // IEND type
        0xae,
        0x42,
        0x60,
        0x82, // IEND CRC
      ]);

      const fogProgressPath = path.join(mapFolderPath, "fog.progress.png");
      const fogLivePath = path.join(mapFolderPath, "fog.live.png");

      await fs.writeFile(fogProgressPath, blackPixelPng);
      await fs.writeFile(fogLivePath, blackPixelPng);

      // Update map with new fog paths
      const newMapData = {
        fogProgressPath: "fog.progress.png",
        fogLivePath: "fog.live.png",
        fogProgressRevision: randomUUID(),
        fogLiveRevision: randomUUID(),
      };

      return await this._updateMapSettings(map, newMapData);
    });
  }

  async updateMapImage(
    id: string,
    {
      filePath,
      fileExtension,
    }: { filePath: string; fileExtension: string | null }
  ) {
    return await this._processTask<MapEntity>(`map:${id}`, async () => {
      const map = this._maps.find((map) => map.id === id);
      if (!map) {
        throw new Error(`Map with id "${id}" not found.`);
      }
      if (map.mapPath) {
        await fs.remove(map.mapPath);
      }

      const fileName = `map${fileExtension ? `.${fileExtension}` : ``}`;
      const destination = path.join(this._buildMapFolderPath(map.id), fileName);
      await fs.move(filePath, destination);

      const result = await this._updateMapSettings(map, { mapPath: fileName });
      return result;
    });
  }

  async addTokens(
    mapId: string,
    tokens: Array<{
      x?: number | null;
      y?: number | null;
      radius?: null | number;
      color?: string | null;
      label?: string | null;
      isLocked?: boolean | null;
      isVisibleForPlayers?: boolean | null;
      isMovableByPlayers?: boolean | null;
      type?: "entity" | null;
      tokenImageId?: null | string;
      rotation?: number | null;
    }>
  ) {
    return await this._processTask<{ tokens: Array<any> }>(
      `map:${mapId}`,
      async () => {
        const map = this.get(mapId);
        if (!map) {
          throw new Error(`Map with id "${mapId}" not found.`);
        }
        const newTokens = [];

        for (const props of tokens) {
          const token = {
            id: randomUUID(),
            x: props.x ?? 0,
            y: props.y ?? 0,
            radius: props.radius ?? (map.grid?.columnWidth ?? 50) / 2,
            color: props.color ?? "red",
            label: props.label ?? "A",
            isVisibleForPlayers: props.isVisibleForPlayers ?? false,
            isMovableByPlayers: props.isMovableByPlayers ?? false,
            isLocked: props.isLocked ?? false,
            type: props.type ?? "entity",
            tokenImageId: props.tokenImageId ?? null,
            rotation: props.rotation ?? 0,
          };

          newTokens.push(token);
        }

        await this._updateMapSettings(map, {
          tokens: [...map.tokens, ...newTokens],
        });

        return {
          map,
          tokens: newTokens,
        };
      }
    );
  }

  async updateToken(
    mapId: string,
    tokenId: string,
    {
      type,
      x,
      y,
      radius,
      color,
      label,
      isVisibleForPlayers,
      isLocked,
      isMovableByPlayers,
      title,
      description,
      reference,
      tokenImageId,
      rotation,
    }: {
      type?: string;
      x?: number;
      y?: number;
      radius?: number;
      color?: number;
      label?: string;
      isVisibleForPlayers?: boolean;
      isLocked?: boolean;
      isMovableByPlayers?: boolean;
      title?: string;
      description?: string;
      reference?:
        | null
        | undefined
        | {
            type: string;
            id: string;
          };
      tokenImageId?: null | string;
      rotation?: number;
    }
  ) {
    return await this._processTask<{ map: MapEntity; token: unknown }>(
      `map:${mapId}`,
      async () => {
        const map = this.get(mapId);
        if (!map) {
          throw new Error(`Map with id "${mapId}" not found.`);
        }
        const token = (map.tokens || []).find((token) => token.id === tokenId);

        if (!token) {
          throw new Error(
            `Token with id "${tokenId}" does not exist on map with id "${mapId}".`
          );
        }

        if (type !== undefined) {
          token.type = type;
        }
        if (isLocked !== undefined) {
          token.isLocked = isLocked;
        }
        if (title !== undefined) {
          token.title = title;
        }
        if (description !== undefined) {
          token.description = description;
        }
        if (x !== undefined) {
          token.x = x;
        }
        if (y !== undefined) {
          token.y = y;
        }
        if (radius !== undefined) {
          token.radius = radius;
        }
        if (color !== undefined) {
          token.color = color;
        }
        if (label !== undefined) {
          token.label = label;
        }
        if (isVisibleForPlayers !== undefined) {
          token.isVisibleForPlayers = isVisibleForPlayers;
        }
        if (isMovableByPlayers !== undefined) {
          token.isMovableByPlayers = isMovableByPlayers;
        }
        if (reference !== undefined) {
          if (reference === null) {
            token.reference = null;
          } else {
            token.reference = reference = {
              type: reference.type,
              id: reference.id,
            };
          }
        }
        if (tokenImageId !== undefined) {
          token.tokenImageId = tokenImageId;
        }
        if (rotation !== undefined) {
          token.rotation = rotation;
        }

        const updatedMap = await this._updateMapSettings(map, {
          tokens: map.tokens,
        });

        return {
          map: updatedMap,
          token,
        };
      }
    );
  }

  async updateManyTokens(
    mapId: string,
    tokenIds: Set<string>,
    props: {
      color: string | undefined;
      isVisibleForPlayers: boolean | undefined;
      isMovableByPlayers: boolean | undefined;
      tokenImageId: string | null | undefined;
      rotation: number | undefined;
    }
  ) {
    return await this._processTask(`map:${mapId}`, async () => {
      const map = this.get(mapId);
      if (!map) {
        return;
      }

      const affectedTokens: Array<any> = [];

      (map.tokens || []).forEach((token) => {
        if (tokenIds.has(token.id)) {
          affectedTokens.push(token);
        }
      });

      if (affectedTokens.length === 0) {
        return;
      }

      for (const token of affectedTokens) {
        if (props.color != null) {
          token.color = props.color;
        }
        if (props.isVisibleForPlayers != null) {
          token.isVisibleForPlayers = props.isVisibleForPlayers;
        }
        if (props.isMovableByPlayers != null) {
          token.isMovableByPlayers = props.isMovableByPlayers;
        }
        if (props.tokenImageId !== undefined) {
          token.tokenImageId = props.tokenImageId;
        }
        if (props.rotation !== undefined) {
          token.rotation = props.rotation;
        }
      }

      await this._updateMapSettings(map, {
        tokens: map.tokens,
      });
    });
  }

  async removeTokensById(mapId: string, tokenIds: Set<string>) {
    return await this._processTask<Set<string>>(`map:${mapId}`, async () => {
      const map = this.get(mapId);
      if (!map) {
        throw new Error(`Map with id "${mapId}" not found.`);
      }
      const tokens = (map.tokens || []).filter(
        (token) => tokenIds.has(token.id) === false
      );
      await this._updateMapSettings(map, { tokens });
      return tokenIds;
    });
  }

  async deleteMap(id: string) {
    return await this._processTask(`map:${id}`, async () => {
      const mapIndex = this._maps.findIndex((map) => map.id === id);
      if (mapIndex === -1) {
        throw new Error(`Map with id "${id}" not found.`);
      }
      this._maps.splice(mapIndex, 1);
      await fs.remove(this._buildMapFolderPath(id));
    });
  }
}

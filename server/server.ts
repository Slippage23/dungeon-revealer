import express from "express";
import path from "path";
import favicon from "serve-favicon";
import logger from "morgan";
import bodyParser from "body-parser";
import fs from "fs-extra";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import busboy from "connect-busboy";
import createFilesRouter from "./routes/files";
import createMapRouter from "./routes/map";
import { Maps } from "./maps";
import { Settings } from "./settings";
import { FileStorage } from "./file-storage";
import { createResourceTaskProcessor } from "./util";
import { initialize } from "./database";
import { createSocketSessionStore } from "./socket-session-store";
import { EventEmitter } from "events";
import type { getEnv } from "./env";
import createGraphQLRouter from "./routes/graphql";
import createNotesRouter from "./routes/notes";
import type {
  ErrorRequestHandler,
  RequestHandler,
  Request,
} from "express-serve-static-core";

type RequestWithRole = Request & { role: string | null };
type ErrorWithStatus = Error & { status: number };

export const bootstrapServer = async (env: ReturnType<typeof getEnv>) => {
  fs.mkdirpSync(env.DATA_DIRECTORY);

  const db = await initialize({
    dataPath: env.DATA_DIRECTORY,
    databasePath: path.join(env.DATA_DIRECTORY, `db.sqlite`),
  });

  const app = express();
  const apiRouter = express.Router();
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket.io",
  });

  console.log("[Server] Socket.IO server created");

  const processTask = createResourceTaskProcessor();

  const maps = new Maps({ processTask, dataDirectory: env.DATA_DIRECTORY });
  const settings = new Settings({ dataDirectory: env.DATA_DIRECTORY });
  const fileStorage = new FileStorage({
    dataDirectory: env.DATA_DIRECTORY,
    db,
  });

  app.use(busboy());

  // Not sure if this is needed, Chrome seems to grab the favicon just fine anyway
  // Maybe for cross-browser support
  app.use(logger("dev"));
  app.use(
    favicon(path.resolve(env.PUBLIC_PATH, "images", "icons", "favicon.ico"))
  );

  // Needed to handle JSON posts, size limit of 50mb
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  const getRole = (password: string | null | undefined) => {
    // If no token provided, unauthenticated
    if (!password) return null;

    // Only grant DM role when DM_PASSWORD is configured and matches exactly
    if (env.DM_PASSWORD && password === env.DM_PASSWORD) return "DM";

    // Only grant PC role when PC_PASSWORD is configured and matches exactly
    if (env.PC_PASSWORD && password === env.PC_PASSWORD) return "PC";

    // If neither password matches, return null (unauthenticated)
    return null;
  };

  const authorizationMiddleware: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const authParam = req.query.authorization;
    let token: string | null = null;

    if (authHeader) {
      const parts = req.headers.authorization!.split(" ");
      if (parts.length === 2) token = parts[1];
    } else if (authParam) {
      token = String(authParam);
    }

    (req as RequestWithRole).role = getRole(token);
    next();
  };

  const requiresPcRole: RequestHandler = (req, res, next) => {
    const { role } = req as RequestWithRole;
    if (role === "DM" || role === "PC") {
      next();
      return;
    }

    res.status(401).json({
      data: null,
      error: {
        message: "Unauthenticated Access",
        code: "ERR_UNAUTHENTICATED_ACCESS",
      },
    });
  };

  const requiresDmRole: RequestHandler = (req, res, next) => {
    if ((req as RequestWithRole).role === "DM") {
      next();
      return;
    }
    res.status(401).json({
      data: null,
      error: {
        message: "Unauthenticated Access",
        code: "ERR_UNAUTHENTICATED_ACCESS",
      },
    });
  };

  const roleMiddleware = {
    dm: requiresDmRole,
    pc: requiresPcRole,
  };

  app.use(authorizationMiddleware);

  const emitter = new EventEmitter();

  apiRouter.get("/auth", (req, res) => {
    return res.status(200).json({
      data: {
        role: (req as RequestWithRole).role,
      },
    });
  });

  apiRouter.get("/active-map", requiresPcRole, (req, res) => {
    let activeMap = null;
    const activeMapIdRaw = settings.get("currentMapId");
    // settings.get is typed to accept any key and returns a union of all setting types.
    // Narrow to string at runtime before calling maps.get which expects a string id.
    if (typeof activeMapIdRaw === "string" && activeMapIdRaw.length > 0) {
      activeMap = maps.get(activeMapIdRaw);
    }

    res.status(200).json({
      error: null,
      data: {
        activeMap,
      },
    });
  });

  apiRouter.post("/active-map", requiresDmRole, (req, res) => {
    const mapId = req.body.mapId;
    if (mapId === undefined) {
      res.status(404).json({
        error: {
          message: "Missing param 'mapId' in body.",
          code: "ERR_MISSING_MAP_ID",
        },
      });
      return;
    }

    settings.set("currentMapId", mapId);
    emitter.emit("invalidate", "Query.activeMap");

    res.json({
      error: null,
      data: {
        activeMapId: mapId,
      },
    });
  });

  const { router: mapsRouter } = createMapRouter({
    roleMiddleware,
    maps,
    settings,
    emitter,
  });
  const { router: fileRouter } = createFilesRouter({
    roleMiddleware,
    fileStorage,
  });
  const createManagerRouter = require("./routes/manager");

  const socketSessionStore = createSocketSessionStore();

  const { router: graphqlRouter, socketIOGraphQLServer } = createGraphQLRouter({
    socketServer: io,
    socketSessionStore,
    roleMiddleware,
    db,
    fileStoragePath: path.join(env.DATA_DIRECTORY, "files"),
    publicUrl: env.PUBLIC_URL,
    maps,
    settings,
    emitter,
  });
  const notesImportRouter = createNotesRouter({ db, roleMiddleware });

  apiRouter.use(mapsRouter);
  // apiRouter.use(notesRouter);
  apiRouter.use(fileRouter);
  // Manager routes for bulk upload and stats
  const { router: managerRouter } = createManagerRouter({
    roleMiddleware,
    maps,
    settings,
    fileStorage,
  });
  apiRouter.use(managerRouter);
  app.use(graphqlRouter);
  apiRouter.use(notesImportRouter);

  app.use("/api", apiRouter);

  const indexHtml = path.join(env.PUBLIC_PATH, "index.html");
  const indexHtmlContent = fs
    .readFileSync(indexHtml, "utf-8")
    .replace(/__PUBLIC_URL_PLACEHOLDER__/g, env.PUBLIC_URL)
    .replace(/<base href="\/" \/>/, `<base href="${env.PUBLIC_URL}/" />`);

  app.get("/", (_, res) => {
    res.send(indexHtmlContent);
  });

  app.get("/dm", (_, res) => {
    res.send(indexHtmlContent);
  });

  app.get("/admin", (_, res) => {
    res.send(indexHtmlContent);
  });

  // Consider all URLs under /public/ as static files, and return them raw.
  app.use(
    express.static(path.join(env.PUBLIC_PATH), {
      maxAge: "1y",
    })
  );

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    (err as ErrorWithStatus).status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get("env") === "development") {
    app.use(((err, _, res) => {
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err,
      });
    }) as ErrorRequestHandler);
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(((err, req, res) => {
    console.log(err);
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {},
    });
  }) as ErrorRequestHandler);

  const authenticatedSockets = new Set();

  io.on("connection", (socket) => {
    try {
      console.log(
        `[Socket.IO] New connection from ${socket.handshake.address} ${socket.id}`
      );

      // Session might already be created by socketIOGraphQLServer.getParameter
      let session = socketSessionStore.get(socket);
      if (!session) {
        console.log(`[Socket.IO] Creating session for socket ${socket.id}`);
        socketSessionStore.set(socket, {
          id: socket.id,
          role: "unauthenticated",
        });
      }

      // Add error handler for socket
      socket.on("error", (err) => {
        console.error(`[Socket.IO] Socket error for ${socket.id}:`, err);
      });

      socket.on("authenticate", ({ password, desiredRole }) => {
        console.log(
          `[Socket.IO] Authenticate event received for socket ${socket.id}`
        );
        socketIOGraphQLServer.disposeSocket(socket);
        socket.removeAllListeners();

        const role = getRole(password);
        if (role === null) {
          console.log(
            `[Socket.IO] Authentication failed for ${socket.handshake.address} ${socket.id}`
          );
          return;
        }

        console.log(
          `[Socket.IO] Authenticated ${role} for socket ${socket.id}`
        );

        authenticatedSockets.add(socket);
        socketSessionStore.set(socket, {
          id: socket.id,
          role: role === "DM" ? desiredRole : "user",
        });

        console.log(
          `[Socket.IO] About to register socket ${socket.id} with GraphQL`
        );
        socketIOGraphQLServer.registerSocket(socket);
        console.log(`[Socket.IO] Socket ${socket.id} registered with GraphQL`);

        socket.emit("authenticated");
      });

      socket.once("disconnect", function () {
        console.log(`[Socket.IO] Socket ${socket.id} DISCONNECTED`);
        authenticatedSockets.delete(socket);
      });

      console.log(
        `[Socket.IO] Connection handler complete for socket ${socket.id}`
      );
      console.log(`[Socket.IO] Socket ready for authentication events`);
    } catch (err: unknown) {
      console.error("[Socket.IO] Error in connection handler:", err);
      if (err instanceof Error && err.stack) {
        console.error("[Socket.IO] Stack:", err.stack);
      }
    }
  });
  io.on("error", (err: unknown) => {
    console.error("[Socket.IO] Server error:", err);
    if (err instanceof Error && err.stack) {
      console.error("[Socket.IO] Stack:", err.stack);
    }
  });

  console.log("[Server] bootstrapServer completed successfully");
  return { app, httpServer, io };
};

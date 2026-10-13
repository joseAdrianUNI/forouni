import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";

export function createApp(): Application {
  const app = express();

  // --- Seguridad -------------------------------------------------------
  app.use(helmet());
  app.use(
    cors({
      origin: [
        env.clientOrigin,
        "http://localhost:5173",
        "http://localhost:5174",
      ], // permite los puertos habituales de Vite en desarrollo
      credentials: true,
    }),
  );

  // --- Parseo de body + límites de tamaño (mitiga payloads abusivos) ---
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // --- Healthcheck -------------------------------------------------------
  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Foro UNI API operativa" });
  });

  // --- Rutas versionadas -------------------------------------------------
  app.use("/api/v1", apiRoutes);

  // --- 404 + manejador global de errores (siempre al final) --------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

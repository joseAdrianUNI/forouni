import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { isProduction } from "../config/env";

/** Se coloca al final de todas las rutas para capturar paths inexistentes. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

interface ErrorResponseBody {
  success: false;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Middleware de errores de Express (4 argumentos obligatorios para que
 * Express lo reconozca como error handler).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    const body: ErrorResponseBody = {
      success: false,
      message: err.message,
      details: err.details,
    };
    if (!isProduction) body.stack = err.stack;
    return res.status(err.statusCode).json(body);
  }

  // Errores no controlados (bugs, fallos de DB, etc.)
  // eslint-disable-next-line no-console
  console.error("Error no controlado:", err);

  const body: ErrorResponseBody = {
    success: false,
    message: "Error interno del servidor",
  };
  if (!isProduction && err instanceof Error) body.stack = err.stack;

  return res.status(500).json(body);
}

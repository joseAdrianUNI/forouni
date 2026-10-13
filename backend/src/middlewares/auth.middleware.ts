import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import type { JwtPayload } from "../types/models";

/**
 * Requiere `Authorization: Bearer <token>`. Si es válido, adjunta
 * el payload decodificado en `req.user` para los siguientes middlewares/controllers.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Token de autenticación no proporcionado"));
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = payload;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized("El token ha expirado, inicia sesión de nuevo"));
    }
    return next(ApiError.unauthorized("Token inválido"));
  }
}

/**
 * Igual que `authenticate`, pero no falla si no hay token: útil para rutas
 * públicas que cambian de comportamiento si el usuario está logueado
 * (ej. saber si ya reaccionó a un hilo).
 */
export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    // token inválido en ruta opcional: se ignora, sigue como anónimo
  }
  return next();
}

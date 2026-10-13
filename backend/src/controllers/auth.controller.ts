import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as authService from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, studentId, password } = req.body ?? {};

  if (!fullName || !email || !password) {
    throw ApiError.badRequest("fullName, email y password son obligatorios");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw ApiError.badRequest("La contraseña debe tener al menos 8 caracteres");
  }

  const result = await authService.register({ fullName, email, studentId, password });
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body ?? {};

  if (!identifier || !password) {
    throw ApiError.badRequest("identifier (correo o matrícula) y password son obligatorios");
  }

  const result = await authService.login({ identifier, password });
  res.status(200).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await authService.getProfile(req.user.sub);
  res.status(200).json({ success: true, data: profile });
});

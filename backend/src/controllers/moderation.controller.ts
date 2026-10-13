import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as moderationService from "../services/moderation.service";

/**
 * Todas las rutas de este controller ya están protegidas con
 * `checkRole(["moderator", "admin"])` a nivel de router
 * (ver routes/moderation.routes.ts), así que aquí no hace falta
 * revalidar el rol — solo la lógica de negocio.
 */

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const data = await moderationService.listReports(status);
  res.status(200).json({ success: true, data });
});

export const createReport = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    // Nota: reportar contenido puede quedar abierto a student/professor también;
    // si es así, mueve esta ruta fuera de moderation.routes.ts y solo deja
    // checkRole en las de resolución/gestión.
    const { targetType, targetId, reason } = req.body ?? {};
    const data = await moderationService.createReport({
      reporterId: req.user.sub,
      targetType,
      targetId,
      reason,
    });
    res.status(201).json({ success: true, data });
  },
);

export const resolveReport = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const status = req.body?.status ?? "resolved";
    const data = await moderationService.resolveReport(
      req.params.id,
      req.user,
      status,
    );
    res.status(200).json({ success: true, data });
  },
);

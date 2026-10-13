import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as threadService from "../services/thread.service";

/**
 * Este controller sigue el mismo patrón de auth/category:
 * controller -> service -> repository -> query() de src/config/db.ts.
 * Implementa aquí `thread.service.ts` y `thread.repository.ts` contra
 * la tabla `threads` del schema.sql ya definido (title, content, category_id,
 * author_id, image_url, is_pinned, is_locked, replies_count, reactions_count).
 */

export const listThreads = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const data = await threadService.listThreads({
    categoryId:
      typeof req.query.category === "string" ? req.query.category : undefined,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 20,
  });
  res.status(200).json({ success: true, data });
});

export const getThreadById = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await threadService.getById(req.params.id);
    res.status(200).json({ success: true, data });
  },
);

export const createThread = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { title, content, categoryId, imageUrl } = req.body ?? {};
    if (!title || !content || !categoryId) {
      throw ApiError.badRequest("title, content y categoryId son obligatorios");
    }
    const data = await threadService.create({
      authorId: req.user.sub,
      title,
      content,
      categoryId,
      imageUrl,
    });
    res.status(201).json({ success: true, data });
  },
);

export const updateThread = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const data = await threadService.update(
      req.params.id,
      req.user,
      req.body ?? {},
    );
    res.status(200).json({ success: true, data });
  },
);

export const deleteThread = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await threadService.remove(req.params.id, req.user);
    res.status(204).send();
  },
);

/** Solo moderator/admin (protegido con checkRole en las rutas) */
export const pinThread = asyncHandler(async (req: Request, res: Response) => {
  const data = await threadService.setFlag(req.params.id, "is_pinned", true);
  res.status(200).json({ success: true, data });
});

/** Solo moderator/admin (protegido con checkRole en las rutas) */
export const lockThread = asyncHandler(async (req: Request, res: Response) => {
  const data = await threadService.setFlag(req.params.id, "is_locked", true);
  res.status(200).json({ success: true, data });
});

import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as postService from "../services/post.service";

/** Implementa post.service.ts / post.repository.ts contra la tabla `posts`. */

export const listPostsByThread = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await postService.listByThread(req.params.threadId);
    res.status(200).json({ success: true, data });
  },
);

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { threadId, content, parentPostId, imageUrl } = req.body ?? {};
  if (!threadId || !content) {
    throw ApiError.badRequest("threadId y content son obligatorios");
  }
  const data = await postService.create({
    authorId: req.user.sub,
    threadId,
    content,
    parentPostId,
    imageUrl,
  });
  res.status(201).json({ success: true, data });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const data = await postService.update(
    req.params.id,
    req.user,
    req.body ?? {},
  );
  res.status(200).json({ success: true, data });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await postService.remove(req.params.id, req.user);
  res.status(204).send();
});

export const reactToPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { reactionType } = req.body ?? {};
  const data = await postService.toggleReaction(
    req.user.sub,
    req.params.id,
    reactionType,
  );
  res.status(200).json({ success: true, data });
});

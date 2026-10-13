import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as categoryService from "../services/category.service";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  res.status(200).json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body ?? {});
  res.status(201).json({ success: true, data: category });
});

import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as notificationService from "../services/notification.service";

export const listNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const data = await notificationService.listForUser(req.user.sub);
    res.status(200).json({ success: true, data });
  },
);

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, notificationController.listNotifications);

export default router;

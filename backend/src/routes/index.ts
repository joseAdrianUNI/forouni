import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import threadRoutes from "./thread.routes";
import postRoutes from "./post.routes";
import moderationRoutes from "./moderation.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/threads", threadRoutes);
router.use("/posts", postRoutes);
router.use("/moderation", moderationRoutes);
router.use("/notifications", notificationRoutes);

export default router;

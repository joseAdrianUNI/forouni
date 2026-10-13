import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authenticate, attachUserIfPresent } from "../middlewares/auth.middleware";

const router = Router();

router.get("/thread/:threadId", attachUserIfPresent, postController.listPostsByThread);
router.post("/", authenticate, postController.createPost);
router.patch("/:id", authenticate, postController.updatePost);
router.delete("/:id", authenticate, postController.deletePost);
router.post("/:id/reactions", authenticate, postController.reactToPost);

export default router;

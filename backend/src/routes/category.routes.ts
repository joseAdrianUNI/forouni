import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", categoryController.listCategories); // pública

router.post(
  "/",
  authenticate,
  checkRole(["moderator", "admin"]),
  categoryController.createCategory
);

export default router;

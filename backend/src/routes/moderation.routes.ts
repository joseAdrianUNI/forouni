import { Router } from "express";
import * as moderationController from "../controllers/moderation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

// Cualquier usuario autenticado puede reportar contenido.
router.post("/reports", authenticate, moderationController.createReport);

// Consultar y resolver reportes requiere permisos de moderación.
router.use(authenticate, checkRole(["moderator", "admin"]));

router.get("/reports", moderationController.listReports);
router.patch("/reports/:id/resolve", moderationController.resolveReport);

export default router;

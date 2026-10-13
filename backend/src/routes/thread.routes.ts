import { Router } from "express";
import * as threadController from "../controllers/thread.controller";
import { authenticate, attachUserIfPresent } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

// Lectura pública (attachUserIfPresent permite personalizar la respuesta
// si el visitante está logueado, sin exigirlo)
router.get("/", attachUserIfPresent, threadController.listThreads);
router.get("/:id", attachUserIfPresent, threadController.getThreadById);

// Cualquier usuario autenticado (student, professor, moderator, admin) puede publicar
router.post("/", authenticate, threadController.createThread);

// El autor edita el suyo; la verificación fina (autor vs. moderador) vive en el service
router.patch("/:id", authenticate, threadController.updateThread);
router.delete("/:id", authenticate, threadController.deleteThread);

// Exclusivo de moderación
router.patch(
  "/:id/pin",
  authenticate,
  checkRole(["moderator", "admin"]),
  threadController.pinThread
);
router.patch(
  "/:id/lock",
  authenticate,
  checkRole(["moderator", "admin"]),
  threadController.lockThread
);

export default router;

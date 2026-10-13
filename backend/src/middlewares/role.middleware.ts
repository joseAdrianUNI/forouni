import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import type { UserRole } from "../types/models";

/**
 * Debe usarse DESPUÉS de `authenticate`. Verifica que req.user.role
 * esté dentro de los roles permitidos para la ruta.
 *
 * Uso:
 *   router.patch("/:id/pin", authenticate, checkRole(["moderator", "admin"]), pinThread);
 */
export function checkRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("No autenticado"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Se requiere alguno de estos roles: ${allowedRoles.join(", ")}`
        )
      );
    }

    return next();
  };
}

/**
 * Permite la acción si el usuario es el dueño del recurso (comparando ownerId)
 * O si tiene un rol de moderación. Útil para "editar/eliminar mi propio hilo,
 * o cualquier hilo si soy moderador/admin".
 */
export function isOwnerOrRole(ownerId: string, allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("No autenticado"));
    }

    const isOwner = req.user.sub === ownerId;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return next(ApiError.forbidden("No puedes modificar contenido de otro usuario"));
    }

    return next();
  };
}

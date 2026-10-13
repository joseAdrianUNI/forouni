import type { JwtPayload } from "./models";

declare global {
  namespace Express {
    interface Request {
      /** Adjuntado por auth.middleware.ts tras validar el JWT */
      user?: JwtPayload;
    }
  }
}

export {};

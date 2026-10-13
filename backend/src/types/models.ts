export type UserRole = "student" | "professor" | "moderator" | "admin";

/** Roles con permisos de moderación (fijar, bloquear, eliminar contenido ajeno). */
export const MODERATOR_ROLES: UserRole[] = ["moderator", "admin"];

/** Fila cruda de la tabla `users` (incluye password_hash, nunca se expone al cliente). */
export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  student_id: string | null;
  password_hash: string;
  role: UserRole;
  avatar_url: string | null;
  is_banned: boolean;
  created_at: Date;
}

/** Datos públicos del usuario, seguros para devolver en la API. */
export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  studentId: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  studentId?: string;
  password: string;
}

/** El login acepta email o matrícula en el mismo campo (ver Login.tsx). */
export interface LoginInput {
  identifier: string;
  password: string;
}

/** Payload embebido en el JWT firmado. */
export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    studentId: user.student_id,
    role: user.role,
    avatarUrl: user.avatar_url,
  };
}

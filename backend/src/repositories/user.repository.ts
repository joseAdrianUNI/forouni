import { query } from "../config/db";
import type { RegisterInput, UserRecord } from "../types/models";

/**
 * Busca un usuario por email O por matrícula (student_id), tal como
 * requiere el login de Login.tsx ("Correo electrónico / Matrícula").
 */
export async function findByIdentifier(identifier: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRecord>(
    `select * from users where email = $1 or student_id = $1 limit 1`,
    [identifier]
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRecord>(`select * from users where id = $1 limit 1`, [id]);
  return rows[0] ?? null;
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRecord>(`select * from users where email = $1 limit 1`, [
    email,
  ]);
  return rows[0] ?? null;
}

export async function createUser(
  input: RegisterInput & { passwordHash: string }
): Promise<UserRecord> {
  const { rows } = await query<UserRecord>(
    `insert into users (full_name, email, student_id, password_hash, role)
     values ($1, $2, $3, $4, 'student')
     returning *`,
    [input.fullName, input.email, input.studentId ?? null, input.passwordHash]
  );
  return rows[0];
}

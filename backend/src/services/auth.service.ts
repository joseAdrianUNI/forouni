import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import * as userRepository from "../repositories/user.repository";
import {
  toPublicUser,
  type JwtPayload,
  type LoginInput,
  type PublicUser,
  type RegisterInput,
} from "../types/models";

const SALT_ROUNDS = 10;

function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export async function register(
  input: RegisterInput
): Promise<{ user: PublicUser; token: string }> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw ApiError.conflict("Ya existe una cuenta con ese correo electrónico");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const created = await userRepository.createUser({ ...input, passwordHash });

  const token = signToken({ sub: created.id, role: created.role });
  return { user: toPublicUser(created), token };
}

export async function login(
  input: LoginInput
): Promise<{ user: PublicUser; token: string }> {
  const user = await userRepository.findByIdentifier(input.identifier);
  if (!user) {
    throw ApiError.unauthorized("Credenciales inválidas");
  }

  if (user.is_banned) {
    throw ApiError.forbidden("Esta cuenta ha sido suspendida");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Credenciales inválidas");
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound("Usuario no encontrado");
  return toPublicUser(user);
}

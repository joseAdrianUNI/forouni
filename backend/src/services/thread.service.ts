import { ApiError } from "../utils/ApiError";
import type { JwtPayload, UserRole } from "../types/models";
import * as threadRepository from "../repositories/thread.repository";

const moderatorRoles: UserRole[] = ["moderator", "admin"];

function toThread(record: threadRepository.ThreadRecord) {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    excerpt: record.content.slice(0, 160),
    category: record.category_name,
    categoryId: record.category_id,
    author: record.author_name,
    authorId: record.author_id,
    imageUrl: record.image_url,
    isPinned: record.is_pinned,
    isLocked: record.is_locked,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    repliesCount: record.replies_count,
    reactionsCount: record.reactions_count,
  };
}

function canManage(user: JwtPayload, authorId: string) {
  return user.sub === authorId || moderatorRoles.includes(user.role);
}

export async function listThreads(input: {
  categoryId?: string;
  page: number;
  limit: number;
}) {
  const limit = Math.min(Math.max(input.limit, 1), 50);
  const page = Math.max(input.page, 1);
  const rows = await threadRepository.findAll({
    categoryId: input.categoryId,
    limit,
    offset: (page - 1) * limit,
  });
  return { items: rows.map(toThread), page, limit };
}

export async function getById(id: string) {
  const thread = await threadRepository.findById(id);
  if (!thread) throw ApiError.notFound("Hilo no encontrado");
  return toThread(thread);
}

export async function create(input: {
  authorId: string;
  title: string;
  content: string;
  categoryId: string;
  imageUrl?: string;
}) {
  if (input.title.length > 120)
    throw ApiError.badRequest("El título no puede superar 120 caracteres");
  if (!(await threadRepository.categoryExists(input.categoryId))) {
    throw ApiError.badRequest("La categoría no existe");
  }
  return toThread(await threadRepository.create(input));
}

export async function update(
  id: string,
  user: JwtPayload,
  input: {
    title?: string;
    content?: string;
    categoryId?: string;
    imageUrl?: string | null;
  },
) {
  const current = await threadRepository.findById(id);
  if (!current) throw ApiError.notFound("Hilo no encontrado");
  if (!canManage(user, current.author_id)) throw ApiError.forbidden();
  if (
    input.categoryId &&
    !(await threadRepository.categoryExists(input.categoryId))
  ) {
    throw ApiError.badRequest("La categoría no existe");
  }
  return toThread(await threadRepository.update(id, input));
}

export async function remove(id: string, user: JwtPayload) {
  const current = await threadRepository.findById(id);
  if (!current) throw ApiError.notFound("Hilo no encontrado");
  if (!canManage(user, current.author_id)) throw ApiError.forbidden();
  await threadRepository.remove(id);
}

export async function setFlag(
  id: string,
  field: "is_pinned" | "is_locked",
  value: boolean,
) {
  const thread = await threadRepository.setFlag(id, field, value);
  if (!thread) throw ApiError.notFound("Hilo no encontrado");
  return toThread(thread);
}

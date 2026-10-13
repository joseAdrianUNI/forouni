import { ApiError } from "../utils/ApiError";
import type { JwtPayload, UserRole } from "../types/models";
import * as postRepository from "../repositories/post.repository";

const moderatorRoles: UserRole[] = ["moderator", "admin"];

function toPost(record: postRepository.PostRecord) {
  return {
    id: record.id,
    threadId: record.thread_id,
    authorId: record.author_id,
    author: record.author_name,
    parentPostId: record.parent_post_id,
    content: record.content,
    imageUrl: record.image_url,
    reactionsCount: record.reactions_count,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function canManage(user: JwtPayload, authorId: string) {
  return user.sub === authorId || moderatorRoles.includes(user.role);
}

export async function listByThread(threadId: string) {
  const thread = await postRepository.threadExistsAndIsLocked(threadId);
  if (!thread.exists) throw ApiError.notFound("Hilo no encontrado");
  return (await postRepository.findByThread(threadId)).map(toPost);
}

export async function create(input: {
  threadId: string;
  authorId: string;
  content: string;
  parentPostId?: string;
  imageUrl?: string;
}) {
  const thread = await postRepository.threadExistsAndIsLocked(input.threadId);
  if (!thread.exists) throw ApiError.notFound("Hilo no encontrado");
  if (thread.locked) throw ApiError.forbidden("El hilo está bloqueado");
  if (!input.content.trim())
    throw ApiError.badRequest("El contenido es obligatorio");
  return toPost(await postRepository.create(input));
}

export async function update(
  id: string,
  user: JwtPayload,
  input: { content?: string; imageUrl?: string | null },
) {
  const current = await postRepository.findById(id);
  if (!current) throw ApiError.notFound("Respuesta no encontrada");
  if (!canManage(user, current.author_id)) throw ApiError.forbidden();
  if (input.content !== undefined && !input.content.trim()) {
    throw ApiError.badRequest("El contenido es obligatorio");
  }
  const updated = await postRepository.update(id, input);
  if (!updated) throw ApiError.notFound("Respuesta no encontrada");
  return toPost(updated);
}

export async function remove(id: string, user: JwtPayload) {
  const current = await postRepository.findById(id);
  if (!current) throw ApiError.notFound("Respuesta no encontrada");
  if (!canManage(user, current.author_id)) throw ApiError.forbidden();
  await postRepository.remove(id);
}

export async function toggleReaction(
  userId: string,
  postId: string,
  reactionType: string,
) {
  if (!reactionType?.trim())
    throw ApiError.badRequest("reactionType es obligatorio");
  const post = await postRepository.findById(postId);
  if (!post) throw ApiError.notFound("Respuesta no encontrada");
  return postRepository.toggleReaction(userId, postId, reactionType);
}

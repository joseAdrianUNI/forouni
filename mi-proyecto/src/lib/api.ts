const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1"
).replace(/\/$/, "");
const TOKEN_KEY = "foro_uni_token";
const USER_KEY = "foro_uni_user";

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  studentId?: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthResult {
  user: PublicUser;
  token: string;
}

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export interface ApiThread {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  categoryId: string;
  author: string;
  authorId?: string;
  imageUrl: string | null;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  repliesCount: number;
  reactionsCount: number;
}

export interface ApiPost {
  id: string;
  threadId: string;
  authorId: string;
  author: string;
  parentPostId: string | null;
  content: string;
  imageUrl: string | null;
  reactionsCount: number;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = (await response.json().catch(() => ({}))) as Partial<
    ApiResponse<T>
  >;
  if (!response.ok) {
    throw new Error(body.message ?? "No se pudo completar la solicitud");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return body.data as T;
}

function saveSession(token: string, user: PublicUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): PublicUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getCurrentUser()?.role === "admin";
}

export async function login(
  identifier: string,
  password: string,
): Promise<AuthResult> {
  const result = await request<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  saveSession(result.token, result.user);
  return result;
}

export async function register(input: {
  fullName: string;
  email: string;
  studentId: string;
  password: string;
}): Promise<AuthResult> {
  const result = await request<AuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveSession(result.token, result.user);
  return result;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasSession() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export async function listCategories() {
  return request<ApiCategory[]>("/categories");
}

export async function listThreads(categoryId?: string) {
  const query = categoryId ? `?category=${encodeURIComponent(categoryId)}` : "";
  return request<{ items: ApiThread[]; page: number; limit: number }>(
    `/threads${query}`,
  );
}

export async function getThread(id: string) {
  return request<ApiThread>(`/threads/${id}`);
}

export async function createThread(input: {
  title: string;
  content: string;
  categoryId: string;
  imageUrl?: string;
}) {
  return request<ApiThread>("/threads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateThread(
  id: string,
  input: {
    title?: string;
    content?: string;
    categoryId?: string;
    imageUrl?: string | null;
  },
) {
  return request<ApiThread>(`/threads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteThread(id: string) {
  return request<void>(`/threads/${id}`, { method: "DELETE" });
}

export async function listPostsByThread(threadId: string) {
  return request<ApiPost[]>(`/posts/thread/${threadId}`);
}

export async function createPost(input: {
  threadId: string;
  content: string;
  parentPostId?: string;
  imageUrl?: string;
}) {
  return request<ApiPost>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePost(
  id: string,
  input: { content?: string; imageUrl?: string | null },
) {
  return request<ApiPost>(`/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deletePost(id: string) {
  return request<void>(`/posts/${id}`, { method: "DELETE" });
}

export interface ApiReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  target_type: "thread" | "post";
  target_id: string;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export async function listReports(
  status?: "pending" | "resolved" | "rejected",
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<ApiReport[]>(`/moderation/reports${query}`);
}

export async function createReport(input: {
  targetType: "thread" | "post";
  targetId: string;
  reason: string;
}) {
  return request<ApiReport>("/moderation/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface ApiNotification {
  id: string;
  type: "reply" | "like" | "report_resolved" | "report_rejected";
  actor_id: string | null;
  actor_name: string | null;
  target_type: "thread" | "post";
  target_id: string;
  target_title: string | null;
  message: string;
  created_at: string;
}

export async function listNotifications() {
  return request<ApiNotification[]>("/notifications");
}

export async function resolveReport(
  id: string,
  status: "resolved" | "rejected",
) {
  return request<ApiReport>(`/moderation/reports/${id}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function createCategory(input: {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}) {
  return request<ApiCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

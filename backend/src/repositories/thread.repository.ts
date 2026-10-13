import { query } from "../config/db";

export interface ThreadRecord {
  id: string;
  title: string;
  content: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  author_id: string;
  author_name: string;
  image_url: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  replies_count: number;
  reactions_count: number;
  created_at: Date;
  updated_at: Date;
}

const selectFields = `
  t.id, t.title, t.content, t.category_id, c.slug as category_slug,
  c.name as category_name, t.author_id, u.full_name as author_name,
  t.image_url, t.is_pinned, t.is_locked, t.replies_count,
  t.reactions_count, t.created_at, t.updated_at
`;

export async function findAll(input: {
  categoryId?: string;
  limit: number;
  offset: number;
}): Promise<ThreadRecord[]> {
  const params: unknown[] = [];
  const filters: string[] = [];
  if (input.categoryId) {
    params.push(input.categoryId);
    filters.push(`t.category_id = $${params.length}`);
  }
  params.push(input.limit, input.offset);
  const where = filters.length ? `where ${filters.join(" and ")}` : "";
  const { rows } = await query<ThreadRecord>(
    `select ${selectFields}
     from threads t
     join categories c on c.id = t.category_id
     join users u on u.id = t.author_id
     ${where}
     order by t.is_pinned desc, t.created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );
  return rows;
}

export async function findById(id: string): Promise<ThreadRecord | null> {
  const { rows } = await query<ThreadRecord>(
    `select ${selectFields}
     from threads t
     join categories c on c.id = t.category_id
     join users u on u.id = t.author_id
     where t.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function categoryExists(id: string): Promise<boolean> {
  const result = await query("select 1 from categories where id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function create(input: {
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  imageUrl?: string;
}): Promise<ThreadRecord> {
  const { rows } = await query<{ id: string }>(
    `insert into threads (title, content, category_id, author_id, image_url)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [
      input.title,
      input.content,
      input.categoryId,
      input.authorId,
      input.imageUrl ?? null,
    ],
  );
  const thread = await findById(rows[0].id);
  if (!thread) throw new Error("No se pudo recuperar el hilo creado");
  return thread;
}

export async function update(
  id: string,
  input: {
    title?: string;
    content?: string;
    categoryId?: string;
    imageUrl?: string | null;
  },
): Promise<ThreadRecord> {
  const { rows } = await query<{ id: string }>(
    `update threads
     set title = coalesce($2, title), content = coalesce($3, content),
         category_id = coalesce($4, category_id), image_url = $5,
         updated_at = now()
     where id = $1
     returning id`,
    [
      id,
      input.title ?? null,
      input.content ?? null,
      input.categoryId ?? null,
      input.imageUrl ?? null,
    ],
  );
  const thread = rows[0] ? await findById(rows[0].id) : null;
  if (!thread) throw new Error("No se pudo actualizar el hilo");
  return thread;
}

export async function remove(id: string): Promise<boolean> {
  const result = await query("delete from threads where id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function setFlag(
  id: string,
  field: "is_pinned" | "is_locked",
  value: boolean,
): Promise<ThreadRecord | null> {
  const { rows } = await query<{ id: string }>(
    `update threads set ${field} = $2, updated_at = now()
     where id = $1 returning id`,
    [id, value],
  );
  return rows[0] ? findById(rows[0].id) : null;
}

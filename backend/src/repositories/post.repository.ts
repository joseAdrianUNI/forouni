import { pool, query } from "../config/db";

export interface PostRecord {
  id: string;
  thread_id: string;
  author_id: string;
  author_name: string;
  parent_post_id: string | null;
  content: string;
  image_url: string | null;
  reactions_count: number;
  created_at: Date;
  updated_at: Date;
}

const selectFields = `
  p.id, p.thread_id, p.author_id, u.full_name as author_name,
  p.parent_post_id, p.content, p.image_url, p.reactions_count,
  p.created_at, p.updated_at
`;

export async function findByThread(threadId: string): Promise<PostRecord[]> {
  const { rows } = await query<PostRecord>(
    `select ${selectFields}
     from posts p join users u on u.id = p.author_id
     where p.thread_id = $1
     order by p.created_at asc`,
    [threadId],
  );
  return rows;
}

export async function findById(id: string): Promise<PostRecord | null> {
  const { rows } = await query<PostRecord>(
    `select ${selectFields}
     from posts p join users u on u.id = p.author_id
     where p.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function threadExistsAndIsLocked(
  threadId: string,
): Promise<{ exists: boolean; locked: boolean }> {
  const { rows } = await query<{ is_locked: boolean }>(
    "select is_locked from threads where id = $1",
    [threadId],
  );
  return { exists: rows.length > 0, locked: rows[0]?.is_locked ?? false };
}

export async function create(input: {
  threadId: string;
  authorId: string;
  content: string;
  parentPostId?: string;
  imageUrl?: string;
}): Promise<PostRecord> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ id: string }>(
      `insert into posts (thread_id, author_id, content, parent_post_id, image_url)
       values ($1, $2, $3, $4, $5) returning id`,
      [
        input.threadId,
        input.authorId,
        input.content,
        input.parentPostId ?? null,
        input.imageUrl ?? null,
      ],
    );
    await client.query(
      "update threads set replies_count = replies_count + 1, updated_at = now() where id = $1",
      [input.threadId],
    );
    await client.query("commit");
    const post = await findById(rows[0].id);
    if (!post) throw new Error("No se pudo recuperar la respuesta creada");
    return post;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function update(
  id: string,
  input: { content?: string; imageUrl?: string | null },
) {
  const { rows } = await query<{ id: string }>(
    `update posts set content = coalesce($2, content), image_url = $3,
       updated_at = now() where id = $1 returning id`,
    [id, input.content ?? null, input.imageUrl ?? null],
  );
  return rows[0] ? findById(rows[0].id) : null;
}

export async function remove(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ thread_id: string }>(
      "delete from posts where id = $1 returning thread_id",
      [id],
    );
    if (!rows[0]) {
      await client.query("rollback");
      return false;
    }
    await client.query(
      "update threads set replies_count = greatest(replies_count - 1, 0), updated_at = now() where id = $1",
      [rows[0].thread_id],
    );
    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function toggleReaction(
  userId: string,
  postId: string,
  reactionType: string,
) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const existing = await client.query<{ id: string }>(
      `select id from reactions where user_id = $1 and target_type = 'post' and target_id = $2 for update`,
      [userId, postId],
    );
    let active: boolean;
    if (existing.rows[0]) {
      await client.query("delete from reactions where id = $1", [
        existing.rows[0].id,
      ]);
      await client.query(
        "update posts set reactions_count = greatest(reactions_count - 1, 0) where id = $1",
        [postId],
      );
      active = false;
    } else {
      await client.query(
        `insert into reactions (user_id, target_type, target_id, reaction_type)
         values ($1, 'post', $2, $3)`,
        [userId, postId, reactionType],
      );
      await client.query(
        "update posts set reactions_count = reactions_count + 1 where id = $1",
        [postId],
      );
      active = true;
    }
    const count = await client.query<{ reactions_count: number }>(
      "select reactions_count from posts where id = $1",
      [postId],
    );
    await client.query("commit");
    return { active, reactionsCount: count.rows[0]?.reactions_count ?? 0 };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

import { query } from "../config/db";

export interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export async function findAll(): Promise<CategoryRecord[]> {
  const { rows } = await query<CategoryRecord>(
    `select id, slug, name, description, icon, display_order
     from categories
     order by display_order asc`
  );
  return rows;
}

export async function create(input: {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}): Promise<CategoryRecord> {
  const { rows } = await query<CategoryRecord>(
    `insert into categories (slug, name, description, icon)
     values ($1, $2, $3, $4)
     returning id, slug, name, description, icon, display_order`,
    [input.slug, input.name, input.description ?? null, input.icon ?? null]
  );
  return rows[0];
}

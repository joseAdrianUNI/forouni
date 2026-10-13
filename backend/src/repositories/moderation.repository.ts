import { query } from "../config/db";

export interface ReportRecord {
  id: string;
  reporter_id: string;
  reporter_name: string;
  target_type: "thread" | "post";
  target_id: string;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  resolved_by: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

export async function findById(id: string): Promise<ReportRecord | null> {
  const { rows } = await query<ReportRecord>(
    `select r.id, r.reporter_id, u.full_name as reporter_name, r.target_type,
            r.target_id, r.reason, r.status, r.resolved_by, r.resolved_at,
            r.created_at
     from reports r
     join users u on u.id = r.reporter_id
     where r.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findAll(
  status?: ReportRecord["status"],
): Promise<ReportRecord[]> {
  const params: unknown[] = [];
  const filter = status ? "where r.status = $1" : "";
  if (status) params.push(status);
  const { rows } = await query<ReportRecord>(
    `select r.id, r.reporter_id, u.full_name as reporter_name, r.target_type,
            r.target_id, r.reason, r.status, r.resolved_by, r.resolved_at,
            r.created_at
     from reports r
     join users u on u.id = r.reporter_id
     ${filter}
     order by r.created_at desc`,
    params,
  );
  return rows;
}

export async function targetExists(
  targetType: "thread" | "post",
  targetId: string,
) {
  const table = targetType === "thread" ? "threads" : "posts";
  const result = await query(`select 1 from ${table} where id = $1`, [
    targetId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function create(input: {
  reporterId: string;
  targetType: "thread" | "post";
  targetId: string;
  reason: string;
}) {
  const { rows } = await query<ReportRecord>(
    `insert into reports (reporter_id, target_type, target_id, reason)
     values ($1, $2, $3, $4)
     returning id, reporter_id, target_type, target_id, reason, status,
               resolved_by, resolved_at, created_at`,
    [input.reporterId, input.targetType, input.targetId, input.reason],
  );
  return rows[0];
}

export async function resolve(
  id: string,
  resolvedBy: string,
  status: "resolved" | "rejected",
) {
  const { rows } = await query<ReportRecord>(
    `update reports
     set status = $2, resolved_by = $3, resolved_at = now()
     where id = $1
     returning id, reporter_id, target_type, target_id, reason, status,
               resolved_by, resolved_at, created_at`,
    [id, status, resolvedBy],
  );
  return rows[0] ?? null;
}

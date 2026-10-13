import { query } from "../config/db";

export interface NotificationRecord {
  id: string;
  type: "reply" | "like" | "report_resolved" | "report_rejected";
  actor_id: string | null;
  actor_name: string | null;
  target_type: "thread" | "post";
  target_id: string;
  target_title: string | null;
  message: string;
  created_at: Date;
}

export async function findForUser(
  userId: string,
): Promise<NotificationRecord[]> {
  const { rows } = await query<NotificationRecord>(
    `select *
     from (
       select 'reply'::text as type, p.id, p.author_id as actor_id,
              u.full_name as actor_name, 'thread'::text as target_type,
              p.thread_id as target_id, t.title as target_title,
              u.full_name || ' respondió a tu hilo "' || t.title || '"' as message,
              p.created_at
       from posts p
       join users u on u.id = p.author_id
       join threads t on t.id = p.thread_id
       where t.author_id = $1 and p.author_id <> $1

       union all

       select 'like'::text as type, r.id, r.user_id as actor_id,
              u.full_name as actor_name, r.target_type::text as target_type,
              r.target_id, coalesce(t.title, 'Comentario') as target_title,
              u.full_name || ' indicó que le gusta tu ' ||
                case when r.target_type = 'thread' then 'hilo' else 'comentario' end as message,
              r.created_at
       from reactions r
       join users u on u.id = r.user_id
       left join posts p on r.target_type = 'post' and p.id = r.target_id
       left join threads t on r.target_type = 'thread' and t.id = r.target_id
       where r.user_id <> $1
         and ((r.target_type = 'post' and p.author_id = $1)
           or (r.target_type = 'thread' and t.author_id = $1))

       union all

       select case when r.status = 'resolved' then 'report_resolved' else 'report_rejected' end,
              r.id, r.resolved_by as actor_id, moderator.full_name as actor_name,
              r.target_type::text, r.target_id, null::text,
              case when r.status = 'resolved'
                then 'Tu reporte fue resuelto y el contenido fue retirado'
                else 'Tu reporte fue revisado y rechazado'
              end,
              r.resolved_at
       from reports r
       left join users moderator on moderator.id = r.resolved_by
       where r.reporter_id = $1 and r.status <> 'pending'
     ) notifications
     order by created_at desc
     limit 100`,
    [userId],
  );
  return rows;
}

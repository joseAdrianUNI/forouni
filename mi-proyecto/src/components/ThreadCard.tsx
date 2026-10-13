import { Link } from "react-router-dom";
import { MessageSquare, Heart, ImageOff, Clock } from "lucide-react";
import type { Thread } from "../types/forum";

interface ThreadCardProps {
  thread: Thread;
}

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  const {
    id,
    title,
    excerpt,
    category,
    imageUrl,
    author,
    createdAt,
    repliesCount,
    reactionsCount,
  } = thread;

  return (
    <Link
      to={`/hilo/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Miniatura */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {/* Badge de categoría */}
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
          style={{
            backgroundColor: "var(--color-primary)",
            fontFamily: "Poppins-Regular, sans-serif",
          }}
        >
          {category}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="line-clamp-2 text-sm leading-snug sm:text-base"
          style={{
            fontFamily: "Montserrat-Bold, sans-serif",
            color: "var(--color-primary-dark)",
          }}
        >
          {title}
        </h3>

        {excerpt && (
          <p className="line-clamp-2 text-xs text-gray-500 sm:text-sm">
            {excerpt}
          </p>
        )}

        <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
          <span className="truncate font-medium" style={{ color: "var(--color-secondary)" }}>
            {author}
          </span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{timeAgo(createdAt)}</span>
        </div>

        {/* Footer: respuestas y reacciones */}
        <div className="mt-2 flex items-center gap-4 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" style={{ color: "var(--color-secondary)" }} />
            {repliesCount} respuestas
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" style={{ color: "var(--color-secondary)" }} />
            {reactionsCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

import { useState } from "react";
import type { ApiPost } from "../lib/api";

interface PostProps {
  post: ApiPost;
  onEdit?: (post: ApiPost) => void;
  onDelete?: (postId: string) => void;
  onSave?: (postId: string, content: string) => Promise<void>;
  onReport?: () => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Post({ post, onEdit, onDelete, onSave, onReport }: PostProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
    setDraft(post.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !onSave) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(post.id, trimmed);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(post.content);
    setIsEditing(false);
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[color:var(--color-primary-dark)]">
            {post.author}
          </p>
          <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
        </div>

        {(onEdit || onDelete || onSave || onReport) && (
          <div className="flex items-center gap-2">
            {(onEdit || onSave) && !isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Editar
              </button>
            )}
            {onDelete && !isEditing && (
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            )}
            {onReport && !isEditing && (
              <button
                type="button"
                onClick={onReport}
                className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
              >
                Reportar
              </button>
            )}
          </div>
        )}
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Imagen adjunta"
          className="mb-3 h-52 w-full rounded-xl object-cover"
        />
      )}

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[color:var(--color-primary-dark)] outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !draft.trim()}
              className="rounded-lg bg-[color:var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {post.content}
        </p>
      )}
    </article>
  );
}

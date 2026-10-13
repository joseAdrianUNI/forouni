import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Edit3, Flag, MessageSquare, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Post from "../../components/Post";
import ReportDialog from "../../components/ReportDialog";
import {
  createPost,
  deletePost,
  deleteThread,
  getThread,
  listPostsByThread,
  type ApiPost,
  type ApiThread,
  updatePost,
} from "../../lib/api";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<ApiThread | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingThread, setDeletingThread] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    targetType: "thread" | "post";
    targetId: string;
  } | null>(null);
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [threadData, threadPosts] = await Promise.all([
        getThread(id),
        listPostsByThread(id),
      ]);
      setThread(threadData);
      setPosts(threadPosts);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo cargar el hilo.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [id]);

  const handleDeleteThread = async () => {
    if (!id) return;

    try {
      setDeletingThread(true);
      await deleteThread(id);
      navigate("/");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo eliminar el hilo.",
      );
    } finally {
      setDeletingThread(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo eliminar la respuesta.",
      );
    }
  };

  const handleUpdatePost = async (postId: string, content: string) => {
    try {
      const updatedPost = await updatePost(postId, { content });
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? { ...post, content: updatedPost.content } : post,
        ),
      );
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo guardar la respuesta.",
      );
      throw requestError;
    }
  };

  const handleCreateReply = async () => {
    if (!id || !replyDraft.trim()) return;

    try {
      setIsPostingReply(true);
      const created = await createPost({
        threadId: id,
        content: replyDraft.trim(),
      });
      setPosts((currentPosts) => [...currentPosts, created]);
      setReplyDraft("");
      setError(null);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo publicar la respuesta.",
      );
    } finally {
      setIsPostingReply(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <p className="text-sm text-gray-500">Cargando hilo...</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-4 text-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <p className="text-sm text-red-600">{error ?? "No se pudo encontrar el hilo."}</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full px-4 py-8 sm:px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-primary-dark)] transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <article className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-[color:var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[color:var(--color-primary)]">
              {thread.category}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/editar/${thread.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </Link>
              <button
                type="button"
                onClick={handleDeleteThread}
                disabled={deletingThread}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deletingThread ? "Eliminando..." : "Eliminar"}
              </button>
              <button
                type="button"
                onClick={() => setReportTarget({ targetType: "thread", targetId: thread.id })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
              >
                <Flag className="h-4 w-4" />
                Reportar
              </button>
            </div>
          </div>

          <h1
            className="mb-3 text-2xl sm:text-3xl"
            style={{
              fontFamily: "Montserrat-Bold, sans-serif",
              color: "var(--color-primary)",
            }}
          >
            {thread.title}
          </h1>

          <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="font-medium text-[color:var(--color-secondary)]">{thread.author}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(thread.createdAt)}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              {thread.repliesCount} respuestas
            </span>
          </div>

          {thread.imageUrl && (
            <img
              src={thread.imageUrl}
              alt={thread.title}
              className="mb-6 h-72 w-full rounded-2xl object-cover"
            />
          )}

          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-base leading-8 text-gray-700">
            {thread.content}
          </div>
        </article>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-xl"
              style={{
                fontFamily: "Montserrat-Bold, sans-serif",
                color: "var(--color-primary-dark)",
              }}
            >
              Respuestas
            </h2>
            <span className="text-sm text-gray-500">{posts.length} en total</span>
          </div>

          {reportNotice && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {reportNotice}
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label
              htmlFor="reply"
              className="mb-2 block text-sm font-medium text-[color:var(--color-primary-dark)]"
            >
              Escribe una respuesta
            </label>
            <textarea
              id="reply"
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              rows={4}
              placeholder="Comparte tu opinión, duda o aporte..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[color:var(--color-primary-dark)] outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCreateReply}
                disabled={isPostingReply || !replyDraft.trim()}
                className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPostingReply ? "Publicando..." : "Responder"}
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-8 text-center text-sm text-gray-500">
              Aún no hay respuestas para este hilo.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  onSave={handleUpdatePost}
                  onReport={() => setReportTarget({ targetType: "post", targetId: post.id })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {reportTarget && (
        <ReportDialog
          targetType={reportTarget.targetType}
          targetId={reportTarget.targetId}
          onClose={() => setReportTarget(null)}
          onSubmitted={() => {
            setReportTarget(null);
            setReportNotice("Tu reporte fue enviado para revisión.");
          }}
        />
      )}
    </div>
  );
}

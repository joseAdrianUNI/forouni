import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Save, Trash2, AlertTriangle } from "lucide-react";
import {
  deleteThread,
  getThread,
  listCategories,
  type ApiCategory,
  type ApiThread,
  updateThread,
} from "../../lib/api";

interface EditPostForm {
  title: string;
  category: string;
  content: string;
}

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<ApiThread | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [formData, setFormData] = useState<EditPostForm>({
    title: "",
    category: "",
    content: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let active = true;

    Promise.all([listCategories(), getThread(id)])
      .then(([categoryList, threadData]) => {
        if (!active) return;

        setCategories(categoryList);
        setThread(threadData);
        setFormData({
          title: threadData.title,
          category: threadData.categoryId || categoryList[0]?.id || "",
          content: threadData.content,
        });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudo cargar la publicación.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!id) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("El título y el contenido no pueden estar vacíos.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateThread(id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.category,
      });
      navigate(`/hilo/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await deleteThread(id);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el hilo.",
      );
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <p className="text-sm text-gray-500">Cargando publicación...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-4 text-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <ImageOff className="h-10 w-10 text-gray-400" />
        <p className="text-sm" style={{ color: "var(--color-primary-dark)" }}>
          No se encontró la publicación que intentas editar.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
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
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium transition hover:underline"
          style={{ color: "var(--color-primary-dark)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl"
              style={{
                fontFamily: "Montserrat-Bold, sans-serif",
                color: "var(--color-primary)",
              }}
            >
              Editar publicación
            </h1>
            <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
              Los cambios se aplicarán a este hilo inmediatamente.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-primary-dark)" }}
              >
                Título
              </label>
              <input
                id="title"
                name="title"
                type="text"
                maxLength={120}
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[color:var(--color-primary-dark)] outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-primary-dark)" }}
              >
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[color:var(--color-primary-dark)] outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label
                htmlFor="content"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-primary-dark)" }}
              >
                Contenido
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[color:var(--color-primary-dark)] outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
              />
            </div>

            {thread.imageUrl && (
              <div className="mb-6">
                <span
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--color-primary-dark)" }}
                >
                  Imagen actual
                </span>
                <img
                  src={thread.imageUrl}
                  alt={thread.title}
                  className="h-48 w-full rounded-xl border border-gray-200 object-cover"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: "var(--color-primary)",
                  fontFamily: "Montserrat-Bold, sans-serif",
                }}
              >
                {isSubmitting ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Eliminar hilo</h2>
            </div>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. ¿Quieres continuar?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Send, X } from "lucide-react";
import { createThread, listCategories } from "../../lib/api";

interface CreateThreadForm {
  title: string;
  category: string;
  content: string;
}

export default function CreateThread() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateThreadForm>({
    title: "",
    category: "",
    content: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    listCategories()
      .then((items) => {
        setCategories(items);
        setFormData((current) => ({
          ...current,
          category: current.category || items[0]?.id || "",
        }));
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar las categorías.");
      });
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyImageFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }
    setError(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    applyImageFile(e.target.files?.[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    applyImageFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("El título y el contenido son obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createThread({
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.category,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar el hilo.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="mb-6">
          <h1
            className="text-2xl"
            style={{
              fontFamily: "Montserrat-Bold, sans-serif",
              color: "var(--color-primary)",
            }}
          >
            Crear nuevo hilo
          </h1>
          <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
            Comparte una duda, un recurso o inicia una discusión
          </p>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* Título */}
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
                placeholder="Ej. ¿Alguien tiene apuntes de Física II?"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
              />
              <span className="mt-1 block text-right text-xs text-gray-400">
                {formData.title.length}/120
              </span>
            </div>

            {/* Categoría */}
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

            {/* Contenido */}
            <div className="mb-5">
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
                placeholder="Escribe los detalles de tu publicación..."
                value={formData.content}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
              />
            </div>

            {/* Imagen (drag & drop) */}
            <div className="mb-6">
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-primary-dark)" }}
              >
                Imagen (opcional)
              </label>

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="Quitar imagen"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                    isDragging
                      ? "border-[color:var(--color-primary)] bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <ImagePlus className="h-7 w-7 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Arrastra una imagen aquí o{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      selecciona un archivo
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG o WEBP — máx. 5MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: "var(--color-primary)",
                fontFamily: "Montserrat-Bold, sans-serif",
              }}
            >
              {isSubmitting ? (
                "Publicando..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publicar hilo
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

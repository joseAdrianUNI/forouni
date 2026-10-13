import { useEffect, useMemo, useState } from "react";
import { Plus, Flame, Clock3, MessageSquareOff } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ThreadCard from "../../components/ThreadCard";
import type { Category, Thread } from "../../types/forum";
import { listCategories, listThreads } from "../../lib/api";

interface HomeProps {
  onLogout?: () => void;
}

type FilterKey = "recientes" | "populares" | "sin-respuestas";

const FILTERS: { key: FilterKey; label: string; icon: typeof Flame }[] = [
  { key: "recientes", label: "Recientes", icon: Clock3 },
  { key: "populares", label: "Populares", icon: Flame },
  { key: "sin-respuestas", label: "Sin respuestas", icon: MessageSquareOff },
];

export default function Home({ onLogout }: HomeProps) {
  const [searchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get("category") ?? undefined;
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("recientes");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    Promise.all([listThreads(selectedCategoryId), listCategories()])
      .then(([threadResponse, categoryResponse]) => {
        if (cancelled) return;

        setThreads(
          threadResponse.items.map((thread) => ({
            ...thread,
            imageUrl: thread.imageUrl ?? undefined,
          })),
        );
        setCategories(
          categoryResponse.map((category) => ({
            id: category.id,
            name: category.name,
            threadCount: 0,
          })),
        );
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "No se pudo cargar el foro.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  const filteredThreads = useMemo(() => {
    const list = [...threads];
    if (activeFilter === "populares") {
      return list.sort((a, b) => b.reactionsCount - a.reactionsCount);
    }
    if (activeFilter === "sin-respuestas") {
      return list.filter((t) => t.repliesCount === 0);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeFilter, threads]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onLogout={onLogout}
      />

      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          categories={categories}
        />

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 lg:px-8">
          {/* Encabezado de la vista */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1
                className="text-xl sm:text-2xl"
                style={{
                  fontFamily: "Montserrat-Bold, sans-serif",
                  color: "var(--color-primary)",
                }}
              >
                Catálogo de hilos
              </h1>
              <p
                className="text-sm"
                style={{ color: "var(--color-secondary)" }}
              >
                {selectedCategoryId
                  ? `Hilos de ${categories.find((category) => category.id === selectedCategoryId)?.name ?? "la categoría seleccionada"}`
                  : "Lo que se está discutiendo ahora mismo en el foro"}
              </p>
            </div>

            <Link
              to="/crear-hilo"
              className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex"
              style={{
                backgroundColor: "var(--color-primary)",
                fontFamily: "Montserrat-Bold, sans-serif",
              }}
            >
              <Plus className="w-4 h-4" />
              Crear hilo
            </Link>
          </div>

          {/* Filtros */}
          <div className="mb-5 flex items-center gap-2 overflow-x-auto rounded-xl bg-white/70 p-1.5 backdrop-blur-sm">
            {selectedCategoryId && (
              <Link
                to="/"
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-[color:var(--color-primary-dark)] hover:bg-white"
              >
                Todas las categorías
              </Link>
            )}
            {FILTERS.map(({ key, label, icon: Icon }) => {
              const active = activeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "text-white shadow-sm"
                      : "text-[color:var(--color-primary-dark)] hover:bg-white"
                  }`}
                  style={active ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Feed / catálogo */}
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : filteredThreads.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 py-16 text-center">
              <MessageSquareOff className="mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">
                No hay hilos que coincidan con este filtro todavía.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Botón flotante "Crear hilo" (móvil) */}
      <Link
        to="/crear-hilo"
        aria-label="Crear hilo"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition hover:opacity-90 sm:hidden"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}

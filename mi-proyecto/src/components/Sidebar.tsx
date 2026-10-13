import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  User,
  Bell,
  Hash,
  X,
  Flame,
} from "lucide-react";
import type { Category } from "../types/forum";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

const mainLinks = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/categorias", label: "Categorías", icon: Layers },
  { to: "/perfil", label: "Mi perfil", icon: User },
  { to: "/notificaciones", label: "Notificaciones", icon: Bell },
];

export default function Sidebar({ isOpen, onClose, categories }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform border-r border-gray-200 bg-white pt-16 transition-transform duration-200 ease-in-out
        lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--color-primary-dark)" }}
          >
            Menú
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <nav className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {mainLinks.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "text-white"
                        : "text-[color:var(--color-primary-dark)] hover:bg-gray-100"
                    }`}
                    style={active ? { backgroundColor: "var(--color-primary)" } : undefined}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 mb-2 flex items-center gap-1.5 px-3">
            <Flame className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "var(--color-secondary)" }}
            >
              Categorías
            </span>
          </div>

          <ul className="space-y-1 pb-4">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/?category=${encodeURIComponent(cat.id)}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-[color:var(--color-primary-dark)] transition hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Hash className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400">{cat.threadCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

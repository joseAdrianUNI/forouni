import { Link } from "react-router-dom";
import { GraduationCap, Menu, Bell, Plus, Search, LogOut, ShieldCheck } from "lucide-react";
import SearchBar from "./SearchBar";
import { isAdmin } from "../lib/api";

interface NavbarProps {
  onToggleSidebar: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  onToggleSidebar,
  onLogout,
}: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-3 sm:px-6">
        {/* Toggle sidebar (móvil) + logo */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-[color:var(--color-secondary)] transition hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span
            className="hidden sm:block text-lg"
            style={{
              fontFamily: "Montserrat-Bold, sans-serif",
              color: "var(--color-primary)",
            }}
          >
            Foro UNI
          </span>
        </Link>

        {/* Buscador central */}
        <div className="hidden flex-1 md:flex md:max-w-xl md:mx-auto">
          <SearchBar />
        </div>

        {/* Acciones derecha */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Buscar"
            className="rounded-lg p-2 text-[color:var(--color-secondary)] transition hover:bg-gray-100 md:hidden"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to="/crear-hilo"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{
              backgroundColor: "var(--color-primary)",
              fontFamily: "Montserrat-Bold, sans-serif",
            }}
          >
            <Plus className="w-4 h-4" />
            Crear hilo
          </Link>

          <Link
            to="/notificaciones"
            aria-label="Notificaciones"
            className="rounded-lg p-2 text-[color:var(--color-secondary)] transition hover:bg-gray-100"
          >
            <Bell className="w-5 h-5" />
          </Link>

          {isAdmin() && (
            <Link
              to="/admin"
              aria-label="Dashboard de administración"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <Link
            to="/perfil"
            aria-label="Perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary-light)" }}
          >
            U
          </Link>

          {onLogout && (
            <button
              type="button"
              aria-label="Cerrar sesión"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

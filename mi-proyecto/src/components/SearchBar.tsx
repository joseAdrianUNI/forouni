import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "Buscar hilos, categorías o usuarios...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="w-4.5 h-4.5" style={{ color: "var(--color-secondary)" }} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[color:var(--color-primary)]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}

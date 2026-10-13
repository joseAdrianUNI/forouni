import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { createReport } from "../lib/api";

interface ReportDialogProps {
  targetType: "thread" | "post";
  targetId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const reasons = [
  "Contenido ofensivo o acosador",
  "Spam o publicidad",
  "Información falsa o engañosa",
  "Contenido inapropiado",
  "Otro motivo",
];

export default function ReportDialog({
  targetType,
  targetId,
  onClose,
  onSubmitted,
}: ReportDialogProps) {
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const completeReason = details.trim() ? `${reason}: ${details.trim()}` : reason;

    try {
      setIsSubmitting(true);
      setError(null);
      await createReport({ targetType, targetId, reason: completeReason });
      onSubmitted();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo enviar el reporte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Moderación</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">Reportar contenido</h2>
            <p className="mt-1 text-sm text-gray-500">El equipo de moderación revisará tu reporte.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="report-reason" className="mb-1.5 block text-sm font-medium text-gray-700">Motivo</label>
            <select
              id="report-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
            >
              {reasons.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="report-details" className="mb-1.5 block text-sm font-medium text-gray-700">Detalles adicionales (opcional)</label>
            <textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Explica brevemente qué debería revisar el moderador."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
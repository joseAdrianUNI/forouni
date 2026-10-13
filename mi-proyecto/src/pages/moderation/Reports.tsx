import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { listReports, resolveReport, type ApiReport } from "../../lib/api";

const filters = [
	{ key: "all", label: "Todos" },
	{ key: "pending", label: "Pendientes" },
	{ key: "resolved", label: "Resueltos" },
	{ key: "rejected", label: "Rechazados" },
] as const;

export default function Reports() {
	const [reports, setReports] = useState<ApiReport[]>([]);
	const [status, setStatus] = useState<(typeof filters)[number]["key"]>("all");
	const [loading, setLoading] = useState(true);

	const loadReports = async (nextStatus?: (typeof filters)[number]["key"]) => {
		try {
			const items = await listReports(
				nextStatus && nextStatus !== "all" ? nextStatus : undefined,
			);
			setReports(items);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadReports(status);
	}, [status]);

	const handleResolve = async (id: string, nextStatus: "resolved" | "rejected") => {
		await resolveReport(id, nextStatus);
		await loadReports(status);
	};

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<p className="text-sm text-slate-500">Moderación</p>
					<h2 className="text-2xl font-bold text-slate-900">Reportes</h2>
				</div>

				<div className="flex flex-wrap gap-2">
					{filters.map((filter) => (
						<button
							key={filter.key}
							type="button"
							onClick={() => setStatus(filter.key)}
							className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
								status === filter.key
									? "bg-indigo-600 text-white"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							}`}
						>
							{filter.label}
						</button>
					))}
				</div>
			</div>

			{loading ? (
				<p className="text-sm text-slate-500">Cargando reportes…</p>
			) : reports.length === 0 ? (
				<div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
					<AlertTriangle className="h-4 w-4" />
					No hay reportes en este filtro.
				</div>
			) : (
				<div className="space-y-3">
					{reports.map((report) => (
						<article
							key={report.id}
							className="rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
						>
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div>
									<div className="mb-2 flex items-center gap-2">
										<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
											{report.target_type === "thread" ? "Hilo" : "Comentario"}
										</span>
										<span
											className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
												report.status === "pending"
													? "bg-amber-100 text-amber-700"
													: report.status === "resolved"
														? "bg-emerald-100 text-emerald-700"
														: "bg-slate-200 text-slate-700"
											}`}
										>
											{report.status === "pending"
												? "Pendiente"
												: report.status === "resolved"
													? "Resuelto"
													: "Rechazado"}
										</span>
									</div>

									<p className="font-semibold text-slate-900">{report.reason}</p>
									<p className="mt-1 text-sm text-slate-500">
										Reportado por <span className="font-medium text-slate-700">{report.reporter_name}</span> · {new Date(report.created_at).toLocaleDateString("es-ES")}
									</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<Link
										to={`/admin/reportes/${report.id}`}
										className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
									>
										Ver detalle
									</Link>

									{report.status === "pending" && (
										<>
											<button
												type="button"
												onClick={() => void handleResolve(report.id, "resolved")}
												className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
											>
												<CheckCircle2 className="h-4 w-4" />
												Resolver
											</button>
											<button
												type="button"
												onClick={() => void handleResolve(report.id, "rejected")}
												className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-500"
											>
												<XCircle className="h-4 w-4" />
												Rechazar
											</button>
										</>
									)}
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}

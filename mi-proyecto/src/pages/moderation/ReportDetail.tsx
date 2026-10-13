import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { listReports, resolveReport, type ApiReport } from "../../lib/api";

export default function ReportDetail() {
	const { id } = useParams();
	const [report, setReport] = useState<ApiReport | null>(null);
	const [loading, setLoading] = useState(true);

	const loadReport = async () => {
		if (!id) return;
		try {
			const reports = await listReports();
			setReport(reports.find((item) => item.id === id) ?? null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadReport();
	}, [id]);

	const handleResolve = async (status: "resolved" | "rejected") => {
		if (!report) return;
		await resolveReport(report.id, status);
		await loadReport();
	};

	if (loading) {
		return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">Cargando detalle…</div>;
	}

	if (!report) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-slate-500">No se encontró el reporte solicitado.</p>
				<Link to="/admin/reportes" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
					<ArrowLeft className="h-4 w-4" />
					Volver a reportes
				</Link>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between gap-3">
				<div>
					<p className="text-sm text-slate-500">Detalle del reporte</p>
					<h2 className="text-2xl font-bold text-slate-900">#{report.id.slice(0, 8)}</h2>
				</div>
				<Link to="/admin/reportes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
					<ArrowLeft className="h-4 w-4" />
					Regresar
				</Link>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
				<section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
					<div className="mb-4 flex items-center gap-3">
						<div className="rounded-xl bg-amber-100 p-2">
							<ShieldAlert className="h-5 w-5 text-amber-700" />
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.22em] text-slate-500">Motivo</p>
							<h3 className="text-xl font-bold text-slate-900">{report.reason}</h3>
						</div>
					</div>

					<dl className="space-y-3 text-sm text-slate-600">
						<div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
							<dt>Reportado por</dt>
							<dd className="font-medium text-slate-800">{report.reporter_name}</dd>
						</div>
						<div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
							<dt>Tipo</dt>
							<dd className="font-medium text-slate-800">{report.target_type === "thread" ? "Hilo" : "Comentario"}</dd>
						</div>
						<div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
							<dt>Target ID</dt>
							<dd className="font-medium text-slate-800">{report.target_id}</dd>
						</div>
						<div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
							<dt>Estado</dt>
							<dd className="font-medium text-slate-800">
								{report.status === "pending"
									? "Pendiente"
									: report.status === "resolved"
										? "Resuelto"
										: "Rechazado"}
							</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt>Fecha</dt>
							<dd className="font-medium text-slate-800">{new Date(report.created_at).toLocaleString("es-ES")}</dd>
						</div>
					</dl>
				</section>

				<section className="rounded-2xl border border-slate-200 p-5">
					<h3 className="text-lg font-bold text-slate-900">Acciones</h3>
					<div className="mt-4 space-y-3">
						<button
							type="button"
							onClick={() => void handleResolve("resolved")}
							disabled={report.status !== "pending"}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<CheckCircle2 className="h-4 w-4" />
							Resolver reporte
						</button>
						<button
							type="button"
							onClick={() => void handleResolve("rejected")}
							disabled={report.status !== "pending"}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<XCircle className="h-4 w-4" />
							Rechazar reporte
						</button>
					</div>
				</section>
			</div>
		</div>
	);
}

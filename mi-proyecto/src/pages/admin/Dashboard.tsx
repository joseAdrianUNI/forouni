import { useEffect, useState } from "react";
import { ArrowRight, FileText, FolderOpen, MessageSquareText, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { listCategories, listReports, listThreads } from "../../lib/api";

interface DashboardSummary {
	totalThreads: number;
	totalCategories: number;
	pendingReports: number;
	resolvedReports: number;
}

export default function Dashboard() {
	const [summary, setSummary] = useState<DashboardSummary>({
		totalThreads: 0,
		totalCategories: 0,
		pendingReports: 0,
		resolvedReports: 0,
	});
	const [recentReports, setRecentReports] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		async function loadSummary() {
			try {
				const [threadsResponse, categories, reports] = await Promise.all([
					listThreads(),
					listCategories(),
					listReports(),
				]);

				if (!active) return;

				setSummary({
					totalThreads: threadsResponse.items.length,
					totalCategories: categories.length,
					pendingReports: reports.filter((report) => report.status === "pending").length,
					resolvedReports: reports.filter((report) => report.status === "resolved").length,
				});
				setRecentReports(reports.slice(0, 5));
			} finally {
				if (active) setLoading(false);
			}
		}

		void loadSummary();

		return () => {
			active = false;
		};
	}, []);

	const metricCards = [
		{
			label: "Hilos",
			value: summary.totalThreads,
			icon: MessageSquareText,
			accent: "bg-indigo-100 text-indigo-700",
		},
		{
			label: "Categorías",
			value: summary.totalCategories,
			icon: FolderOpen,
			accent: "bg-emerald-100 text-emerald-700",
		},
		{
			label: "Reportes pendientes",
			value: summary.pendingReports,
			icon: ShieldAlert,
			accent: "bg-amber-100 text-amber-700",
		},
		{
			label: "Reportes resueltos",
			value: summary.resolvedReports,
			icon: FileText,
			accent: "bg-sky-100 text-sky-700",
		},
	];

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm font-medium text-slate-500">Resumen general</p>
						<h2 className="text-2xl font-bold text-slate-900">Dashboard administrativo</h2>
					</div>
					<Link
						to="/admin/reportes"
						className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
					>
						Revisar reportes
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metricCards.map(({ label, value, icon: Icon, accent }) => (
					<div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500">{label}</p>
								<h3 className="mt-2 text-3xl font-bold text-slate-900">{loading ? "…" : value}</h3>
							</div>
							<div className={`rounded-xl p-2.5 ${accent}`}>
								<Icon className="h-5 w-5" />
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-bold text-slate-900">Reportes recientes</h3>
					<Link to="/admin/reportes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
						Ver todos
					</Link>
				</div>

				<div className="mt-4 space-y-3">
					{recentReports.length === 0 ? (
						<p className="text-sm text-slate-500">No hay reportes recientes.</p>
					) : (
						recentReports.map((report) => (
							<Link
								key={report.id}
								to={`/admin/reportes/${report.id}`}
								className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<p className="font-semibold text-slate-800">{report.reason}</p>
									<p className="text-sm text-slate-500">
										{report.reporter_name} · {report.target_type === "thread" ? "Hilo" : "Comentario"}
									</p>
								</div>
								<span
									className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
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
							</Link>
						))
					)}
				</div>
			</div>
		</div>
	);
}

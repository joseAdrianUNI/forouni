import { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, Heart, MessageCircle, RefreshCw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { listNotifications, type ApiNotification } from "../../lib/api";

function formatDate(date: string) {
	return new Date(date).toLocaleString("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function notificationLabel(type: ApiNotification["type"]) {
	if (type === "reply") return "Respuesta";
	if (type === "like") return "Like";
	if (type === "report_resolved") return "Reporte atendido";
	return "Reporte rechazado";
}

function NotificationIcon({ type }: { type: ApiNotification["type"] }) {
	if (type === "reply") return <MessageCircle className="h-5 w-5" />;
	if (type === "like") return <Heart className="h-5 w-5" />;
	if (type === "report_resolved") return <CheckCircle2 className="h-5 w-5" />;
	return <XCircle className="h-5 w-5" />;
}

function notificationColors(type: ApiNotification["type"]) {
	if (type === "reply") return "bg-sky-100 text-sky-700";
	if (type === "like") return "bg-rose-100 text-rose-700";
	if (type === "report_resolved") return "bg-emerald-100 text-emerald-700";
	return "bg-slate-200 text-slate-700";
}

export default function Notifications() {
	const [notifications, setNotifications] = useState<ApiNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadNotifications = async () => {
		try {
			setLoading(true);
			setError(null);
			setNotifications(await listNotifications());
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar las notificaciones.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadNotifications();
	}, []);

	return (
		<div className="min-h-screen px-4 py-8 sm:px-6" style={{ backgroundColor: "var(--color-background)" }}>
			<main className="mx-auto max-w-5xl">
				<Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-primary-dark)] hover:underline">
					<ArrowLeft className="h-4 w-4" />
					Volver al foro
				</Link>

				<section className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur-sm sm:p-8">
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<div className="rounded-xl bg-[color:var(--color-primary-light)] p-2.5 text-[color:var(--color-primary)]">
								<Bell className="h-5 w-5" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-[color:var(--color-primary)]">Notificaciones</h1>
								<p className="text-sm text-gray-500">Respuestas, likes y resultados de tus reportes.</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => void loadNotifications()}
							disabled={loading}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
						>
							<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
							Actualizar
						</button>
					</div>

					{error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

					{loading ? (
						<p className="py-10 text-center text-sm text-gray-500">Cargando notificaciones...</p>
					) : notifications.length === 0 ? (
						<div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
							Todavía no tienes notificaciones.
						</div>
					) : (
						<div className="overflow-hidden rounded-xl border border-gray-200">
							<div className="hidden grid-cols-[auto_1fr_auto] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 sm:grid">
								<span>Tipo</span>
								<span>Actividad</span>
								<span>Fecha</span>
							</div>
							<div className="divide-y divide-gray-200">
								{notifications.map((notification) => (
									<div key={`${notification.type}-${notification.id}`} className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4">
										<div className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${notificationColors(notification.type)}`}>
											<NotificationIcon type={notification.type} />
											{notificationLabel(notification.type)}
										</div>
										<div>
											<p className="text-sm font-medium text-gray-800">{notification.message}</p>
											{notification.target_title && <p className="mt-1 truncate text-xs text-gray-500">{notification.target_title}</p>}
										</div>
										<time className="text-xs text-gray-400">{formatDate(notification.created_at)}</time>
									</div>
								))}
							</div>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

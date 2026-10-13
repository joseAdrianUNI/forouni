import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Home, LogOut, ShieldCheck, LayoutDashboard, Users as UsersIcon, FolderKanban, AlertTriangle } from "lucide-react";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Categories from "../pages/admin/Categories";
import Reports from "../pages/moderation/Reports";
import ReportDetail from "../pages/moderation/ReportDetail";

interface AdminLayoutProps {
	onLogout: () => void;
}

const navItems = [
	{ to: "/admin", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/admin/usuarios", label: "Usuarios", icon: UsersIcon },
	{ to: "/admin/categorias", label: "Categorías", icon: FolderKanban },
	{ to: "/admin/reportes", label: "Reportes", icon: AlertTriangle },
];

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
	return (
		<div className="min-h-screen bg-slate-100 text-slate-800">
			<div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
				<aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
					<div className="flex items-center gap-3 border-b border-slate-200 pb-4">
						<div className="rounded-xl bg-indigo-100 p-2">
							<ShieldCheck className="h-5 w-5 text-indigo-700" />
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
								Panel
							</p>
							<h1 className="text-lg font-bold text-slate-900">Admin</h1>
						</div>
					</div>

					<nav className="mt-6 space-y-2">
						{navItems.map(({ to, label, icon: Icon }) => (
							<NavLink
								key={to}
								to={to}
								end={to === "/admin"}
								className={({ isActive }) =>
									`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
										isActive
											? "bg-indigo-600 text-white shadow-sm"
											: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
									}`
								}
							>
								<Icon className="h-4 w-4" />
								{label}
							</NavLink>
						))}
					</nav>

					<Link
						to="/"
						className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
					>
						<Home className="h-4 w-4" />
						Volver al inicio
					</Link>

					<button
						type="button"
						onClick={onLogout}
						className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
					>
						<LogOut className="h-4 w-4" />
						Cerrar sesión
					</button>
				</aside>

				<main className="flex-1">
					<header className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
									Panel
								</p>
								<h1 className="text-lg font-bold text-slate-900">Admin</h1>
							</div>
							<button
								type="button"
								onClick={onLogout}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
							>
								<LogOut className="h-4 w-4" />
								Salir
							</button>
						</div>

						<nav className="mt-4 grid grid-cols-2 gap-2">
							{navItems.map(({ to, label, icon: Icon }) => (
								<NavLink
									key={to}
									to={to}
									end={to === "/admin"}
									className={({ isActive }) =>
										`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
											isActive
												? "bg-indigo-600 text-white"
												: "bg-slate-100 text-slate-600"
										}`
									}
								>
									<Icon className="h-4 w-4" />
									{label}
								</NavLink>
							))}
						</nav>

						<Link
							to="/"
							className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
						>
							<Home className="h-4 w-4" />
							Volver al inicio
						</Link>
					</header>

					<Routes>
						<Route index element={<Dashboard />} />
						<Route path="usuarios" element={<Users />} />
						<Route path="categorias" element={<Categories />} />
						<Route path="reportes" element={<Reports />} />
						<Route path="reportes/:id" element={<ReportDetail />} />
						<Route path="*" element={<Navigate to="/admin" replace />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}

import { getCurrentUser } from "../../lib/api";

const users = [
	{
		name: "Administrador",
		role: "admin",
		email: "admin@uni.edu",
		status: "Activo",
	},
	{
		name: "Moderador",
		role: "moderator",
		email: "moderador@uni.edu",
		status: "Activo",
	},
	{
		name: "Profesor",
		role: "professor",
		email: "profesor@uni.edu",
		status: "Activo",
	},
];

export default function Users() {
	const currentUser = getCurrentUser();
	const items = [
		{
			name: currentUser?.fullName ?? users[0].name,
			role: currentUser?.role ?? users[0].role,
			email: currentUser?.email ?? users[0].email,
			status: "Activo",
		},
		...users.filter((user) => user.email !== (currentUser?.email ?? users[0].email)),
	];

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<div>
					<p className="text-sm text-slate-500">Gestión</p>
					<h2 className="text-2xl font-bold text-slate-900">Usuarios</h2>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border border-slate-200">
				<table className="min-w-full divide-y divide-slate-200 text-left text-sm">
					<thead className="bg-slate-50 text-slate-600">
						<tr>
							<th className="px-4 py-3 font-semibold">Usuario</th>
							<th className="px-4 py-3 font-semibold">Rol</th>
							<th className="px-4 py-3 font-semibold">Correo</th>
							<th className="px-4 py-3 font-semibold">Estado</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 bg-white">
						{items.map((user) => (
							<tr key={`${user.email}-${user.role}`} className="hover:bg-slate-50">
								<td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
										{user.role}
									</span>
								</td>
								<td className="px-4 py-3 text-slate-600">{user.email}</td>
								<td className="px-4 py-3">
									<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
										{user.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

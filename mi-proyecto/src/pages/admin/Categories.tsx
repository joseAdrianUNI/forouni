import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { createCategory, listCategories, type ApiCategory } from "../../lib/api";

const emptyForm = {
	slug: "",
	name: "",
	description: "",
};

export default function Categories() {
	const [categories, setCategories] = useState<ApiCategory[]>([]);
	const [form, setForm] = useState(emptyForm);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadCategories = async () => {
		const items = await listCategories();
		setCategories(items);
	};

	useEffect(() => {
		void loadCategories();
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (!form.slug.trim() || !form.name.trim()) {
			setError("Slug y nombre son obligatorios.");
			return;
		}

		try {
			setIsSaving(true);
			await createCategory({
				slug: form.slug.trim(),
				name: form.name.trim(),
				description: form.description.trim() || undefined,
			});
			setForm(emptyForm);
			await loadCategories();
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
			<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="mb-5 flex items-center gap-3">
					<div className="rounded-xl bg-emerald-100 p-2">
						<FolderKanban className="h-5 w-5 text-emerald-700" />
					</div>
					<div>
						<p className="text-sm text-slate-500">Administración</p>
						<h2 className="text-2xl font-bold text-slate-900">Categorías</h2>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm font-medium text-slate-700">Slug</label>
						<input
							value={form.slug}
							onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
							className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
							placeholder="ej. software"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
						<input
							value={form.name}
							onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
							className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
							placeholder="Software"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
						<textarea
							value={form.description}
							onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
							rows={4}
							className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white"
							placeholder="Descripción breve de la categoría"
						/>
					</div>

					{error && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
					)}

					<button
						type="submit"
						disabled={isSaving}
						className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<Plus className="h-4 w-4" />
						{isSaving ? "Creando..." : "Crear categoría"}
					</button>
				</form>
			</section>

			<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h3 className="text-lg font-bold text-slate-900">Categorías existentes</h3>

				<div className="mt-4 space-y-3">
					{categories.length === 0 ? (
						<p className="text-sm text-slate-500">Todavía no hay categorías creadas.</p>
					) : (
						categories.map((category) => (
							<div key={category.id} className="rounded-xl border border-slate-200 p-4">
								<div className="flex items-center justify-between gap-3">
									<div>
										<h4 className="font-semibold text-slate-900">{category.name}</h4>
										<p className="text-xs uppercase tracking-[0.18em] text-slate-500">/{category.slug}</p>
									</div>
									<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
										#{category.display_order ?? 0}
									</span>
								</div>
								{category.description && <p className="mt-2 text-sm text-slate-600">{category.description}</p>}
							</div>
						))
					)}
				</div>
			</section>
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import {
  Folder,
  Plus,
  Search,
  ArrowRight,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export default function CategoriesPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) setError(error.message);

      setCategories(data || []);
      setLoading(false);
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [supabase, reloadKey]);

  function closeModal() {
    setModal(false);
    setError("");
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      description: description.trim() || null,
      user_id: user.id,
    });

    if (error) {
      setError(error.message);
    } else {
      setModal(false);
      setName("");
      setDescription("");
      setReloadKey((key) => key + 1);
    }

    setSaving(false);
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("Delete this category and all its liquidation records?")) {
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setCategories((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const filtered = categories.filter((item) =>
    `${item.name} ${item.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AppShell
      title="Categories"
      description="Organize your liquidation records"
    >
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">My Categories</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create categories to organize your financial records.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          <Plus size={18} />
          Create Category
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border bg-white px-4">
        <Search size={19} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full py-3 text-sm outline-none"
        />
      </div>

      {error && !modal && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto animate-spin text-green-700" />
          <p className="mt-3 text-sm text-gray-400">Loading categories...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white px-5 py-16 text-center">
          <Folder className="mx-auto text-gray-300" size={42} />
          <h3 className="mt-4 font-bold">
            {search ? "No matching categories" : "No categories yet"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first category to start recording liquidation entries.
          </p>
          {!search && (
            <button
              onClick={() => setModal(true)}
              className="mt-5 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white"
            >
              Create Your First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-green-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-green-50 p-3 text-green-700">
                  <Folder size={23} />
                </div>

                <button
                  onClick={() => deleteCategory(category.id)}
                  aria-label="Delete category"
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <h3 className="mt-5 text-lg font-bold">{category.name}</h3>

              <p className="mt-2 min-h-10 text-sm text-gray-500">
                {category.description || "No description provided."}
              </p>

              <p className="mt-3 text-xs text-gray-400">
                Created {new Date(category.created_at).toLocaleDateString()}
              </p>

              <Link
                href={`/categories/${category.id}`}
                className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-semibold text-green-700 hover:text-green-900"
              >
                Open Category
                <ArrowRight size={17} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Create Category</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a new liquidation category.
                </p>
              </div>

              <button onClick={closeModal} aria-label="Close">
                <X className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={createCategory} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category Name
                </label>
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Office Expenses"
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this category..."
                  className="w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-3 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
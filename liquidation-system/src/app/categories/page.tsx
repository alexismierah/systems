"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import {
  Folder,
  Plus,
  Search,
  ArrowUpRight,
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

const inputClass =
  "w-full rounded-md border border-transparent bg-[#f4f5f6] px-4 py-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100";

const primaryButton =
  "flex items-center justify-center gap-2 rounded-md bg-[#262626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50";

// Soft icon colors, cycled across the cards
const tones = [
  { bg: "bg-[#dff3e5]", fg: "text-[#3f9e5f]" },
  { bg: "bg-[#e3ebff]", fg: "text-[#2f5de8]" },
  { bg: "bg-[#fdf0dc]", fg: "text-[#d9922f]" },
  { bg: "bg-[#ece8fb]", fg: "text-[#6f5bd6]" },
];

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

  function openModal() {
    setError("");
    setModal(true);
  }

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
      <div className="text-[#1f1f1f]">
        {/* Page header */}
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b6f76]">
          Categories
        </p>

        <h1 className="mt-4 text-[34px] font-medium leading-tight tracking-[-0.025em] sm:text-[44px]">
          My Categories
        </h1>
        <p className="mt-3 text-[15px] text-[#6b6f76]">
          Create categories to organize your financial records.
        </p>

        {/* Toolbar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-md items-center gap-2.5 rounded-lg border border-[#e7e8ea] bg-white px-3.5 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100">
            <Search size={17} className="text-[#8b8f96]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {error && !modal && (
          <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto animate-spin text-[#262626]" />
            <p className="mt-3 text-sm text-[#8b8f96]">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <button
            onClick={openModal}
            className="mt-8 flex min-h-[340px] w-full flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed border-[#1f1f1f] bg-white p-6 text-[#1f1f1f] transition hover:bg-[#fafafa]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#e7e8ea]">
              <Plus size={26} strokeWidth={1.5} />
            </span>
            <span className="text-[15px] font-semibold">Create Category</span>
          </button>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-[20px] border border-dashed border-[#d9dbdf] bg-white px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f2f4]">
              <Folder className="text-[#8b8f96]" size={28} />
            </div>
            <h3 className="mt-5 text-[19px] font-semibold">
              No matching categories
            </h3>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 min-[1400px]:grid-cols-3">
            {filtered.map((category, index) => {
              const tone = tones[index % tones.length];

              return (
                <div
                  key={category.id}
                  className="group relative flex min-w-0 flex-col rounded-[20px] border border-[#e7e8ea] bg-white p-6 transition hover:border-[#cfd1d6] hover:shadow-[0_16px_40px_-24px_rgba(20,20,40,0.25)]"
                >
                  {/* Whole card opens the category */}
                  <Link
                    href={`/categories/${category.id}`}
                    aria-label={`Open ${category.name}`}
                    className="absolute inset-0 rounded-[20px]"
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-[52px] w-[52px] items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}
                    >
                      <Folder size={22} />
                    </div>

                    <button
                      onClick={() => deleteCategory(category.id)}
                      aria-label="Delete category"
                      className="relative z-10 rounded-lg p-2 text-[#b5b8be] transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <h3 className="mt-6 truncate text-[20px] font-semibold tracking-[-0.01em]">
                    {category.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-[40px] text-sm text-[#6b6f76]">
                    {category.description || "No description provided."}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#f0f0f2] pt-4">
                    <p className="text-xs text-[#8b8f96]">
                      Created{" "}
                      {new Date(category.created_at).toLocaleDateString()}
                    </p>

                    <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                      Open Category
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f2f4] transition group-hover:bg-[#262626] group-hover:text-white">
                        <ArrowUpRight size={14} />
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add tile */}
            {!search && (
              <button
                onClick={openModal}
                className="flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-[#d9dbdf] bg-[#fafafa] p-6 text-[#6b6f76] transition hover:border-[#262626] hover:bg-white hover:text-[#1f1f1f]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#e7e8ea]">
                  <Plus size={20} />
                </span>
                <span className="text-sm font-semibold">Create Category</span>
              </button>
            )}
          </div>
        )}

        {/* Create category modal */}
        {modal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ececef] bg-white p-7 shadow-[0_24px_60px_-20px_rgba(20,20,40,0.25)]">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em]">
                    Create Category
                  </h3>
                  <p className="mt-1.5 text-sm text-[#6b6f76]">
                    Add a new liquidation category.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-[#8b8f96] hover:bg-[#f4f5f6]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={createCategory} className="space-y-5">
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
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description{" "}
                    <span className="font-normal text-[#8b8f96]">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of this category..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-md border border-[#e7e8ea] px-5 py-3 text-sm font-medium transition hover:bg-[#f7f7f8]"
                  >
                    Cancel
                  </button>

                  <button disabled={saving} className={primaryButton}>
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
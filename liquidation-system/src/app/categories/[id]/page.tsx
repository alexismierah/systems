"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import TransactionCard, {
  Transaction,
} from "@/components/TransactionCard";

import {
  ArrowLeft,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Save,
} from "lucide-react";

const fields = [
  { key: "petty_cash_replenishment", label: "Petty Cash Replenishment" },
  { key: "cash_budget_return", label: "Cash Budget Return" },
  { key: "project_budget", label: "Project Budget" },
  { key: "meals", label: "Meals" },
  { key: "transportation", label: "Transportation" },
  { key: "office_supply", label: "Office Supply" },
  { key: "phone_line", label: "Phone Line" },
  { key: "tools", label: "Tools" },
  { key: "miscellaneous", label: "Miscellaneous" },
  { key: "representation", label: "Representation" },
  { key: "gas", label: "Gas" },
];

const emptyForm = {
  transaction_date: new Date().toLocaleDateString("en-CA"),
  particulars: "",
  cash_out: "0",
  cash_in: "0",
  petty_cash_replenishment: "0",
  cash_budget_return: "0",
  project_budget: "0",
  meals: "0",
  transportation: "0",
  office_supply: "0",
  phone_line: "0",
  tools: "0",
  miscellaneous: "0",
  representation: "0",
  gas: "0",
  remarks: "",
};

type Category = {
  id: string;
  name: string;
  description: string | null;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value || 0);

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [category, setCategory] = useState<Category | null>(null);
  const [records, setRecords] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;

      if (categoryError || !categoryData) {
        setError("Category not found or you do not have access to it.");
        setLoading(false);
        return;
      }

      const { data: recordData, error: recordError } = await supabase
        .from("transactions")
        .select("*")
        .eq("category_id", id)
        .order("transaction_date", { ascending: true })
        .order("created_at", { ascending: true });

      if (!active) return;

      if (recordError) {
        setError(recordError.message);
        setLoading(false);
        return;
      }

      let balance = 0;

      const calculated: Transaction[] = (recordData || []).map((record) => {
        balance += Number(record.cash_in || 0) - Number(record.cash_out || 0);

        return {
          ...record,
          balance,
        };
      });

      setCategory(categoryData);
      setRecords(calculated);
      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id, supabase, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  function closeModal() {
    setModal(false);
    setError("");
  }

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openAddModal() {
    setEditingId(null);
    setForm({ ...emptyForm, transaction_date: new Date().toLocaleDateString("en-CA") });
    setError("");
    setModal(true);
  }

  function openEditModal(record: Transaction) {
    setEditingId(record.id);

    setForm({
      transaction_date: record.transaction_date,
      particulars: record.particulars,
      cash_out: String(record.cash_out ?? 0),
      cash_in: String(record.cash_in ?? 0),
      petty_cash_replenishment: String(record.petty_cash_replenishment ?? 0),
      cash_budget_return: String(record.cash_budget_return ?? 0),
      project_budget: String(record.project_budget ?? 0),
      meals: String(record.meals ?? 0),
      transportation: String(record.transportation ?? 0),
      office_supply: String(record.office_supply ?? 0),
      phone_line: String(record.phone_line ?? 0),
      tools: String(record.tools ?? 0),
      miscellaneous: String(record.miscellaneous ?? 0),
      representation: String(record.representation ?? 0),
      gas: String(record.gas ?? 0),
      remarks: record.remarks || "",
    });

    setError("");
    setModal(true);
  }

  async function saveRecord(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const cashOut = Number(form.cash_out);
    const cashIn = Number(form.cash_in);

    const numericFields = Object.fromEntries(
      fields.map((field) => [
        field.key,
        Number(form[field.key as keyof typeof form] || 0),
      ])
    );

    const numbers = [
      cashOut,
      cashIn,
      ...Object.values(numericFields),
    ];

    if (
      !form.transaction_date ||
      !form.particulars.trim() ||
      numbers.some((value) => !Number.isFinite(value) || value < 0)
    ) {
      setError("Enter a valid date, particulars, and non-negative amounts.");
      setSaving(false);
      return;
    }

    if (cashOut > 0 && cashIn > 0) {
      setError("Enter either an Out amount or an In amount for each record, not both.");
      setSaving(false);
      return;
    }

    const payload = {
      category_id: id,
      transaction_date: form.transaction_date,
      particulars: form.particulars.trim(),
      cash_out: cashOut,
      cash_in: cashIn,
      remarks: form.remarks.trim() || null,
      ...numericFields,
    };

    const result = editingId
      ? await supabase
          .from("transactions")
          .update(payload)
          .eq("id", editingId)
          .eq("category_id", id)
      : await supabase
          .from("transactions")
          .insert(payload);

    if (result.error) {
      setError(result.error.message);
    } else {
      setModal(false);
      setEditingId(null);
      setForm(emptyForm);
      reload();
    }

    setSaving(false);
  }

  async function deleteRecord(recordId: string) {
    if (!window.confirm("Delete this liquidation record?")) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", recordId)
      .eq("category_id", id);

    if (error) {
      setError(error.message);
    } else {
      reload();
    }
  }

  const totalIn = records.reduce(
    (sum, record) => sum + Number(record.cash_in || 0),
    0
  );

  const totalOut = records.reduce(
    (sum, record) => sum + Number(record.cash_out || 0),
    0
  );

  const currentBalance = totalIn - totalOut;

  return (
    <AppShell
      title={category?.name || "Category"}
      description="Manage liquidation records"
    >
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-700"
      >
        <ArrowLeft size={17} />
        Back to Categories
      </Link>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto animate-spin text-green-700" />
          <p className="mt-3 text-sm text-gray-400">Loading records...</p>
        </div>
      ) : error && !category ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => router.push("/categories")}
            className="mt-4 text-sm font-semibold text-green-700"
          >
            Return to Categories
          </button>
        </div>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{category?.name}</h2>
              <p className="mt-2 text-sm text-gray-500">
                {category?.description || "Liquidation records for this category."}
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
            >
              <Plus size={18} />
              Add Record
            </button>
          </div>

          {error && (
            <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Current Balance</p>
                <Wallet className="text-blue-700" size={21} />
              </div>
              <h3 className="mt-4 text-2xl font-bold">
                {money(currentBalance)}
              </h3>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Cash In</p>
                <TrendingUp className="text-green-700" size={21} />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-green-700">
                {money(totalIn)}
              </h3>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Cash Out</p>
                <TrendingDown className="text-red-600" size={21} />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-red-600">
                {money(totalOut)}
              </h3>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-lg font-bold">Liquidation Records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {records.length} record{records.length === 1 ? "" : "s"} in this category.
            </p>
          </div>

          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white py-16 text-center">
              <Wallet className="mx-auto text-gray-300" size={40} />
              <h3 className="mt-4 font-bold">No records yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Start by adding your first liquidation record.
              </p>
              <button
                onClick={openAddModal}
                className="mt-5 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[...records].reverse().map((record) => (
                <TransactionCard
                  key={record.id}
                  record={record}
                  onEdit={() => openEditModal(record)}
                  onDelete={() => deleteRecord(record.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <div className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <div>
                <h3 className="text-lg font-bold">
                  {editingId ? "Edit Liquidation Record" : "Add Liquidation Record"}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the transaction details and expense classifications.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            <form
              id="record-form"
              onSubmit={saveRecord}
              className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6"
            >
              <section>
                <h4 className="mb-4 text-sm font-bold text-gray-800">
                  Transaction Information
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Date</label>
                    <input
                      required
                      type="date"
                      value={form.transaction_date}
                      onChange={(e) => updateForm("transaction_date", e.target.value)}
                      className="w-full rounded-lg border px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Particulars</label>
                    <input
                      required
                      value={form.particulars}
                      onChange={(e) => updateForm("particulars", e.target.value)}
                      placeholder="Transaction description"
                      className="w-full rounded-lg border px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Out (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cash_out}
                      onChange={(e) => updateForm("cash_out", e.target.value)}
                      className="w-full rounded-lg border px-3 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">In (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cash_in}
                      onChange={(e) => updateForm("cash_in", e.target.value)}
                      className="w-full rounded-lg border px-3 py-3 text-sm"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 className="mb-1 text-sm font-bold text-gray-800">
                  Liquidation Classifications
                </h4>

                <p className="mb-4 text-xs text-gray-500">
                  Enter the corresponding amount for each classification. Leave unused fields at zero.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="mb-2 block text-sm font-medium">
                        {field.label}
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          ₱
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => updateForm(field.key, e.target.value)}
                          className="w-full rounded-lg border py-3 pl-8 pr-3 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <label className="mb-2 block text-sm font-medium">
                  Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => updateForm("remarks", e.target.value)}
                  placeholder="Additional information..."
                  className="w-full resize-none rounded-lg border px-3 py-3 text-sm"
                />
              </section>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}
            </form>

            <div className="flex justify-end gap-3 border-t p-5 sm:p-6">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border px-5 py-3 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="record-form"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {editingId ? "Save Changes" : "Save Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
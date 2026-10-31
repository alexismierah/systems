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

const inputClass =
  "w-full rounded-md border border-transparent bg-[#f4f5f6] px-3.5 py-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100";

const labelClass = "mb-2 block text-[13px] font-medium text-[#1f1f1f]";

const primaryButton =
  "flex items-center justify-center gap-2 rounded-md bg-[#262626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50";

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

  const stats = [
    {
      label: "Current Balance",
      value: money(currentBalance),
      icon: Wallet,
      color: "text-[#2f5de8]",
      bg: "bg-[#e3ebff]",
      valueColor: "text-[#1f1f1f]",
    },
    {
      label: "Total Cash In",
      value: money(totalIn),
      icon: TrendingUp,
      color: "text-[#3f9e5f]",
      bg: "bg-[#dff3e5]",
      valueColor: "text-[#3f9e5f]",
    },
    {
      label: "Total Cash Out",
      value: money(totalOut),
      icon: TrendingDown,
      color: "text-[#e5533d]",
      bg: "bg-[#fde8e4]",
      valueColor: "text-[#e5533d]",
    },
  ];

  return (
    <AppShell
      title={category?.name || "Category"}
      description="Manage liquidation records"
    >
      <div className="text-[#1f1f1f]">
        <Link
          href="/categories"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6b6f76] transition hover:text-[#1f1f1f]"
        >
          <ArrowLeft size={16} />
          Back to Categories
        </Link>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto animate-spin text-[#262626]" />
            <p className="mt-3 text-sm text-[#8b8f96]">Loading records...</p>
          </div>
        ) : error && !category ? (
          <div className="rounded-[20px] border border-[#e7e8ea] bg-white p-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => router.push("/categories")}
              className="mt-4 text-sm font-semibold hover:underline"
            >
              Return to Categories
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[34px] font-medium leading-tight tracking-[-0.025em] sm:text-[44px]">
                  {category?.name}
                </h1>
                <p className="mt-3 text-[15px] text-[#6b6f76]">
                  {category?.description || "Liquidation records for this category."}
                </p>
              </div>

              <button onClick={openAddModal} className={primaryButton}>
                <Plus size={18} />
                Add Record
              </button>
            </div>

            {error && (
              <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="min-w-0 rounded-[20px] border border-[#e7e8ea] bg-white p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] text-[#6b6f76]">{stat.label}</p>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${stat.bg}`}
                      >
                        <Icon size={17} className={stat.color} />
                      </div>
                    </div>

                    <h3
                      className={`mt-4 truncate text-[28px] font-semibold tracking-[-0.02em] ${stat.valueColor}`}
                    >
                      {stat.value}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Records */}
            <div className="mb-5 mt-12">
              <h2 className="text-[24px] font-medium tracking-[-0.02em]">
                Liquidation Records
              </h2>
              <p className="mt-1.5 text-sm text-[#8b8f96]">
                {records.length} record{records.length === 1 ? "" : "s"} in this category.
              </p>
            </div>

            {records.length === 0 ? (
              <div className="border-y border-[#ececef] py-16 text-center">
                <Wallet className="mx-auto text-[#c9cbd0]" size={40} />
                <h3 className="mt-4 text-[17px] font-semibold">No records yet</h3>
                <p className="mt-2 text-sm text-[#6b6f76]">
                  Start by adding your first liquidation record.
                </p>
                <button
                  onClick={openAddModal}
                  className={`${primaryButton} mx-auto mt-6`}
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

        {/* Add / edit record modal */}
        {modal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-3 sm:p-5">
            <div className="flex max-h-[95vh] w-full max-w-5xl flex-col rounded-2xl border border-[#ececef] bg-white shadow-[0_24px_60px_-20px_rgba(20,20,40,0.25)]">
              {/* Modal header */}
              <div className="flex items-start justify-between gap-4 border-b border-[#f0f0f2] px-6 py-5 sm:px-8">
                <div>
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em]">
                    {editingId ? "Edit Liquidation Record" : "Add Liquidation Record"}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#6b6f76]">
                    Enter the transaction details and expense classifications.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-[#8b8f96] hover:bg-[#f4f5f6]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form: two panes on large screens */}
              <form
                id="record-form"
                onSubmit={saveRecord}
                className="grid flex-1 gap-x-10 gap-y-8 overflow-y-auto px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              >
                {/* Left pane: transaction details */}
                <div className="space-y-5">
                  <h4 className="text-[15px] font-semibold">
                    Transaction Information
                  </h4>

                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      required
                      type="date"
                      value={form.transaction_date}
                      onChange={(e) => updateForm("transaction_date", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Particulars</label>
                    <input
                      required
                      value={form.particulars}
                      onChange={(e) => updateForm("particulars", e.target.value)}
                      placeholder="Transaction description"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[#fbd9d3] bg-[#fff7f5] p-3.5">
                      <label className="mb-2 flex items-center gap-2 text-[13px] font-medium">
                        <span className="h-2 w-2 rounded-full bg-[#e5533d]" />
                        Out (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.cash_out}
                        onChange={(e) => updateForm("cash_out", e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white px-3 py-2.5 text-base font-semibold outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
                      />
                    </div>

                    <div className="rounded-xl border border-[#cfe9d8] bg-[#f4fbf6] p-3.5">
                      <label className="mb-2 flex items-center gap-2 text-[13px] font-medium">
                        <span className="h-2 w-2 rounded-full bg-[#5fc17e]" />
                        In (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.cash_in}
                        onChange={(e) => updateForm("cash_in", e.target.value)}
                        className="w-full rounded-md border border-transparent bg-white px-3 py-2.5 text-base font-semibold outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Remarks (Optional)</label>
                    <textarea
                      rows={3}
                      value={form.remarks}
                      onChange={(e) => updateForm("remarks", e.target.value)}
                      placeholder="Additional information..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                {/* Right pane: classifications */}
                <div className="lg:border-l lg:border-[#f0f0f2] lg:pl-10">
                  <h4 className="text-[15px] font-semibold">
                    Liquidation Classifications
                  </h4>

                  <p className="mb-5 mt-1.5 text-[13px] text-[#8b8f96]">
                    Enter the corresponding amount for each classification. Leave unused fields at zero.
                  </p>

                  <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field.key}>
                        <label className={labelClass}>{field.label}</label>

                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#b5b8be]">
                            ₱
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form[field.key as keyof typeof form]}
                            onChange={(e) => updateForm(field.key, e.target.value)}
                            className={`${inputClass} pl-8`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 lg:col-span-2">
                    {error}
                  </p>
                )}
              </form>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 border-t border-[#f0f0f2] px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-[#e7e8ea] px-5 py-3 text-sm font-medium transition hover:bg-[#f7f7f8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="record-form"
                  disabled={saving}
                  className={primaryButton}
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
      </div>
    </AppShell>
  );
}
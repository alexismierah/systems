"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  FileText,
} from "lucide-react";

// Avenir is a licensed font — if you have the font files, load them with
// next/font/local and swap this stack for that font's CSS variable.
// This stack falls back gracefully if Avenir isn't installed on the device.
const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

type Quotation = {
  id: string;
  number: string;
  customer: string;
  date: string;
};

const emptyDraft: Omit<Quotation, "id"> = {
  number: "",
  customer: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [viewing, setViewing] = useState<Quotation | null>(null);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [draft, setDraft] = useState<Omit<Quotation, "id">>(emptyDraft);
  const [deleting, setDeleting] = useState<Quotation | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (q: Quotation) => {
    setDraft({
      number: q.number,
      customer: q.customer,
      date: q.date,
    });
    setEditing(q);
  };

  const closeModals = () => {
    setViewing(null);
    setEditing(null);
    setDeleting(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    setQuotations((prev) =>
      prev.map((q) => (q.id === editing.id ? { ...q, ...draft } : q))
    );

    setSaving(false);
    closeModals();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setQuotations((prev) => prev.filter((q) => q.id !== deleting.id));
    setSaving(false);
    closeModals();
  };

  return (
    <div style={{ fontFamily: fontStack, fontWeight: 300 }}>
      <div className="mb-8">
        <h1
          className="text-2xl text-gray-900"
          style={{ fontWeight: 400 }}
        >
          Recent quotations
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          View, edit, and manage your latest quotations.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              No quotations yet.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3 font-medium">Quotation</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-6 py-4 text-gray-900" style={{ fontWeight: 500 }}>
                    {q.number}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{q.customer}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(q.date).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewing(q)}
                        aria-label={`View ${q.number}`}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(q)}
                        aria-label={`Edit ${q.number}`}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(q)}
                        aria-label={`Delete ${q.number}`}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View modal */}
      {viewing && (
        <Modal onClose={closeModals} title="Quotation details">
          <dl className="space-y-3 text-sm">
            <Row label="Quotation #" value={viewing.number} />
            <Row label="Customer" value={viewing.customer} />
            <Row
              label="Date"
              value={new Date(viewing.date).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
          </dl>
          <button
            type="button"
            onClick={closeModals}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-gray-900 text-sm text-white transition hover:bg-black"
            style={{ fontWeight: 500 }}
          >
            Close
          </button>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal onClose={closeModals} title="Edit quotation">
          <div className="space-y-3">
            <Field label="Quotation #">
              <input
                value={draft.number}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, number: e.target.value }))
                }
                placeholder="QT-2026-015"
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            </Field>

            <Field label="Customer">
              <input
                value={draft.customer}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, customer: e.target.value }))
                }
                placeholder="Customer name"
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={draft.date}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, date: e.target.value }))
                }
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            </Field>
          </div>

          <button
            type="button"
            disabled={saving || !draft.number.trim() || !draft.customer.trim()}
            onClick={handleSave}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <Modal onClose={closeModals} title="Delete quotation">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="text-gray-900" style={{ fontWeight: 500 }}>
              {deleting.number}
            </span>
            ? This can't be undone.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={closeModals}
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleDelete}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontWeight: 500 }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      style={{ fontFamily: fontStack, fontWeight: 300 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg text-gray-900"
            style={{ fontWeight: 400 }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900" style={{ fontWeight: 500 }}>
        {value}
      </dd>
    </div>
  );
}
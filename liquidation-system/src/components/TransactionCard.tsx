"use client";

import {
  CalendarDays,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value || 0);

const classifications = [
  ["petty_cash_replenishment", "Petty Cash Replenishment"],
  ["cash_budget_return", "Cash Budget Return"],
  ["project_budget", "Project Budget"],
  ["meals", "Meals"],
  ["transportation", "Transportation"],
  ["office_supply", "Office Supply"],
  ["phone_line", "Phone Line"],
  ["tools", "Tools"],
  ["miscellaneous", "Miscellaneous"],
  ["representation", "Representation"],
  ["gas", "Gas"],
] as const;

export type ClassificationKey = (typeof classifications)[number][0];

export type Transaction = {
  id: string;
  transaction_date: string;
  particulars: string;
  cash_out: number;
  cash_in: number;
  balance?: number;
  remarks?: string | null;
} & Partial<Record<ClassificationKey, number | null>>;

export default function TransactionCard({
  record,
  onEdit,
  onDelete,
}: {
  record: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const entries = classifications.filter(
    ([key]) => Number(record[key] || 0) !== 0
  );

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-green-200">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gray-100 p-3 text-gray-600">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs text-gray-400">
              {record.transaction_date}
            </p>
            <h3 className="mt-1 font-bold text-gray-900">
              {record.particulars}
            </h3>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            aria-label="Edit transaction"
            className="rounded-lg border p-2 text-gray-500 hover:bg-gray-50"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={onDelete}
            aria-label="Delete transaction"
            className="rounded-lg border p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-red-50 p-3">
          <div className="flex items-center gap-1 text-xs text-red-600">
            <ArrowUpRight size={15} /> Out
          </div>
          <p className="mt-2 font-bold text-red-700">
            {money(Number(record.cash_out))}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-3">
          <div className="flex items-center gap-1 text-xs text-green-700">
            <ArrowDownRight size={15} /> In
          </div>
          <p className="mt-2 font-bold text-green-700">
            {money(Number(record.cash_in))}
          </p>
        </div>

        <div className="col-span-2 rounded-lg bg-blue-50 p-3 sm:col-span-1">
          <p className="text-xs text-blue-700">Running Balance</p>
          <p className="mt-2 font-bold text-blue-800">
            {money(Number(record.balance))}
          </p>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="mt-5 border-t pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Liquidation Classifications
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {entries.map(([key, label]) => (
              <div key={key} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800">
                  {money(Number(record[key]))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {record.remarks && (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs text-gray-400">Remarks</p>
          <p className="mt-1 text-sm text-gray-600">{record.remarks}</p>
        </div>
      )}
    </article>
  );
}
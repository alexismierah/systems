"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  X,
  Eye,
} from "lucide-react";

type QuotationStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected";

type Quotation = {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: QuotationStatus;
  total: number;
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<
    Quotation[]
  >([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [selectedQuotation, setSelectedQuotation] =
    useState<Quotation | null>(null);

  const [form, setForm] = useState({
    customer: "",
    email: "",
    total: "",
    status: "Draft" as QuotationStatus,
  });

  // Load quotations
  useEffect(() => {
    const stored = localStorage.getItem("quotations");

    if (stored) {
      try {
        setQuotations(JSON.parse(stored));
      } catch {
        setQuotations([]);
      }
    } else {
      setQuotations([]);
    }
  }, []);

  // Save quotations
  const saveQuotations = (data: Quotation[]) => {
    setQuotations(data);

    localStorage.setItem(
      "quotations",
      JSON.stringify(data)
    );
  };

  // Search
  const filteredQuotations = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return quotations;
    }

    return quotations.filter(
      (quotation) =>
        quotation.id
          .toLowerCase()
          .includes(searchValue) ||
        quotation.customer
          .toLowerCase()
          .includes(searchValue) ||
        quotation.email
          .toLowerCase()
          .includes(searchValue) ||
        quotation.status
          .toLowerCase()
          .includes(searchValue)
    );
  }, [quotations, search]);

  // Open modal
  const openCreateModal = () => {
    setForm({
      customer: "",
      email: "",
      total: "",
      status: "Draft",
    });

    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Create quotation
  const createQuotation = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.customer.trim() ||
      !form.email.trim() ||
      form.total === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const total = Number(form.total);

    if (Number.isNaN(total)) {
      alert("Please enter a valid total amount.");
      return;
    }

    if (total < 0) {
      alert("Total cannot be negative.");
      return;
    }

    const newQuotation: Quotation = {
      id: `QT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      customer: form.customer.trim(),
      email: form.email.trim(),
      date: new Date().toISOString().split("T")[0],
      status: form.status,
      total,
    };

    saveQuotations([
      ...quotations,
      newQuotation,
    ]);

    closeModal();
  };

  // Delete quotation
  const deleteQuotation = (id: string) => {
    const quotation = quotations.find(
      (quotation) => quotation.id === id
    );

    if (!quotation) {
      return;
    }

    const confirmed = window.confirm(
      `Delete quotation ${quotation.id}?`
    );

    if (!confirmed) {
      return;
    }

    saveQuotations(
      quotations.filter(
        (quotation) => quotation.id !== id
      )
    );

    if (selectedQuotation?.id === id) {
      setSelectedQuotation(null);
    }
  };

  // Update status
  const updateStatus = (
    id: string,
    status: QuotationStatus
  ) => {
    const updated = quotations.map((quotation) =>
      quotation.id === id
        ? {
            ...quotation,
            status,
          }
        : quotation
    );

    saveQuotations(updated);

    if (selectedQuotation?.id === id) {
      setSelectedQuotation({
        ...selectedQuotation,
        status,
      });
    }
  };

  // Statistics
  const totalValue = quotations.reduce(
    (sum, quotation) => sum + quotation.total,
    0
  );

  const pendingCount = quotations.filter(
    (quotation) => quotation.status === "Pending"
  ).length;

  const approvedCount = quotations.filter(
    (quotation) => quotation.status === "Approved"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <FileText className="h-5 w-5 text-gray-700" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Quotations
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Create and manage customer quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          New Quotation
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Quotations
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {quotations.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-semibold text-yellow-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Approved
          </p>

          <p className="mt-2 text-2xl font-semibold text-green-600">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Value
          </p>

          <p className="mt-2 text-2xl font-semibold">
            ₱{totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl border bg-white">
        <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-semibold">
              Customer Quotations
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredQuotations.length} quotation
              {filteredQuotations.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotations..."
              className="h-10 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Quote #
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Date
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Status
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Total
                </th>

                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredQuotations.map((quotation) => (
                <tr
                  key={quotation.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {quotation.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {quotation.customer}
                    </p>

                    <p className="text-xs text-gray-500">
                      {quotation.email}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {quotation.date}
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={quotation.status}
                      onChange={(e) =>
                        updateStatus(
                          quotation.id,
                          e.target
                            .value as QuotationStatus
                        )
                      }
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${
                        quotation.status ===
                        "Approved"
                          ? "bg-green-50 text-green-700"
                          : quotation.status ===
                              "Rejected"
                            ? "bg-red-50 text-red-700"
                            : quotation.status ===
                                "Pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <option value="Draft">
                        Draft
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>
                    </select>
                  </td>

                  <td className="px-6 py-4 font-medium">
                    ₱{quotation.total.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuotation(
                            quotation
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteQuotation(
                            quotation.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQuotations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <FileText className="mx-auto h-8 w-8 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No quotations found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Create your first quotation to get
                      started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-semibold text-gray-900">
                  New Quotation
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a quotation for your customer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={createQuotation}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Customer Name
                </label>

                <input
                  type="text"
                  value={form.customer}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customer: e.target.value,
                    })
                  }
                  placeholder="Enter customer name"
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Customer Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="customer@example.com"
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Total Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      total: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value as QuotationStatus,
                    })
                  }
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">
                    Pending
                  </option>
                  <option value="Approved">
                    Approved
                  </option>
                  <option value="Rejected">
                    Rejected
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  QUOTATION
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedQuotation.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedQuotation(null)
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs text-gray-500">
                  Customer
                </p>

                <p className="mt-1 font-medium">
                  {selectedQuotation.customer}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedQuotation.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-gray-500">
                    Date
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedQuotation.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedQuotation.status}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Total Amount
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  ₱
                  {selectedQuotation.total.toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedQuotation(null)
                }
                className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
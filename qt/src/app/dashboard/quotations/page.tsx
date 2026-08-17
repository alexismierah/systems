"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  X,
  Eye,
  Download,
  Loader2,
} from "lucide-react";

const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

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
  const [quotations, setQuotations] = useState<Quotation[]>(
    []
  );

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [selectedQuotation, setSelectedQuotation] =
    useState<Quotation | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    customer: "",
    email: "",
    total: "",
    status: "Draft" as QuotationStatus,
  });

  // Load quotations
  useEffect(() => {
    const stored =
      localStorage.getItem("quotations");

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
  const saveQuotations = (
    data: Quotation[]
  ) => {
    setQuotations(data);

    localStorage.setItem(
      "quotations",
      JSON.stringify(data)
    );
  };

  // Search
  const filteredQuotations = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

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

  // Open create modal
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
  const createQuotation = (
    e: React.FormEvent
  ) => {
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
      alert(
        "Please enter a valid total amount."
      );
      return;
    }

    if (total < 0) {
      alert(
        "Total cannot be negative."
      );
      return;
    }

    const newQuotation: Quotation = {
      id: `QT-${crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase()}`,
      customer: form.customer.trim(),
      email: form.email.trim(),
      date: new Date()
        .toISOString()
        .split("T")[0],
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
  const deleteQuotation = (
    id: string
  ) => {
    const quotation =
      quotations.find(
        (quotation) =>
          quotation.id === id
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
        (quotation) =>
          quotation.id !== id
      )
    );

    if (
      selectedQuotation?.id === id
    ) {
      setSelectedQuotation(null);
    }
  };

  // Download quotation PDF
  const downloadQuotationPDF = async (
    quotation: Quotation
  ) => {
    try {
      setDownloadingId(quotation.id);

      const { jsPDF } =
        await import("jspdf");

      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const marginX = 48;

      // Header
      doc.setFillColor(
        17,
        24,
        39
      );

      doc.rect(
        0,
        0,
        pageWidth,
        96,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(11);

      doc.text(
        "RenderWonders",
        marginX,
        40
      );

      doc.setFontSize(20);

      doc.text(
        "Quotation",
        marginX,
        68
      );

      doc.setFontSize(11);

      doc.text(
        quotation.id,
        pageWidth - marginX,
        68,
        {
          align: "right",
        }
      );

      // Customer information
      doc.setTextColor(
        107,
        114,
        128
      );

      doc.setFontSize(9);

      doc.text(
        "BILLED TO",
        marginX,
        140
      );

      doc.text(
        "DATE",
        pageWidth - marginX,
        140,
        {
          align: "right",
        }
      );

      doc.setTextColor(
        17,
        24,
        39
      );

      doc.setFontSize(12);

      doc.text(
        quotation.customer,
        marginX,
        158
      );

      doc.setFontSize(10);

      doc.setTextColor(
        75,
        85,
        99
      );

      doc.text(
        quotation.email,
        marginX,
        174
      );

      doc.setFontSize(12);

      doc.setTextColor(
        17,
        24,
        39
      );

      doc.text(
        quotation.date,
        pageWidth - marginX,
        158,
        {
          align: "right",
        }
      );

      // Status
      doc.setTextColor(
        107,
        114,
        128
      );

      doc.setFontSize(9);

      doc.text(
        "STATUS",
        pageWidth - marginX,
        190,
        {
          align: "right",
        }
      );

      doc.setTextColor(
        17,
        24,
        39
      );

      doc.setFontSize(12);

      doc.text(
        quotation.status,
        pageWidth - marginX,
        208,
        {
          align: "right",
        }
      );

      // Divider
      doc.setDrawColor(
        229,
        231,
        235
      );

      doc.line(
        marginX,
        236,
        pageWidth - marginX,
        236
      );

      // Total
      doc.setTextColor(
        107,
        114,
        128
      );

      doc.setFontSize(10);

      doc.text(
        "TOTAL AMOUNT",
        marginX,
        280
      );

      doc.setTextColor(
        17,
        24,
        39
      );

      doc.setFontSize(26);

      doc.text(
        `PHP ${quotation.total.toLocaleString()}`,
        marginX,
        312
      );

      // Footer
      doc.setDrawColor(
        229,
        231,
        235
      );

      doc.line(
        marginX,
        700,
        pageWidth - marginX,
        700
      );

      doc.setTextColor(
        156,
        163,
        175
      );

      doc.setFontSize(9);

      doc.text(
        "Generated by RenderWonders — this document is not a tax invoice.",
        marginX,
        720
      );

      doc.save(
        `${quotation.id}.pdf`
      );
    } catch (err) {
      console.error(err);

      alert(
        "Couldn't generate the PDF. Make sure the 'jspdf' package is installed."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1
            className="text-2xl leading-tight text-gray-900"
            style={{
              fontWeight: 400,
            }}
          >
            Quotations
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create and manage customer
            quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreateModal
          }
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black"
          style={{
            fontWeight: 500,
          }}
        >
          <Plus className="h-4 w-4" />

          New Quotation
        </button>
      </div>

      {/* Quotations List */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* List Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center">
          <div>
            <h2
              style={{
                fontWeight: 400,
              }}
            >
              Customer Quotations
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredQuotations.length}{" "}
              quotation
              {filteredQuotations.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search quotations..."
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-[#FAFAFB]">
              <tr>
                <th className="px-6 py-3 font-normal text-gray-500">
                  Quote #
                </th>

                <th className="px-6 py-3 font-normal text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-3 font-normal text-gray-500">
                  Date
                </th>

                <th className="px-6 py-3 text-right font-normal text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredQuotations.map(
                (quotation) => (
                  <tr
                    key={quotation.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Quote Number */}
                    <td
                      className="px-6 py-4 text-gray-900"
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      {quotation.id}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p
                        className="text-gray-900"
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        {
                          quotation.customer
                        }
                      </p>

                      <p className="text-xs text-gray-500">
                        {
                          quotation.email
                        }
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-500">
                      {quotation.date}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedQuotation(
                              quotation
                            )
                          }
                          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Download */}
                        <button
                          type="button"
                          onClick={() =>
                            downloadQuotationPDF(
                              quotation
                            )
                          }
                          disabled={
                            downloadingId ===
                            quotation.id
                          }
                          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloadingId ===
                          quotation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            deleteQuotation(
                              quotation.id
                            )
                          }
                          className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {/* Empty State */}
              {filteredQuotations.length ===
                0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center"
                  >
                    <FileText className="mx-auto h-8 w-8 text-gray-300" />

                    <p
                      className="mt-3 text-sm text-gray-700"
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      No quotations found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Create your first
                      quotation to get
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
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            style={{
              fontFamily: fontStack,
              fontWeight: 300,
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2
                  className="text-gray-900"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  New Quotation
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a quotation for
                  your customer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={
                createQuotation
              }
              className="space-y-3 p-6"
            >
              <input
                type="text"
                value={form.customer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer:
                      e.target.value,
                  })
                }
                placeholder="Customer name"
                className="h-11 w-full rounded-full border border-gray-200 px-5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email:
                      e.target.value,
                  })
                }
                placeholder="customer@example.com"
                className="h-11 w-full rounded-full border border-gray-200 px-5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total:
                      e.target.value,
                  })
                }
                placeholder="Total amount (₱)"
                className="h-11 w-full rounded-full border border-gray-200 px-5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target
                        .value as QuotationStatus,
                  })
                }
                className="h-11 w-full rounded-full border border-gray-200 px-5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
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

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-full border border-gray-200 px-5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-full bg-gray-900 px-5 text-sm text-white hover:bg-black"
                  style={{
                    fontWeight: 500,
                  }}
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
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            style={{
              fontFamily: fontStack,
              fontWeight: 300,
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs text-gray-500">
                  QUOTATION
                </p>

                <h2
                  className="mt-1 text-xl text-gray-900"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  {
                    selectedQuotation.id
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedQuotation(
                    null
                  )
                }
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs text-gray-500">
                  Customer
                </p>

                <p
                  className="mt-1 text-gray-900"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {
                    selectedQuotation.customer
                  }
                </p>

                <p className="text-sm text-gray-500">
                  {
                    selectedQuotation.email
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-gray-500">
                    Date
                  </p>

                  <p
                    className="mt-1 text-gray-900"
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {
                      selectedQuotation.date
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p
                    className="mt-1 text-gray-900"
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {
                      selectedQuotation.status
                    }
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-2xl bg-[#F5F6F7] p-4">
                <p className="text-sm text-gray-500">
                  Total Amount
                </p>

                <p
                  className="mt-1 text-2xl text-gray-900"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  ₱
                  {selectedQuotation.total.toLocaleString()}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    downloadQuotationPDF(
                      selectedQuotation
                    )
                  }
                  disabled={
                    downloadingId ===
                    selectedQuotation.id
                  }
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  {downloadingId ===
                  selectedQuotation.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}

                  {downloadingId ===
                  selectedQuotation.id
                    ? "Preparing..."
                    : "Download PDF"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedQuotation(
                      null
                    )
                  }
                  className="h-11 flex-1 rounded-full bg-gray-900 text-sm text-white hover:bg-black"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
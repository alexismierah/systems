"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  X,
  Eye,
  Pencil,
  Download,
  Mail,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

const BRAND_BLUE = "#5B6DA8";
const BRAND_BLUE_LIGHT = "#EEF0F8";

/* ----------------------------- */
/* Types                         */
/* ----------------------------- */

type QuotationStatus = "Draft" | "Pending" | "Approved" | "Rejected";

type QuoteItem = {
  id: string;
  description: string;
  unitPrice: number;
  qty: number;
  taxed: boolean;
};

type CompanyInfo = {
  companyName: string;
  streetAddress: string;
  cityStateZip: string;
  website: string;
  phone: string;
  fax: string;
  preparedBy: string;
};

const emptyCompany: CompanyInfo = {
  companyName: "",
  streetAddress: "",
  cityStateZip: "",
  website: "",
  phone: "",
  fax: "",
  preparedBy: "",
};

type Quotation = {
  id: string; // Quote #, e.g. QT-A1B2C3D4
  customerId: string;
  date: string; // ISO date
  validUntil: string; // ISO date
  status: QuotationStatus;

  // Flat fields kept for backwards compatibility with the dashboard summary.
  customer: string;
  email: string;
  total: number;

  customerCompany: string;
  customerAddress: string;
  customerCityStateZip: string;
  customerPhone: string;

  items: QuoteItem[];
  taxRate: number; // percent
  other: number;
  terms: string;

  subtotal: number;
  taxable: number;
  taxDue: number;
};

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */

function formatCurrency(value: number) {
  return `\u20b1${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function plusDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function calcTotals(items: QuoteItem[], taxRate: number, other: number) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0
  );

  const taxable = items
    .filter((item) => item.taxed)
    .reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const taxDue = taxable * (taxRate / 100);

  const total = subtotal + taxDue + (Number.isNaN(other) ? 0 : other);

  return { subtotal, taxable, taxDue, total };
}

const defaultTerms =
  "1. Customer will be billed after indicating acceptance of this quote\n" +
  "2. Payment will be due prior to delivery of service and goods\n" +
  "3. Please contact us with any questions regarding this quotation";

function newItem(): QuoteItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    unitPrice: 0,
    qty: 1,
    taxed: false,
  };
}

function readCompany(): CompanyInfo {
  try {
    const raw = localStorage.getItem("company-profile");
    if (!raw) return emptyCompany;
    return { ...emptyCompany, ...JSON.parse(raw) };
  } catch {
    return emptyCompany;
  }
}

// Builds a standalone, print-ready HTML document for the quotation.
// Kept dependency-free (inline CSS, no Tailwind) so it renders correctly
// in the separate window used for "Download" / "Print to PDF".
function buildQuoteHtml(
  company: CompanyInfo,
  quotation: Quotation,
  contactLine: string
) {
  const rows = quotation.items
    .map(
      (item, index) => `
      <tr style="background:${index % 2 === 0 ? "#ffffff" : "#F7F7F9"}">
        <td style="padding:10px 12px;">${escapeHtml(
          item.description || "\u2014"
        )}</td>
        <td style="padding:10px 12px;text-align:right;">${item.unitPrice.toFixed(
          2
        )}</td>
        <td style="padding:10px 12px;text-align:center;">${item.qty}</td>
        <td style="padding:10px 12px;text-align:center;">${
          item.taxed ? "X" : ""
        }</td>
        <td style="padding:10px 12px;text-align:right;">${(
          item.unitPrice * item.qty
        ).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const termsLines = quotation.terms
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p style="margin:0 0 6px 0;">${escapeHtml(line)}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Quotation ${escapeHtml(quotation.id)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Avenir, 'Avenir Next', 'Century Gothic', Arial, sans-serif;
    color: #1f2430;
    margin: 0;
    padding: 32px;
    font-size: 13px;
  }
  .sheet { max-width: 760px; margin: 0 auto; border: 1px solid #dcdfe6; padding: 32px; }
  table { width: 100%; border-collapse: collapse; }
  .meta-table td { border: 1px solid #dcdfe6; padding: 6px 10px; }
  .section-bar {
    background: ${BRAND_BLUE};
    color: #fff;
    padding: 6px 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    font-size: 12px;
  }
  .items-head th {
    background: ${BRAND_BLUE};
    color: #fff;
    text-align: left;
    padding: 10px 12px;
    font-weight: 600;
    font-size: 12px;
  }
  @media print {
    body { padding: 0; }
    .sheet { border: none; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <table style="margin-bottom:24px;">
      <tr>
        <td style="vertical-align:top;">
          <div style="font-size:22px;font-weight:600;">${escapeHtml(
            company.companyName || "Company Name"
          )}</div>
          <div style="margin-top:8px;line-height:1.6;color:#444;">
            ${escapeHtml(company.streetAddress || "")}<br/>
            ${escapeHtml(company.cityStateZip || "")}<br/>
            ${
              company.website
                ? `Website: ${escapeHtml(company.website)}<br/>`
                : ""
            }
            ${company.phone ? `Phone: ${escapeHtml(company.phone)}<br/>` : ""}
            ${company.fax ? `Fax: ${escapeHtml(company.fax)}<br/>` : ""}
            ${
              company.preparedBy
                ? `Prepared By: ${escapeHtml(company.preparedBy)}`
                : ""
            }
          </div>
        </td>
        <td style="vertical-align:top;text-align:right;width:230px;">
          <div style="font-size:28px;font-weight:700;color:${BRAND_BLUE};letter-spacing:0.05em;">QUOTE</div>
          <table class="meta-table" style="margin-top:12px;">
            <tr><td style="text-align:right;color:#666;width:50%;">DATE</td><td>${formatDate(
              quotation.date
            )}</td></tr>
            <tr><td style="text-align:right;color:#666;">QUOTE #</td><td>${escapeHtml(
              quotation.id
            )}</td></tr>
            <tr><td style="text-align:right;color:#666;">CUSTOMER ID</td><td>${escapeHtml(
              quotation.customerId
            )}</td></tr>
            <tr><td style="text-align:right;color:#666;">VALID UNTIL</td><td>${formatDate(
              quotation.validUntil
            )}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="section-bar">CUSTOMER</div>
    <div style="padding:12px 4px 24px;line-height:1.7;">
      <div style="font-weight:600;">${escapeHtml(quotation.customer)}</div>
      ${
        quotation.customerCompany
          ? `<div>${escapeHtml(quotation.customerCompany)}</div>`
          : ""
      }
      ${
        quotation.customerAddress
          ? `<div>${escapeHtml(quotation.customerAddress)}</div>`
          : ""
      }
      ${
        quotation.customerCityStateZip
          ? `<div>${escapeHtml(quotation.customerCityStateZip)}</div>`
          : ""
      }
      ${
        quotation.customerPhone
          ? `<div>${escapeHtml(quotation.customerPhone)}</div>`
          : ""
      }
    </div>

    <table style="margin-top:8px;">
      <thead class="items-head">
        <tr>
          <th>DESCRIPTION</th>
          <th style="text-align:right;">UNIT PRICE</th>
          <th style="text-align:center;">QTY</th>
          <th style="text-align:center;">TAXED</th>
          <th style="text-align:right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table style="margin-top:16px;">
      <tr>
        <td style="width:55%;vertical-align:top;">
          <div class="section-bar">TERMS AND CONDITIONS</div>
          <div style="padding:12px 4px;line-height:1.6;font-size:12px;">
            ${termsLines}
            <div style="margin-top:24px;">Customer Acceptance (sign below):</div>
            <div style="margin-top:28px;border-bottom:1px solid #999;width:80%;"></div>
            <div style="margin-top:6px;">Print Name:</div>
          </div>
        </td>
        <td style="width:45%;vertical-align:top;">
          <table class="meta-table" style="width:100%;">
            <tr><td style="text-align:right;">Subtotal</td><td style="text-align:right;">${formatCurrency(
              quotation.subtotal
            )}</td></tr>
            <tr><td style="text-align:right;">Taxable</td><td style="text-align:right;">${formatCurrency(
              quotation.taxable
            )}</td></tr>
            <tr><td style="text-align:right;">Tax rate</td><td style="text-align:right;">${quotation.taxRate.toFixed(
              2
            )}%</td></tr>
            <tr><td style="text-align:right;">Tax due</td><td style="text-align:right;">${formatCurrency(
              quotation.taxDue
            )}</td></tr>
            <tr><td style="text-align:right;">Other</td><td style="text-align:right;">${formatCurrency(
              quotation.other
            )}</td></tr>
            <tr style="font-weight:700;background:${BRAND_BLUE_LIGHT};"><td style="text-align:right;">TOTAL</td><td style="text-align:right;">${formatCurrency(
    quotation.total
  )}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="margin-top:32px;text-align:center;font-size:12px;color:#444;">
      <div>If you have any questions about this price quote, please contact</div>
      <div style="font-weight:600;">${escapeHtml(contactLine)}</div>
      <div style="margin-top:10px;font-weight:700;font-style:italic;">Thank You For Your Business!</div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 200);</script>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMailBody(quotation: Quotation, contactLine: string) {
  const lines = [
    `Quote #: ${quotation.id}`,
    `Date: ${formatDate(quotation.date)}`,
    `Valid Until: ${formatDate(quotation.validUntil)}`,
    "",
    "Items:",
    ...quotation.items.map(
      (item) =>
        `- ${item.description || "Item"} x${item.qty} @ ${formatCurrency(
          item.unitPrice
        )} = ${formatCurrency(item.unitPrice * item.qty)}`
    ),
    "",
    `Total: ${formatCurrency(quotation.total)}`,
    "",
    "Please find the details of your quotation above. Download the PDF from your dashboard to see the full formatted quote.",
    "",
    `Questions? Contact ${contactLine}`,
  ];

  return lines.join("\n");
}

/* ----------------------------- */
/* Page                          */
/* ----------------------------- */

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");

  const [company, setCompany] = useState<CompanyInfo>(emptyCompany);
  const [accountEmail, setAccountEmail] = useState("");

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(
    null
  );
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);

  // Load quotations
  useEffect(() => {
    const stored = localStorage.getItem("quotations");

    if (stored) {
      try {
        setQuotations(JSON.parse(stored));
      } catch {
        setQuotations([]);
      }
    }

    setCompany(readCompany());

    const handleCompanyUpdated = () => setCompany(readCompany());
    window.addEventListener("company-updated", handleCompanyUpdated);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setAccountEmail(user.email);
    });

    return () => {
      window.removeEventListener("company-updated", handleCompanyUpdated);
    };
  }, []);

  const saveQuotations = (data: Quotation[]) => {
    setQuotations(data);
    localStorage.setItem("quotations", JSON.stringify(data));
  };

  const contactLine = [company.preparedBy, company.phone, accountEmail]
    .filter(Boolean)
    .join(", ");

  const filteredQuotations = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return quotations;

    return quotations.filter(
      (q) =>
        q.id.toLowerCase().includes(searchValue) ||
        q.customer.toLowerCase().includes(searchValue) ||
        q.email.toLowerCase().includes(searchValue) ||
        q.status.toLowerCase().includes(searchValue)
    );
  }, [quotations, search]);

  const openCreateModal = () => {
    setEditingQuotation(null);
    setShowBuilder(true);
  };

  const openEditModal = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setShowBuilder(true);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditingQuotation(null);
  };

  const handleSaveQuotation = (quotation: Quotation) => {
    if (editingQuotation) {
      saveQuotations(
        quotations.map((q) => (q.id === quotation.id ? quotation : q))
      );
    } else {
      saveQuotations([quotation, ...quotations]);
    }
    closeBuilder();
  };

  const deleteQuotation = (id: string) => {
    const quotation = quotations.find((q) => q.id === id);
    if (!quotation) return;

    const confirmed = window.confirm(`Delete quotation ${quotation.id}?`);
    if (!confirmed) return;

    saveQuotations(quotations.filter((q) => q.id !== id));

    if (viewQuotation?.id === id) setViewQuotation(null);
  };

  const downloadQuotation = (quotation: Quotation) => {
    const html = buildQuoteHtml(company, quotation, contactLine);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to download the quotation.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const emailQuotation = (quotation: Quotation) => {
    const subject = encodeURIComponent(
      `Quotation ${quotation.id} from ${company.companyName || "us"}`
    );
    const body = encodeURIComponent(buildMailBody(quotation, contactLine));
    window.location.href = `mailto:${quotation.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ fontFamily: fontStack, fontWeight: 300 }}>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1
            className="text-2xl leading-tight text-gray-900"
            style={{ fontWeight: 400 }}
          >
            Quotations
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create and manage customer quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black"
          style={{ fontWeight: 500 }}
        >
          <Plus className="h-4 w-4" />
          New Quotation
        </button>
      </div>

      {!company.companyName && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          Your quotations will use your company letterhead. Add your company
          details in{" "}
          <a href="/dashboard/settings" className="underline">
            Settings &rarr; Company
          </a>{" "}
          so they show up on the quote template.
        </div>
      )}

      {/* Quotations Overview */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center">
          <div>
            <h2 style={{ fontWeight: 400 }}>Customer Quotations</h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredQuotations.length} quotation
              {filteredQuotations.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotations..."
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

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
                <th className="px-6 py-3 font-normal text-gray-500">Date</th>
                <th className="px-6 py-3 font-normal text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-normal text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-right font-normal text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredQuotations.map((quotation) => (
                <tr key={quotation.id} className="transition hover:bg-gray-50">
                  <td
                    className="px-6 py-4 text-gray-900"
                    style={{ fontWeight: 500 }}
                  >
                    {quotation.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>
                      {quotation.customer}
                    </p>
                    <p className="text-xs text-gray-500">{quotation.email}</p>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(quotation.date)}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={quotation.status} />
                  </td>

                  <td
                    className="px-6 py-4 text-right text-gray-900"
                    style={{ fontWeight: 500 }}
                  >
                    {formatCurrency(quotation.total)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewQuotation(quotation)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        title="View"
                        aria-label={`View ${quotation.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(quotation)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        title="Edit"
                        aria-label={`Edit ${quotation.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadQuotation(quotation)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        title="Download"
                        aria-label={`Download ${quotation.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => emailQuotation(quotation)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        title="Share via email"
                        aria-label={`Email ${quotation.id}`}
                      >
                        <Mail className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteQuotation(quotation.id)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                        aria-label={`Delete ${quotation.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQuotations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-300" />
                    <p
                      className="mt-3 text-sm text-gray-700"
                      style={{ fontWeight: 500 }}
                    >
                      No quotations found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Create your first quotation to get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Quotation */}
      {showBuilder && (
        <QuoteBuilderModal
          company={company}
          initial={editingQuotation}
          onClose={closeBuilder}
          onSave={handleSaveQuotation}
        />
      )}

      {/* View Quotation */}
      {viewQuotation && (
        <QuoteViewModal
          company={company}
          quotation={viewQuotation}
          onClose={() => setViewQuotation(null)}
          onDownload={() => downloadQuotation(viewQuotation)}
          onEmail={() => emailQuotation(viewQuotation)}
        />
      )}
    </div>
  );
}

/* ----------------------------- */
/* Status Badge                  */
/* ----------------------------- */

function StatusBadge({ status }: { status: QuotationStatus }) {
  const styles: Record<QuotationStatus, string> = {
    Draft: "bg-gray-100 text-gray-600",
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${styles[status]}`}
      style={{ fontWeight: 500 }}
    >
      {status}
    </span>
  );
}

/* ----------------------------- */
/* Quote Builder Modal           */
/* ----------------------------- */

function QuoteBuilderModal({
  company,
  initial,
  onClose,
  onSave,
}: {
  company: CompanyInfo;
  initial: Quotation | null;
  onClose: () => void;
  onSave: (quotation: Quotation) => void;
}) {
  const [customerName, setCustomerName] = useState(initial?.customer ?? "");
  const [customerCompany, setCustomerCompany] = useState(
    initial?.customerCompany ?? ""
  );
  const [customerAddress, setCustomerAddress] = useState(
    initial?.customerAddress ?? ""
  );
  const [customerCityStateZip, setCustomerCityStateZip] = useState(
    initial?.customerCityStateZip ?? ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    initial?.customerPhone ?? ""
  );
  const [email, setEmail] = useState(initial?.email ?? "");
  const [customerId, setCustomerId] = useState(() =>
    initial?.customerId ?? String(Math.floor(100 + Math.random() * 900))
  );

  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [validUntil, setValidUntil] = useState(
    initial?.validUntil ?? plusDaysISO(30)
  );
  const [status, setStatus] = useState<QuotationStatus>(
    initial?.status ?? "Draft"
  );

  const [items, setItems] = useState<QuoteItem[]>(
    initial?.items?.length ? initial.items : [newItem()]
  );
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? 0);
  const [other, setOther] = useState(initial?.other ?? 0);
  const [terms, setTerms] = useState(initial?.terms ?? defaultTerms);

  const totals = useMemo(
    () => calcTotals(items, taxRate, other),
    [items, taxRate, other]
  );

  const updateItem = (id: string, patch: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => setItems((prev) => [...prev, newItem()]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !email.trim()) {
      alert("Please enter the customer's name and email.");
      return;
    }

    const cleanItems = items.filter((item) => item.description.trim());

    if (cleanItems.length === 0) {
      alert("Please add at least one line item with a description.");
      return;
    }

    const finalTotals = calcTotals(cleanItems, taxRate, other);

    const quotation: Quotation = {
      id: initial?.id ?? `QT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      customerId: customerId.trim(),
      date,
      validUntil,
      status,

      customer: customerName.trim(),
      email: email.trim(),
      total: finalTotals.total,

      customerCompany: customerCompany.trim(),
      customerAddress: customerAddress.trim(),
      customerCityStateZip: customerCityStateZip.trim(),
      customerPhone: customerPhone.trim(),

      items: cleanItems,
      taxRate,
      other,
      terms,

      subtotal: finalTotals.subtotal,
      taxable: finalTotals.taxable,
      taxDue: finalTotals.taxDue,
    };

    onSave(quotation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{ fontFamily: fontStack, fontWeight: 300 }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-gray-900" style={{ fontWeight: 400 }}>
              {initial ? "Edit Quotation" : "New Quotation"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details for your quote template
              {company.companyName ? ` — ${company.companyName}` : ""}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6">
          {/* Customer */}
          <SectionLabel>Customer</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer Name">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
                className={inputClass}
              />
            </Field>
            <Field label="Customer Company">
              <input
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="Company Name"
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className={inputClass}
              />
            </Field>
            <Field label="Street Address">
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Street Address"
                className={inputClass}
              />
            </Field>
            <Field label="City, ST ZIP">
              <input
                type="text"
                value={customerCityStateZip}
                onChange={(e) => setCustomerCityStateZip(e.target.value)}
                placeholder="City, ST ZIP"
                className={inputClass}
              />
            </Field>
          </div>

          {/* Quote meta */}
          <SectionLabel className="mt-6">Quote Details</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Customer ID">
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Valid Until">
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as QuotationStatus)
                }
                className={inputClass}
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>
          </div>

          {/* Items */}
          <SectionLabel className="mt-6">Line Items</SectionLabel>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAFB] text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-normal">Description</th>
                  <th className="w-28 px-3 py-2 text-right font-normal">
                    Unit Price
                  </th>
                  <th className="w-16 px-3 py-2 text-center font-normal">
                    Qty
                  </th>
                  <th className="w-16 px-3 py-2 text-center font-normal">
                    Taxed
                  </th>
                  <th className="w-28 px-3 py-2 text-right font-normal">
                    Amount
                  </th>
                  <th className="w-10 px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Item description"
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unitPrice: Number(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-right text-sm outline-none focus:border-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, {
                            qty: Number(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-gray-200 px-2 text-center text-sm outline-none focus:border-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.taxed}
                        onChange={(e) =>
                          updateItem(item.id, { taxed: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">
                      {formatCurrency(item.unitPrice * item.qty)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add line item
          </button>

          {/* Totals + terms */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <SectionLabel>Terms and Conditions</SectionLabel>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <SectionLabel>Totals</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tax rate (%)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Other">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={other}
                    onChange={(e) => setOther(Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4 space-y-1.5 rounded-xl bg-[#F5F6F7] p-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Taxable</span>
                  <span>{formatCurrency(totals.taxable)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax due</span>
                  <span>{formatCurrency(totals.taxDue)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 text-gray-900" style={{ fontWeight: 600 }}>
                  <span>Total</span>
                  <span>
                    {formatCurrency(totals.subtotal + totals.taxDue + other)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full border border-gray-200 px-5 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-11 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black"
              style={{ fontWeight: 500 }}
            >
              {initial ? "Save Changes" : "Create Quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`mb-3 text-xs uppercase tracking-wider text-gray-400 ${className}`}
    >
      {children}
    </p>
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

/* ----------------------------- */
/* Quote View / Overview Modal   */
/* ----------------------------- */

function QuoteViewModal({
  company,
  quotation,
  onClose,
  onDownload,
  onEmail,
}: {
  company: CompanyInfo;
  quotation: Quotation;
  onClose: () => void;
  onDownload: () => void;
  onEmail: () => void;
}) {
  const [sending, setSending] = useState(false);

  const handleEmail = () => {
    setSending(true);
    onEmail();
    setTimeout(() => setSending(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div
          className="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          style={{ fontFamily: fontStack, fontWeight: 300 }}
        >
          <div>
            <p className="text-xs text-gray-500">QUOTATION OVERVIEW</p>
            <h2 className="mt-1 text-lg text-gray-900" style={{ fontWeight: 400 }}>
              {quotation.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto bg-gray-50 p-6">
          <QuoteDocument company={company} quotation={quotation} />
        </div>

        <div className="flex flex-col justify-end gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onDownload}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 px-5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>

          <button
            type="button"
            onClick={handleEmail}
            disabled={sending}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Share to {quotation.email || "customer's email"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- */
/* Quote Document (visual)       */
/* ----------------------------- */

function QuoteDocument({
  company,
  quotation,
}: {
  company: CompanyInfo;
  quotation: Quotation;
}) {
  return (
    <div className="mx-auto max-w-[720px] rounded-lg border border-gray-200 bg-white p-8 text-[13px] text-gray-800">
      {/* Letterhead */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-semibold text-gray-900">
            {company.companyName || "Company Name"}
          </div>
          <div className="mt-2 space-y-0.5 text-gray-500">
            {company.streetAddress && <p>{company.streetAddress}</p>}
            {company.cityStateZip && <p>{company.cityStateZip}</p>}
            {company.website && <p>Website: {company.website}</p>}
            {company.phone && <p>Phone: {company.phone}</p>}
            {company.fax && <p>Fax: {company.fax}</p>}
            {company.preparedBy && <p>Prepared By: {company.preparedBy}</p>}
          </div>
        </div>

        <div className="text-right">
          <div
            className="text-3xl font-bold tracking-wide"
            style={{ color: BRAND_BLUE }}
          >
            QUOTE
          </div>

          <table className="mt-3 border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-right text-gray-500">
                  DATE
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {formatDate(quotation.date)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-right text-gray-500">
                  QUOTE #
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {quotation.id}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-right text-gray-500">
                  CUSTOMER ID
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {quotation.customerId}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 text-right text-gray-500">
                  VALID UNTIL
                </td>
                <td className="border border-gray-200 px-2 py-1">
                  {formatDate(quotation.validUntil)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer */}
      <div
        className="mt-6 px-3 py-1.5 text-xs font-semibold tracking-wide text-white"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        CUSTOMER
      </div>
      <div className="mt-2 space-y-0.5 pb-2">
        <p className="font-medium text-gray-900">{quotation.customer}</p>
        {quotation.customerCompany && <p>{quotation.customerCompany}</p>}
        {quotation.customerAddress && <p>{quotation.customerAddress}</p>}
        {quotation.customerCityStateZip && (
          <p>{quotation.customerCityStateZip}</p>
        )}
        {quotation.customerPhone && <p>{quotation.customerPhone}</p>}
      </div>

      {/* Items */}
      <table className="mt-4 w-full border-collapse text-xs">
        <thead>
          <tr style={{ backgroundColor: BRAND_BLUE }}>
            <th className="px-3 py-2 text-left font-semibold text-white">
              DESCRIPTION
            </th>
            <th className="px-3 py-2 text-right font-semibold text-white">
              UNIT PRICE
            </th>
            <th className="px-3 py-2 text-center font-semibold text-white">
              QTY
            </th>
            <th className="px-3 py-2 text-center font-semibold text-white">
              TAXED
            </th>
            <th className="px-3 py-2 text-right font-semibold text-white">
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => (
            <tr
              key={item.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#F7F7F9",
              }}
            >
              <td className="px-3 py-2">{item.description}</td>
              <td className="px-3 py-2 text-right">
                {item.unitPrice.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-center">{item.qty}</td>
              <td className="px-3 py-2 text-center">
                {item.taxed ? "X" : ""}
              </td>
              <td className="px-3 py-2 text-right">
                {(item.unitPrice * item.qty).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Terms + Totals */}
      <div className="mt-5 grid grid-cols-2 gap-6">
        <div>
          <div
            className="px-3 py-1.5 text-xs font-semibold tracking-wide text-white"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            TERMS AND CONDITIONS
          </div>
          <div className="mt-2 whitespace-pre-line text-xs text-gray-600">
            {quotation.terms}
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Customer Acceptance (sign below):
          </p>
          <div className="mt-6 w-4/5 border-b border-gray-400" />
          <p className="mt-1 text-xs text-gray-600">Print Name:</p>
        </div>

        <table className="h-fit border-collapse self-start text-xs">
          <tbody>
            <tr>
              <td className="px-2 py-1.5 text-right text-gray-500">
                Subtotal
              </td>
              <td className="border border-gray-200 px-3 py-1.5 text-right">
                {formatCurrency(quotation.subtotal)}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1.5 text-right text-gray-500">
                Taxable
              </td>
              <td className="border border-gray-200 px-3 py-1.5 text-right">
                {formatCurrency(quotation.taxable)}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1.5 text-right text-gray-500">
                Tax rate
              </td>
              <td className="border border-gray-200 px-3 py-1.5 text-right">
                {quotation.taxRate.toFixed(2)}%
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1.5 text-right text-gray-500">
                Tax due
              </td>
              <td className="border border-gray-200 px-3 py-1.5 text-right">
                {formatCurrency(quotation.taxDue)}
              </td>
            </tr>
            <tr>
              <td className="px-2 py-1.5 text-right text-gray-500">Other</td>
              <td className="border border-gray-200 px-3 py-1.5 text-right">
                {formatCurrency(quotation.other)}
              </td>
            </tr>
            <tr style={{ backgroundColor: BRAND_BLUE_LIGHT }}>
              <td className="px-2 py-2 text-right font-semibold text-gray-900">
                TOTAL
              </td>
              <td className="border border-gray-200 px-3 py-2 text-right font-semibold text-gray-900">
                {formatCurrency(quotation.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>If you have any questions about this price quote, please contact</p>
        <p className="font-medium text-gray-700">
          {[company.preparedBy, company.phone].filter(Boolean).join(", ") ||
            "your account manager"}
        </p>
        <p className="mt-2 font-semibold italic text-gray-700">
          Thank You For Your Business!
        </p>
      </div>
    </div>
  );
}

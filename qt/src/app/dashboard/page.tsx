"use client";

import { useEffect, useState } from "react";
import {
  Package,
  FileText,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
};

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

export default function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [viewQuotation, setViewQuotation] =
    useState<Quotation | null>(null);

  const [editingInventory, setEditingInventory] =
    useState<InventoryItem | null>(null);

  const [deletingInventory, setDeletingInventory] =
    useState<InventoryItem | null>(null);

  const [deletingQuotation, setDeletingQuotation] =
    useState<Quotation | null>(null);

  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    const loadData = () => {
      const storedInventory =
        localStorage.getItem("inventory");

      if (storedInventory) {
        try {
          setInventory(JSON.parse(storedInventory));
        } catch {
          setInventory([]);
        }
      } else {
        setInventory([]);
      }

      const storedQuotations =
        localStorage.getItem("quotations");

      if (storedQuotations) {
        try {
          setQuotations(JSON.parse(storedQuotations));
        } catch {
          setQuotations([]);
        }
      } else {
        setQuotations([]);
      }
    };

    loadData();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const hasActivities =
    inventory.length > 0 ||
    quotations.length > 0;

  // --------------------------------------------------
  // DELETE INVENTORY
  // --------------------------------------------------

  const deleteInventory = async () => {
    if (!deletingInventory) return;

    setSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const updatedInventory = inventory.filter(
      (item) => item.id !== deletingInventory.id
    );

    setInventory(updatedInventory);

    localStorage.setItem(
      "inventory",
      JSON.stringify(updatedInventory)
    );

    setDeletingInventory(null);
    setSaving(false);
  };

  // --------------------------------------------------
  // DELETE QUOTATION
  // --------------------------------------------------

  const deleteQuotation = async () => {
    if (!deletingQuotation) return;

    setSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const updatedQuotations = quotations.filter(
      (quotation) =>
        quotation.id !== deletingQuotation.id
    );

    setQuotations(updatedQuotations);

    localStorage.setItem(
      "quotations",
      JSON.stringify(updatedQuotations)
    );

    setDeletingQuotation(null);
    setSaving(false);
  };

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      {/* =====================================================
          DASHBOARD HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1
          className="text-2xl tracking-tight text-gray-900"
          style={{
            fontWeight: 300,
          }}
        >
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your recent inventory and quotations.
        </p>
      </div>

      {/* =====================================================
          EMPTY DASHBOARD
      ===================================================== */}

      {!hasActivities && (
        <div className="flex min-h-[calc(80vh-8rem)] w-full items-center justify-center px-6 text-center">
          <div className="flex flex-col items-center justify-center">

            {/* PACKAGE ICON - NO CIRCLE / NO BACKGROUND */}
            <Package className="h-8 w-8 text-gray-400" />

            <h2
              className="mt-5 text-xl text-gray-900"
              style={{
                fontWeight: 400,
              }}
            >
              No Activities yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add inventory or create a quotation to get started.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          DASHBOARD WITH ACTIVITIES
      ===================================================== */}

      {hasActivities && (
        <>
          {/* =================================================
              INVENTORY
          ================================================= */}

          {inventory.length > 0 && (
            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <Package className="h-4 w-4 text-gray-500" />

                <h2
                  className="text-lg text-gray-900"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  Inventory
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b border-gray-100 bg-[#FAFAFB]">
                      <tr>
                        <th className="px-6 py-3 font-normal text-gray-500">
                          Product
                        </th>

                        <th className="px-6 py-3 font-normal text-gray-500">
                          SKU
                        </th>

                        <th className="px-6 py-3 font-normal text-gray-500">
                          Category
                        </th>

                        <th className="px-6 py-3 font-normal text-gray-500">
                          Stock
                        </th>

                        <th className="px-6 py-3 text-right font-normal text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {inventory
                        .slice(0, 5)
                        .map((item) => (
                          <tr
                            key={item.id}
                            className="transition hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <p
                                className="text-gray-900"
                                style={{
                                  fontWeight: 500,
                                }}
                              >
                                {item.name}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-gray-500">
                              {item.sku}
                            </td>

                            <td className="px-6 py-4 text-gray-500">
                              {item.category}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={
                                  item.quantity <= 5
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }
                                style={{
                                  fontWeight: 500,
                                }}
                              >
                                {item.quantity}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingInventory(item)
                                  }
                                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeletingInventory(item)
                                  }
                                  className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              QUOTATIONS
          ================================================= */}

          {quotations.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />

                <h2
                  className="text-lg text-gray-900"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  Quotations
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b border-gray-100 bg-[#FAFAFB]">
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

                        <th className="px-6 py-3 font-normal text-gray-500">
                          Status
                        </th>

                        <th className="px-6 py-3 text-right font-normal text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {quotations
                        .slice(0, 5)
                        .map((quotation) => (
                          <tr
                            key={quotation.id}
                            className="transition hover:bg-gray-50"
                          >
                            <td
                              className="px-6 py-4 text-gray-900"
                              style={{
                                fontWeight: 500,
                              }}
                            >
                              {quotation.id}
                            </td>

                            <td className="px-6 py-4">
                              <p
                                className="text-gray-900"
                                style={{
                                  fontWeight: 500,
                                }}
                              >
                                {quotation.customer}
                              </p>

                              <p className="text-xs text-gray-500">
                                {quotation.email}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-gray-500">
                              {new Date(
                                quotation.date
                              ).toLocaleDateString(
                                "en-PH",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span className="text-gray-600">
                                {quotation.status}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewQuotation(
                                      quotation
                                    )
                                  }
                                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeletingQuotation(
                                      quotation
                                    )
                                  }
                                  className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* =====================================================
          VIEW QUOTATION
      ===================================================== */}

      {viewQuotation && (
        <Modal
          title="Quotation details"
          onClose={() => setViewQuotation(null)}
        >
          <div className="space-y-4">
            <InfoRow
              label="Quotation #"
              value={viewQuotation.id}
            />

            <InfoRow
              label="Customer"
              value={viewQuotation.customer}
            />

            <InfoRow
              label="Email"
              value={viewQuotation.email}
            />

            <InfoRow
              label="Date"
              value={new Date(
                viewQuotation.date
              ).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />

            <InfoRow
              label="Status"
              value={viewQuotation.status}
            />

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Total
              </p>

              <p
                className="mt-1 text-xl text-gray-900"
                style={{
                  fontWeight: 400,
                }}
              >
                ₱
                {viewQuotation.total.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewQuotation(null)}
            className="mt-6 h-11 w-full rounded-full bg-gray-900 text-sm text-white transition hover:bg-black"
            style={{
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </Modal>
      )}

      {/* =====================================================
          EDIT INVENTORY
      ===================================================== */}

      {editingInventory && (
        <EditInventoryModal
          item={editingInventory}
          onClose={() => setEditingInventory(null)}
          onSave={(updatedItem) => {
            const updatedInventory =
              inventory.map((item) =>
                item.id === updatedItem.id
                  ? updatedItem
                  : item
              );

            setInventory(updatedInventory);

            localStorage.setItem(
              "inventory",
              JSON.stringify(updatedInventory)
            );

            setEditingInventory(null);
          }}
        />
      )}

      {/* =====================================================
          DELETE INVENTORY
      ===================================================== */}

      {deletingInventory && (
        <Modal
          title="Delete inventory"
          onClose={() => setDeletingInventory(null)}
        >
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span
              className="text-gray-900"
              style={{
                fontWeight: 500,
              }}
            >
              {deletingInventory.name}
            </span>
            ?
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setDeletingInventory(null)
              }
              className="h-11 flex-1 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={deleteInventory}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-60"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          DELETE QUOTATION
      ===================================================== */}

      {deletingQuotation && (
        <Modal
          title="Delete quotation"
          onClose={() => setDeletingQuotation(null)}
        >
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span
              className="text-gray-900"
              style={{
                fontWeight: 500,
              }}
            >
              {deletingQuotation.id}
            </span>
            ?
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setDeletingQuotation(null)
              }
              className="h-11 flex-1 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={deleteQuotation}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-60"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

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
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-lg text-gray-900"
            style={{
              fontWeight: 400,
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span
        className="text-sm text-gray-900"
        style={{
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   EDIT INVENTORY MODAL
========================================================= */

function EditInventoryModal({
  item,
  onClose,
  onSave,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}) {
  const [name, setName] = useState(item.name);
  const [sku, setSku] = useState(item.sku);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(
    String(item.quantity)
  );
  const [price, setPrice] = useState(
    String(item.price)
  );

  const handleSave = () => {
    if (
      !name.trim() ||
      !sku.trim() ||
      !category.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const newQuantity = Number(quantity);
    const newPrice = Number(price);

    if (
      Number.isNaN(newQuantity) ||
      Number.isNaN(newPrice)
    ) {
      alert("Please enter valid numbers.");
      return;
    }

    if (
      newQuantity < 0 ||
      newPrice < 0
    ) {
      alert("Values cannot be negative.");
      return;
    }

    onSave({
      ...item,
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      quantity: newQuantity,
      price: newPrice,
    });
  };

  return (
    <Modal
      title="Edit inventory"
      onClose={onClose}
    >
      <div className="space-y-3">
        <Input
          label="Product name"
          value={name}
          onChange={setName}
        />

        <Input
          label="SKU"
          value={sku}
          onChange={setSku}
        />

        <Input
          label="Category"
          value={category}
          onChange={setCategory}
        />

        <Input
          label="Quantity"
          type="number"
          value={quantity}
          onChange={setQuantity}
        />

        <Input
          label="Price"
          type="number"
          value={price}
          onChange={setPrice}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="h-11 flex-1 rounded-full bg-gray-900 text-sm text-white hover:bg-black"
          style={{
            fontWeight: 500,
          }}
        >
          Save changes
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-gray-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-full border border-gray-200 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />
    </label>
  );
}
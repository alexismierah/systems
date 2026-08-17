"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
} from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
};

const fontStack =
  "'Avenir Light', 'Avenir Next Light', Avenir, 'Century Gothic', sans-serif";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
  });

  // --------------------------------------------------
  // LOAD INVENTORY
  // --------------------------------------------------

  useEffect(() => {
    const stored = localStorage.getItem("inventory");

    if (!stored) {
      setItems([]);
      return;
    }

    try {
      setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    }
  }, []);

  // --------------------------------------------------
  // SAVE INVENTORY
  // --------------------------------------------------

  const saveItems = (newItems: InventoryItem[]) => {
    setItems(newItems);

    localStorage.setItem(
      "inventory",
      JSON.stringify(newItems)
    );
  };

  // --------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(items.map((item) => item.category))
    );

    return ["All", ...uniqueCategories];
  }, [items]);

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredItems = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.sku.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  // --------------------------------------------------
  // MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingItem(null);

    setForm({
      name: "",
      sku: "",
      category: "",
      quantity: "",
      price: "",
    });

    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);

    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: String(item.quantity),
      price: String(item.price),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.category.trim() ||
      form.quantity === "" ||
      form.price === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const quantity = Number(form.quantity);
    const price = Number(form.price);

    if (Number.isNaN(quantity) || Number.isNaN(price)) {
      alert("Please enter valid numbers.");
      return;
    }

    if (quantity < 0 || price < 0) {
      alert("Quantity and price cannot be negative.");
      return;
    }

    if (editingItem) {
      const updatedItems = items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: form.name.trim(),
              sku: form.sku.trim(),
              category: form.category.trim(),
              quantity,
              price,
            }
          : item
      );

      saveItems(updatedItems);
    } else {
      const newItem: InventoryItem = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        quantity,
        price,
      };

      saveItems([...items, newItem]);
    }

    closeModal();
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const deleteItem = (id: string) => {
    const item = items.find((item) => item.id === id);

    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.name}" from inventory?`
    );

    if (!confirmed) return;

    saveItems(
      items.filter((item) => item.id !== id)
    );
  };

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalProducts = items.length;

  const totalStock = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const lowStock = items.filter(
    (item) => item.quantity <= 5
  ).length;

  const inventoryValue = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1
            className="text-2xl tracking-tight text-gray-900"
            style={{ fontWeight: 300 }}
          >
            Inventory
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your products, stock, and pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black"
          style={{ fontWeight: 400 }}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mb-8 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Products"
          value={totalProducts}
        />

        <Stat
          label="Total Stock"
          value={totalStock}
        />

        <Stat
          label="Low Stock"
          value={lowStock}
          warning={lowStock > 0}
        />

        <Stat
          label="Inventory Value"
          value={`₱${inventoryValue.toLocaleString()}`}
        />
      </div>

      {/* =====================================================
          INVENTORY CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

        {/* Toolbar */}

        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2
              className="text-base text-gray-900"
              style={{ fontWeight: 400 }}
            >
              Inventory Items
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {filteredItems.length}{" "}
              {filteredItems.length === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            {/* Search */}

            <div className="relative sm:w-72">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search inventory"
                className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Category */}

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="h-10 w-full appearance-none rounded-full border border-gray-200 bg-gray-50 pl-10 pr-9 text-sm text-gray-700 outline-none transition focus:border-gray-900 focus:bg-white sm:w-40"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-6 py-3 text-xs font-light uppercase tracking-wide text-gray-400">
                  Product
                </th>

                <th className="px-6 py-3 text-xs font-light uppercase tracking-wide text-gray-400">
                  SKU
                </th>

                <th className="px-6 py-3 text-xs font-light uppercase tracking-wide text-gray-400">
                  Category
                </th>

                <th className="px-6 py-3 text-xs font-light uppercase tracking-wide text-gray-400">
                  Stock
                </th>

                <th className="px-6 py-3 text-xs font-light uppercase tracking-wide text-gray-400">
                  Price
                </th>

                <th className="px-6 py-3 text-right text-xs font-light uppercase tracking-wide text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredItems.map((item) => (

                <tr
                  key={item.id}
                  className="transition hover:bg-gray-50/60"
                >

                  {/* Product */}

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                        <Package className="h-4 w-4 text-gray-500" />
                      </div>

                      <div>
                        <p
                          className="text-gray-900"
                          style={{ fontWeight: 400 }}
                        >
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Product
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* SKU */}

                  <td className="px-6 py-5 text-gray-500">
                    {item.sku}
                  </td>

                  {/* Category */}

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {item.category}
                    </span>
                  </td>

                  {/* Stock */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <span
                        className={
                          item.quantity <= 5
                            ? "text-red-600"
                            : item.quantity <= 10
                              ? "text-amber-600"
                              : "text-gray-700"
                        }
                      >
                        {item.quantity}
                      </span>

                      {item.quantity <= 5 && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-500">
                          Low
                        </span>
                      )}

                    </div>

                  </td>

                  {/* Price */}

                  <td className="px-6 py-5 text-gray-700">
                    ₱{item.price.toLocaleString()}
                  </td>

                  {/* Actions */}

                  <td className="px-6 py-5">

                    <div className="flex justify-end gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(item)
                        }
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteItem(item.id)
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

              {/* Empty state */}

              {filteredItems.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>

                    <p
                      className="mt-4 text-sm text-gray-700"
                      style={{ fontWeight: 400 }}
                    >
                      {items.length === 0
                        ? "No inventory yet"
                        : "No inventory found"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {items.length === 0
                        ? "Add your first inventory item to get started."
                        : "Try changing your search or filter."}
                    </p>

                    {items.length === 0 && (
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-5 rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white transition hover:bg-black"
                      >
                        Add Item
                      </button>
                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </table>
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
          onClick={closeModal}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Inventory
                </p>

                <h2
                  className="mt-1 text-lg text-gray-900"
                  style={{ fontWeight: 300 }}
                >
                  {editingItem
                    ? "Edit item"
                    : "Add item"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >

              <Input
                label="Product name"
                value={form.name}
                placeholder="Enter product name"
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
              />

              <Input
                label="SKU"
                value={form.sku}
                placeholder="Enter SKU"
                onChange={(value) =>
                  setForm({
                    ...form,
                    sku: value,
                  })
                }
              />

              <Input
                label="Category"
                value={form.category}
                placeholder="Enter category"
                onChange={(value) =>
                  setForm({
                    ...form,
                    category: value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">

                <Input
                  label="Quantity"
                  type="number"
                  value={form.quantity}
                  placeholder="0"
                  onChange={(value) =>
                    setForm({
                      ...form,
                      quantity: value,
                    })
                  }
                />

                <Input
                  label="Price"
                  type="number"
                  value={form.price}
                  placeholder="0.00"
                  onChange={(value) =>
                    setForm({
                      ...form,
                      price: value,
                    })
                  }
                />

              </div>

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 flex-1 rounded-full border border-gray-200 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 flex-1 rounded-full bg-gray-900 text-sm text-white transition hover:bg-black"
                  style={{ fontWeight: 400 }}
                >
                  {editingItem
                    ? "Save changes"
                    : "Add item"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT COMPONENT
========================================================= */

function Stat({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string | number;
  warning?: boolean;
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl ${
          warning ? "text-red-500" : "text-gray-900"
        }`}
        style={{ fontWeight: 300 }}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function Input({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-gray-500">
        {label}
      </label>

      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        step={
          type === "number" && label === "Price"
            ? "0.01"
            : undefined
        }
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}
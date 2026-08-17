"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");

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

  // Load inventory
  useEffect(() => {
    const stored = localStorage.getItem("inventory");

    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, []);

  // Save inventory
  const saveItems = (newItems: InventoryItem[]) => {
    setItems(newItems);

    localStorage.setItem(
      "inventory",
      JSON.stringify(newItems)
    );
  };

  // Search
  const filteredItems = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return items;
    }

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchValue) ||
        item.sku.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue)
    );
  }, [items, search]);

  // Open add modal
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

  // Open edit modal
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

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // Add / update inventory item
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

  // Delete
  const deleteItem = (id: string) => {
    const item = items.find((item) => item.id === id);

    if (!item) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.name}" from inventory?`
    );

    if (!confirmed) {
      return;
    }

    const updatedItems = items.filter(
      (item) => item.id !== id
    );

    saveItems(updatedItems);
  };

  // Statistics
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
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Package className="h-5 w-5 text-gray-700" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Inventory
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Manage your products, stock, pricing, and
            categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Stock
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalStock}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            {lowStock}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Inventory Value
          </p>

          <p className="mt-2 text-2xl font-semibold">
            ₱{inventoryValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border bg-white">
        <div className="flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-semibold">
              Inventory Items
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredItems.length} item
              {filteredItems.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="h-10 w-full rounded-lg border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Product
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  SKU
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Category
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Stock
                </th>

                <th className="px-6 py-3 font-medium text-gray-500">
                  Price
                </th>

                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {item.name}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {item.sku}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {item.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        item.quantity <= 5
                          ? "font-medium text-red-600"
                          : item.quantity <= 10
                            ? "font-medium text-yellow-600"
                            : "text-gray-700"
                      }
                    >
                      {item.quantity}
                    </span>

                    {item.quantity <= 5 && (
                      <span className="ml-2 text-xs text-red-500">
                        Low stock
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-700">
                    ₱{item.price.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(item)
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteItem(item.id)
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <Package className="mx-auto h-8 w-8 text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No inventory found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Add your first inventory item to
                      get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {editingItem
                    ? "Edit Inventory Item"
                    : "Add Inventory Item"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the product information below.
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
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Product Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  SKU
                </label>

                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sku: e.target.value,
                    })
                  }
                  placeholder="Enter SKU"
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Category
                </label>

                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  placeholder="Enter category"
                  className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
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
                  {editingItem
                    ? "Save Changes"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
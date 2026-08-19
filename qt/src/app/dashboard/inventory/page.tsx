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
  FolderPlus,
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
  const [categories, setCategories] = useState<string[]>([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);

  const [editingCategory, setEditingCategory] =
    useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    price: "",
  });

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    const storedInventory = localStorage.getItem("inventory");
    const storedCategories = localStorage.getItem(
      "inventory-categories"
    );

    if (storedInventory) {
      try {
        setItems(JSON.parse(storedInventory));
      } catch {
        setItems([]);
      }
    }

    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories));
      } catch {
        setCategories([]);
      }
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
  // SAVE CATEGORIES
  // --------------------------------------------------

  const saveCategories = (newCategories: string[]) => {
    setCategories(newCategories);

    localStorage.setItem(
      "inventory-categories",
      JSON.stringify(newCategories)
    );
  };

  // --------------------------------------------------
  // CREATE / EDIT SUBTAB
  // --------------------------------------------------

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowCategoryModal(true);
  };

  const openEditCategory = (category: string) => {
    setEditingCategory(category);
    setCategoryName(category);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleCategorySubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      alert("Please enter a subtab name.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.toLowerCase() === name.toLowerCase() &&
        category !== editingCategory
    );

    if (duplicate) {
      alert("This subtab already exists.");
      return;
    }

    // EDIT SUBTAB
    if (editingCategory) {
      const updatedCategories = categories.map(
        (category) =>
          category === editingCategory ? name : category
      );

      saveCategories(updatedCategories);

      const updatedItems = items.map((item) =>
        item.category === editingCategory
          ? {
              ...item,
              category: name,
            }
          : item
      );

      saveItems(updatedItems);

      if (activeCategory === editingCategory) {
        setActiveCategory(name);
      }

      if (categoryFilter === editingCategory) {
        setCategoryFilter(name);
      }
    }

    // CREATE SUBTAB
    else {
      const updatedCategories = [
        ...categories,
        name,
      ];

      saveCategories(updatedCategories);

      setActiveCategory(name);
      setCategoryFilter(name);
    }

    closeCategoryModal();
  };

  // --------------------------------------------------
  // DELETE SUBTAB
  // --------------------------------------------------

  const deleteCategory = (category: string) => {
    const itemCount = items.filter(
      (item) => item.category === category
    ).length;

    const message =
      itemCount > 0
        ? `This subtab contains ${itemCount} ${
            itemCount === 1 ? "item" : "items"
          }. Deleting it will also remove those inventory items. Continue?`
        : `Delete "${category}" subtab?`;

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    const updatedCategories = categories.filter(
      (item) => item !== category
    );

    saveCategories(updatedCategories);

    if (itemCount > 0) {
      saveItems(
        items.filter(
          (item) => item.category !== category
        )
      );
    }

    if (updatedCategories.length === 0) {
      setActiveCategory("All");
      setCategoryFilter("All");
      setSearch("");
      return;
    }

    if (activeCategory === category) {
      setActiveCategory("All");
    }

    if (categoryFilter === category) {
      setCategoryFilter("All");
    }
  };

  // --------------------------------------------------
  // FILTERED ITEMS
  // --------------------------------------------------

  const filteredItems = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.sku.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue);

      const matchesTab =
        activeCategory === "All" ||
        item.category === activeCategory;

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesCategory
      );
    });
  }, [
    items,
    search,
    activeCategory,
    categoryFilter,
  ]);

  // --------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------

  const openAddModal = () => {
    if (categories.length === 0) {
      openCreateCategory();
      return;
    }

    setEditingItem(null);

    setForm({
      name: "",
      sku: "",
      category:
        activeCategory !== "All"
          ? activeCategory
          : categories[0],
      quantity: "",
      price: "",
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // EDIT ITEM
  // --------------------------------------------------

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
  // CREATE / UPDATE ITEM
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

    if (
      Number.isNaN(quantity) ||
      Number.isNaN(price)
    ) {
      alert("Please enter valid numbers.");
      return;
    }

    if (quantity < 0 || price < 0) {
      alert(
        "Quantity and price cannot be negative."
      );
      return;
    }

    // UPDATE
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
    }

    // CREATE
    else {
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
  // DELETE ITEM
  // --------------------------------------------------

  const deleteItem = (id: string) => {
    const item = items.find(
      (item) => item.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.name}" from inventory?`
    );

    if (!confirmed) return;

    saveItems(
      items.filter(
        (item) => item.id !== id
      )
    );
  };

  // --------------------------------------------------
  // CATEGORY COUNT
  // --------------------------------------------------

  const getCategoryCount = (category: string) => {
    if (category === "All") {
      return items.length;
    }

    return items.filter(
      (item) => item.category === category
    ).length;
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div
      className="min-h-full"
      style={{
        fontFamily: fontStack,
        fontWeight: 300,
      }}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1
            className="text-2xl tracking-tight text-gray-900"
            style={{
              fontWeight: 300,
            }}
          >
            Inventory
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your products, stock, and pricing.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openCreateCategory}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <FolderPlus className="h-4 w-4" />
              Create Subtab
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black"
              style={{
                fontWeight: 400,
              }}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          NO SUBTAB STATE

          IMPORTANT:
          There is NO inventory table here.
      ================================================== */}

      {categories.length === 0 ? (
        <div className="flex min-h-[520px] items-center justify-center">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
              <FolderPlus className="h-7 w-7 text-gray-400" />
            </div>

            <h2
              className="mt-6 text-lg text-gray-900"
              style={{
                fontWeight: 400,
              }}
            >
              Create a subtab first
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Before adding inventory items,
              create a subtab to organize your
              products.
            </p>

            <button
              type="button"
              onClick={openCreateCategory}
              className="mx-auto mt-6 flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-6 text-sm text-white transition hover:bg-black"
              style={{
                fontWeight: 400,
              }}
            >
              <Plus className="h-4 w-4" />
              Create Subtab
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ==================================================
              SUBTABS
          ================================================== */}

          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {/* ALL */}

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setCategoryFilter("All");
                }}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm transition ${
                  activeCategory === "All"
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    activeCategory === "All"
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {getCategoryCount("All")}
                </span>
              </button>

              {/* CATEGORY SUBTABS */}

              {categories.map((category) => (
                <div
                  key={category}
                  className="group relative flex shrink-0 items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setCategoryFilter(category);
                    }}
                    className={`flex h-10 items-center gap-2 rounded-full px-4 pr-20 text-sm transition ${
                      activeCategory === category
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {category}

                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        activeCategory === category
                          ? "bg-white/15 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {getCategoryCount(category)}
                    </span>
                  </button>

                  {/* SUBTAB ACTIONS */}

                  <div className="absolute right-2 hidden items-center gap-0.5 group-hover:flex">
                    <button
                      type="button"
                      onClick={() =>
                        openEditCategory(category)
                      }
                      className="rounded-full p-1.5 text-gray-400 hover:bg-white/20 hover:text-current"
                      title="Edit subtab"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCategory(category)
                      }
                      className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete subtab"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* NEW SUBTAB */}

              <button
                type="button"
                onClick={openCreateCategory}
                className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 text-sm text-gray-400 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
                New Subtab
              </button>
            </div>
          </div>

          {/* ==================================================
              INVENTORY CONTENT

              No white panel around the table.
          ================================================== */}

          <div>
            {/* TOOLBAR */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2
                  className="text-base text-gray-900"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  {activeCategory === "All"
                    ? "Inventory Items"
                    : activeCategory}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}

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

                {/* FILTER */}

                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      const value = e.target.value;

                      setCategoryFilter(value);
                      setActiveCategory(value);
                    }}
                    className="h-10 w-full appearance-none rounded-full border border-gray-200 bg-gray-50 pl-10 pr-9 text-sm text-gray-700 outline-none transition focus:border-gray-900 focus:bg-white sm:w-40"
                  >
                    <option value="All">
                      All Categories
                    </option>

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

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
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
                      {/* PRODUCT */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                            <Package className="h-4 w-4 text-gray-500" />
                          </div>

                          <div>
                            <p
                              className="text-gray-900"
                              style={{
                                fontWeight: 400,
                              }}
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

                      {/* CATEGORY */}

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          {item.category}
                        </span>
                      </td>

                      {/* STOCK */}

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

                      {/* PRICE */}

                      <td className="px-6 py-5 text-gray-700">
                        ₱
                        {item.price.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      {/* ACTIONS */}

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

                  {/* EMPTY TABLE STATE */}

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
                          style={{
                            fontWeight: 400,
                          }}
                        >
                          No inventory items
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Add an item to this
                          subtab to get started.
                        </p>

                        <button
                          type="button"
                          onClick={openAddModal}
                          className="mx-auto mt-5 flex h-10 items-center gap-2 rounded-full bg-gray-900 px-5 text-sm text-white transition hover:bg-black"
                        >
                          <Plus className="h-4 w-4" />
                          Add Item
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==================================================
          CREATE / EDIT SUBTAB MODAL
      ================================================== */}

      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
          onClick={closeCategoryModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Inventory
                </p>

                <h2
                  className="mt-1 text-lg text-gray-900"
                  style={{
                    fontWeight: 300,
                  }}
                >
                  {editingCategory
                    ? "Edit subtab"
                    : "Create subtab"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCategorySubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">
                  Subtab name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  placeholder="e.g. Artificial Flowers"
                  autoFocus
                  className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs leading-5 text-gray-500">
                  Create a subtab to organize your
                  inventory. You can add products under
                  each subtab.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="h-11 flex-1 rounded-full border border-gray-200 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 flex-1 rounded-full bg-gray-900 text-sm text-white transition hover:bg-black"
                  style={{
                    fontWeight: 400,
                  }}
                >
                  {editingCategory
                    ? "Save changes"
                    : "Create Subtab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          ADD / EDIT ITEM MODAL
      ================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Inventory
                </p>

                <h2
                  className="mt-1 text-lg text-gray-900"
                  style={{
                    fontWeight: 300,
                  }}
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

              {/* SUBTAB */}

              <div>
                <label className="mb-1.5 block text-xs text-gray-500">
                  Subtab
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className="h-11 w-full appearance-none rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
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
                  style={{
                    fontWeight: 400,
                  }}
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
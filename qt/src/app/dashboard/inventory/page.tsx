"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FolderPlus,
  ChevronDown,
  MoreVertical,
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

const teal = "#0F766E";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [subtabsExpanded, setSubtabsExpanded] = useState(true);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

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

  const menuRef = useRef<HTMLDivElement | null>(null);

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
  // CLOSE SUBTAB MENU ON OUTSIDE CLICK
  // --------------------------------------------------

  useEffect(() => {
    if (!openMenuFor) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, [openMenuFor]);

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
    setOpenMenuFor(null);
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
    }

    // CREATE SUBTAB
    else {
      const updatedCategories = [
        ...categories,
        name,
      ];

      saveCategories(updatedCategories);

      setActiveCategory(name);
    }

    closeCategoryModal();
  };

  // --------------------------------------------------
  // DELETE SUBTAB
  // --------------------------------------------------

  const deleteCategory = (category: string) => {
    setOpenMenuFor(null);

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
      setSearch("");
      return;
    }

    if (activeCategory === category) {
      setActiveCategory("All");
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

      return matchesSearch && matchesTab;
    });
  }, [items, search, activeCategory]);

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
            className="text-2xl tracking-tight text-[#101828]"
            style={{
              fontWeight: 300,
            }}
          >
            Inventory
          </h1>

          <p className="mt-2 text-sm text-[#667085]">
            Manage your products, stock, and pricing.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={openAddModal}
              className="flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[13.5px] text-white transition hover:opacity-90"
              style={{
                fontWeight: 500,
                backgroundColor: teal,
              }}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add item
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          NO SUBTAB STATE
      ================================================== */}

      {categories.length === 0 ? (
        <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#DBDFE6]">
          <div className="mx-auto max-w-md px-6 text-center">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${teal}0F` }}
            >
              <FolderPlus className="h-7 w-7" style={{ color: teal }} strokeWidth={1.5} />
            </div>

            <h2
              className="mt-6 text-lg text-[#101828]"
              style={{
                fontWeight: 400,
              }}
            >
              Create a subtab first
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#667085]">
              Before adding inventory items,
              create a subtab to organize your
              products.
            </p>

            <button
              type="button"
              onClick={openCreateCategory}
              className="mx-auto mt-6 flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm text-white transition hover:opacity-90"
              style={{
                fontWeight: 400,
                backgroundColor: teal,
              }}
            >
              <Plus className="h-4 w-4" />
              Create subtab
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[192px_minmax(0,1fr)]">
          {/* ==================================================
              SUBTAB SIDEBAR

              No surrounding panel — small, flat list like a
              file tree. "All" collapses/expands the subtabs.
          ================================================== */}

          <nav className="lg:pt-1">
            <button
              type="button"
              onClick={() =>
                setSubtabsExpanded(!subtabsExpanded)
              }
              className={`flex w-full items-center gap-2 rounded-full px-2.5 py-2 text-[13.5px] transition ${
                activeCategory === "All"
                  ? "text-[#101828]"
                  : "text-[#475467] hover:bg-[#F2F4F7]"
              }`}
              style={{ fontWeight: 500 }}
            >
              <span
                className="flex-1 cursor-pointer text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCategory("All");
                }}
              >
                All
              </span>

              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-[#98A2B3] transition-transform ${
                  subtabsExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            {subtabsExpanded && (
              <div className="mt-0.5 space-y-0.5 pl-1">
                {categories.map((category) => {
                  const isActive = activeCategory === category;
                  const isMenuOpen = openMenuFor === category;

                  return (
                    <div key={category} className="group relative">
                      <button
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className="flex w-full items-center gap-2 rounded-full py-2 pl-4 pr-8 text-left text-[13.5px] transition"
                        style={{
                          backgroundColor: isActive
                            ? `${teal}17`
                            : "transparent",
                          color: isActive ? teal : "#475467",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        <span className="flex-1 truncate">
                          {category}
                        </span>
                      </button>

                      {/* SUBTAB MENU TRIGGER */}

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuFor(
                            isMenuOpen ? null : category
                          )
                        }
                        className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 transition ${
                          isActive || isMenuOpen
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        style={{
                          color: isActive ? teal : "#98A2B3",
                        }}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {/* SUBTAB MENU */}

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-[#E4E7EC] bg-white py-1 shadow-lg"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              openEditCategory(category)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#344054] transition hover:bg-[#F9FAFB]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCategory(category)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#B42318] transition hover:bg-[#FEF3F2]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* NEW SUBTAB */}

                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="flex w-full items-center gap-2 rounded-full py-2 pl-4 pr-3 text-[13px] text-[#98A2B3] transition hover:text-[#475467]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New subtab
                </button>
              </div>
            )}
          </nav>

          {/* ==================================================
              INVENTORY TABLE
          ================================================== */}

          <div className="min-w-0 overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {/* TOOLBAR */}

            <div className="flex flex-col gap-4 border-b border-[#E4E7EC] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className="text-[15px] text-[#101828]"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {activeCategory === "All"
                    ? "Inventory items"
                    : activeCategory}
                </h2>

                <p className="mt-0.5 text-[13px] text-[#667085]">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "item"
                    : "items"}{" "}
                  listed
                </p>
              </div>

              {/* SEARCH */}

              <div className="relative sm:w-72">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                <input
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by name, SKU, category"
                  className="h-10 w-full rounded-full border border-[#DBDFE6] bg-white pl-10 pr-4 text-[13.5px] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-[#E4E7EC] bg-[#FAFAFB]">
                    <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                      Product
                    </th>

                    <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                      SKU
                    </th>

                    <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                      Category
                    </th>

                    <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                      Stock
                    </th>

                    <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                      Unit price
                    </th>

                    <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F2F4F7]">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#FAFAFB]"
                    >
                      {/* PRODUCT */}

                      <td className="px-6 py-4">
                        <p
                          className="text-[#101828]"
                          style={{
                            fontWeight: 400,
                          }}
                        >
                          {item.name}
                        </p>
                      </td>

                      {/* SKU */}

                      <td className="px-6 py-4 font-mono text-[12.5px] text-[#667085]">
                        {item.sku}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-6 py-4">
                        <span className="rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#475467]">
                          {item.category}
                        </span>
                      </td>

                      {/* STOCK */}

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.quantity <= 5 && (
                            <span className="rounded-full bg-[#FEF3F2] px-2 py-0.5 text-[11px] text-[#B42318]">
                              Low
                            </span>
                          )}

                          <span
                            className="tabular-nums"
                            style={{
                              color:
                                item.quantity <= 5
                                  ? "#B42318"
                                  : item.quantity <= 10
                                    ? "#B54708"
                                    : "#344054",
                              fontWeight: 500,
                            }}
                          >
                            {item.quantity}
                          </span>
                        </div>
                      </td>

                      {/* PRICE */}

                      <td className="px-6 py-4 text-right tabular-nums text-[#344054]">
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

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="rounded-full p-2 text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteItem(item.id)
                            }
                            className="rounded-full p-2 text-[#98A2B3] transition hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
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
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7]">
                          <Package className="h-5 w-5 text-[#98A2B3]" strokeWidth={1.5} />
                        </div>

                        <p
                          className="mt-4 text-sm text-[#101828]"
                          style={{
                            fontWeight: 400,
                          }}
                        >
                          No inventory items
                        </p>

                        <p className="mt-1 text-sm text-[#667085]">
                          Add an item to this
                          subtab to get started.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
            <div className="flex items-center justify-between border-b border-[#E4E7EC] px-6 py-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                  Inventory
                </p>

                <h2
                  className="mt-1 text-lg text-[#101828]"
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
                className="rounded-full p-2 text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCategorySubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#667085]">
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
                  className="h-11 w-full rounded-full border border-[#DBDFE6] bg-[#F9FAFB] px-5 text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>

              <div className="rounded-xl bg-[#F9FAFB] p-4">
                <p className="text-[12.5px] leading-5 text-[#667085]">
                  Create a subtab to organize your
                  inventory. You can add products under
                  each subtab.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="h-11 flex-1 rounded-full border border-[#DBDFE6] text-[13.5px] text-[#475467] transition hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 flex-1 rounded-full text-[13.5px] text-white transition hover:opacity-90"
                  style={{
                    fontWeight: 500,
                    backgroundColor: teal,
                  }}
                >
                  {editingCategory
                    ? "Save changes"
                    : "Create subtab"}
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
            <div className="flex items-center justify-between border-b border-[#E4E7EC] px-6 py-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                  Inventory
                </p>

                <h2
                  className="mt-1 text-lg text-[#101828]"
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
                className="rounded-full p-2 text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
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
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#667085]">
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
                  className="h-11 w-full appearance-none rounded-full border border-[#DBDFE6] bg-[#F9FAFB] px-5 text-[14px] text-[#101828] outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
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
                  className="h-11 flex-1 rounded-full border border-[#DBDFE6] text-[13.5px] text-[#475467] transition hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 flex-1 rounded-full text-[13.5px] text-white transition hover:opacity-90"
                  style={{
                    fontWeight: 500,
                    backgroundColor: teal,
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
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#667085]">
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
        className="h-11 w-full rounded-full border border-[#DBDFE6] bg-[#F9FAFB] px-5 text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/10"
      />
    </div>
  );
}
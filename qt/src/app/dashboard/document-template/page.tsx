"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
} from "lucide-react";

type DocumentTemplate = {
  id: string;
  name: string;
  description: string;
  type: "Quotation" | "Invoice";
};

export default function DocumentTemplatePage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(
    []
  );

  const [showModal, setShowModal] = useState(false);

  const [editingTemplate, setEditingTemplate] =
    useState<DocumentTemplate | null>(null);

  const [previewTemplate, setPreviewTemplate] =
    useState<DocumentTemplate | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "Quotation" as "Quotation" | "Invoice",
  });

  // Load templates
  useEffect(() => {
    const stored = localStorage.getItem(
      "document-templates"
    );

    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch {
        setTemplates([]);
      }
    } else {
      setTemplates([]);
    }
  }, []);

  // Save templates
  const saveTemplates = (
    newTemplates: DocumentTemplate[]
  ) => {
    setTemplates(newTemplates);

    localStorage.setItem(
      "document-templates",
      JSON.stringify(newTemplates)
    );
  };

  // Open add modal
  const openAddModal = () => {
    setEditingTemplate(null);

    setForm({
      name: "",
      description: "",
      type: "Quotation",
    });

    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (
    template: DocumentTemplate
  ) => {
    setEditingTemplate(template);

    setForm({
      name: template.name,
      description: template.description,
      type: template.type,
    });

    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  // Add / update template
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a template name.");
      return;
    }

    if (editingTemplate) {
      const updatedTemplates = templates.map(
        (template) =>
          template.id === editingTemplate.id
            ? {
                ...template,
                name: form.name.trim(),
                description:
                  form.description.trim(),
                type: form.type,
              }
            : template
      );

      saveTemplates(updatedTemplates);
    } else {
      const newTemplate: DocumentTemplate = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        description:
          form.description.trim(),
        type: form.type,
      };

      saveTemplates([
        ...templates,
        newTemplate,
      ]);
    }

    closeModal();
  };

  // Delete template
  const deleteTemplate = (
    id: string
  ) => {
    const template = templates.find(
      (template) => template.id === id
    );

    if (!template) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${template.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const updatedTemplates =
      templates.filter(
        (template) =>
          template.id !== id
      );

    saveTemplates(updatedTemplates);
  };

  return (
    <div className="font-sans font-light">
      {/* Page Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <FileText className="h-5 w-5 text-gray-700" />
            </div>

            <h1 className="text-2xl font-light tracking-tight">
              Document Templates
            </h1>
          </div>

          <p className="mt-2 text-sm font-light text-gray-500">
            Create and manage templates for your
            business documents.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-light text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {/* Templates */}
      <div className="rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-light">
            Your Templates
          </h2>

          <p className="mt-1 text-xs font-light text-gray-500">
            {templates.length} template
            {templates.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <FileText className="mx-auto h-9 w-9 text-gray-300" />

            <p className="mt-4 text-sm font-light text-gray-700">
              No document templates
            </p>

            <p className="mt-1 text-sm font-light text-gray-500">
              Create your first document template
              to get started.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-light text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
              >
                {/* Template Information */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>

                  <div>
                    <h3 className="font-light text-gray-900">
                      {template.name}
                    </h3>

                    <p className="mt-1 text-sm font-light text-gray-500">
                      {template.description ||
                        "No description"}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-light text-gray-600">
                      {template.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewTemplate(
                        template
                      )
                    }
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        template
                      )
                    }
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTemplate(
                        template.id
                      )
                    }
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-light text-gray-900">
                  {editingTemplate
                    ? "Edit Template"
                    : "Create Template"}
                </h2>

                <p className="mt-1 text-sm font-light text-gray-500">
                  Configure your document template.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-light text-gray-900">
                  Template Name
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
                  placeholder="e.g. Standard Quotation"
                  className="h-11 w-full rounded-lg border px-3 text-sm font-light outline-none placeholder:font-light focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-light text-gray-900">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe this template"
                  rows={4}
                  className="w-full resize-none rounded-lg border px-3 py-3 text-sm font-light outline-none placeholder:font-light focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="mb-2 block text-sm font-light text-gray-900">
                  Document Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as
                        | "Quotation"
                        | "Invoice",
                    })
                  }
                  className="h-11 w-full rounded-lg border bg-white px-3 text-sm font-light outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option value="Quotation">
                    Quotation
                  </option>

                  <option value="Invoice">
                    Invoice
                  </option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2.5 text-sm font-light text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-light text-white transition hover:bg-gray-800"
                >
                  {editingTemplate
                    ? "Save Changes"
                    : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-light uppercase tracking-wider text-gray-400">
                  {previewTemplate.type}
                </p>

                <h2 className="mt-1 text-lg font-light text-gray-900">
                  {previewTemplate.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewTemplate(null)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="p-6">
              <div className="min-h-[400px] rounded-lg border bg-white p-8">
                <div className="border-b pb-5">
                  <h1 className="text-xl font-light">
                    {previewTemplate.type}
                  </h1>

                  <p className="mt-2 text-sm font-light text-gray-500">
                    {previewTemplate.name}
                  </p>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-light uppercase text-gray-400">
                        Customer
                      </p>

                      <div className="mt-2 h-4 w-40 rounded bg-gray-100" />
                    </div>

                    <div>
                      <p className="text-xs font-light uppercase text-gray-400">
                        Date
                      </p>

                      <div className="mt-2 h-4 w-32 rounded bg-gray-100" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-light uppercase text-gray-400">
                      Items
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="h-10 rounded bg-gray-50" />
                      <div className="h-10 rounded bg-gray-50" />
                      <div className="h-10 rounded bg-gray-50" />
                    </div>
                  </div>

                  <div className="flex justify-end border-t pt-5">
                    <div className="w-40">
                      <div className="flex justify-between">
                        <span className="text-sm font-light text-gray-500">
                          Total
                        </span>

                        <span className="text-sm font-light">
                          ₱0.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
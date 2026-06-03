import React, { useState } from "react";

export default function EditCategoryModal({
  open,
  onClose,
  categories,
  onSave,
  onDelete,
}) {
  if (!open) return null;

  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // When category is chosen
  const handleSelect = (title) => {
    setSelected(title);

    const cat = categories.find((c) => c.title === title);
    setName(cat.title);
    setImagePreview(cat.img);
    setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selected) {
      alert("Select a category to edit.");
      return;
    }
    if (!name.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    const cat = categories.find((c) => c.title === selected);
    if (!cat?.id) {
      alert("Invalid category selected");
      return;
    }

    await onSave({
      id: cat.id,
      name: name.trim(),
      imageFile, // optional
    });

    onClose();
  };

  const handleDelete = async () => {
    if (!selected) return;

    const cat = categories.find((c) => c.title === selected);
    if (!cat?.id) return;

    if (window.confirm("Are you sure you want to delete this category?")) {
      await onDelete({ id: cat.id });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#E8F5EC]/70 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[380px] border border-[#CDE7D3]">
        <h2 className="text-lg font-semibold text-[#124734] mb-4">
          Edit Category
        </h2>

        {/* Select Category */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">
            Select Category
          </label>
          <select
            className="border rounded-md p-2 w-full"
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="">-- Choose Category --</option>
            {categories.map((c) => (
              <option key={c.id || c.title} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Edit Fields Only After Category Selected */}
        {selected && (
          <>
            {/* Image Preview */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">
                Category Image
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  className="w-20 h-20 object-contain rounded-md border mb-2"
                />
              )}

              <input type="file" onChange={handleImageUpload} />
            </div>

            {/* Category Name */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1">
                Category Name
              </label>
              <input
                className="border rounded-md p-2 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-5">
          <button
            onClick={handleDelete}
            disabled={!selected}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300"
          >
            Delete
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border text-gray-600"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!selected}
              className="px-4 py-2 rounded-md bg-[#124734] text-white hover:bg-[#0E3A2B] disabled:bg-gray-300"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function AddCategoryModal({ open, onClose, onSave }) {
  if (!open) return null;

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
  if (!name || !image) {
    alert("Please fill all fields!");
    return;
  }

  onSave({ name, imageFile: image });   // ✅ send file to parent
  onClose();
};

  return (
   <div className="fixed inset-0 bg-[#E8F5EC]/70 backdrop-blur-sm flex justify-center items-center z-[9999]">

      <div className="bg-white p-6 rounded-xl shadow-lg w-[350px] animate-fadeIn border border-[#CDE7D3]">
        
        <h2 className="text-lg font-semibold text-[#124734] mb-4">
          Add New Category
        </h2>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Upload Image
          </label>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="w-20 h-20 object-contain mb-2 rounded-md border"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Category Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="border rounded-md p-2 w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#124734] text-white px-4 py-2 rounded-md hover:bg-[#0E3A2B]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

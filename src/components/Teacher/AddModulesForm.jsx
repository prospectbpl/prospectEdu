import { useState } from "react";
import { Plus, Trash, Upload } from "lucide-react";
import { useParams } from "react-router-dom";
import { courseContentApi } from "../../services/courseContent";

export default function AddModulesForm({ onSave }) {
  const { courseId } = useParams();

  const [modules, setModules] = useState([
    { title: "", description: "", videos: [], pdfs: [] },
  ]);

  const [errors, setErrors] = useState({});

  // Add a new module
  const addModule = () => {
    setModules([
      ...modules,
      { title: "", description: "", videos: [], pdfs: [] },
    ]);
  };

  // Remove a module
  const removeModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  // Update module field
  const updateModule = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
    setErrors({});
  };

  // Validate Modules Before Saving
  const validateModules = () => {
    let newErrors = {};

    if (modules.length === 0) {
      newErrors.general = "At least one module is required.";
    }

    modules.forEach((mod, index) => {
      if (!mod.title.trim()) {
        newErrors[`title_${index}`] = "Module title is required";
      }
      if (!mod.description.trim()) {
        newErrors[`desc_${index}`] = "Module description is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ API CONNECTED SAVE
  const handleSave = async () => {
    if (!validateModules()) return;

    try {
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];

        await courseContentApi.createModule(courseId, {
          title: mod.title,
          description: mod.description,
          order: i + 1,
        });
      }

      if (onSave) onSave();
    } catch (err) {
      console.error("Create module error:", err);
      alert(err.response?.data?.message || "Failed to create modules");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-[#E6F4EC]">

      {modules.map((mod, index) => (
        <div key={index} className="border border-[#A7E1B2] rounded-xl p-5 mb-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#124734]">
              Module {index + 1}
            </h3>

            {modules.length > 1 && (
              <Trash
                size={20}
                className="text-red-500 cursor-pointer hover:text-red-700"
                onClick={() => removeModule(index)}
              />
            )}
          </div>

          {/* Module Title */}
          <input
            type="text"
            placeholder="Module Title"
            className={`w-full border px-4 py-2 rounded-md mb-2 ${
              errors[`title_${index}`] ? "border-red-500" : "border-[#A7E1B2]"
            }`}
            value={mod.title}
            onChange={(e) => updateModule(index, "title", e.target.value)}
          />
          {errors[`title_${index}`] && (
            <p className="text-red-500 text-sm mb-2">
              {errors[`title_${index}`]}
            </p>
          )}

          {/* Description */}
          <textarea
            placeholder="Module Description"
            className={`w-full border px-4 py-2 rounded-md mb-2 ${
              errors[`desc_${index}`] ? "border-red-500" : "border-[#A7E1B2]"
            }`}
            rows="3"
            value={mod.description}
            onChange={(e) => updateModule(index, "description", e.target.value)}
          ></textarea>
          {errors[`desc_${index}`] && (
            <p className="text-red-500 text-sm mb-2">
              {errors[`desc_${index}`]}
            </p>
          )}

          {/* Upload Buttons */}
          <div className="flex gap-4 mt-4">
            <label className="cursor-pointer bg-[#009846] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#007a39]">
              <Upload size={16} />
              Upload Video
              <input type="file" hidden multiple />
            </label>

            <label className="cursor-pointer bg-[#124734] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#0d3a28]">
              <Upload size={16} />
              Upload PDFs
              <input type="file" hidden multiple />
            </label>
          </div>
        </div>
      ))}

      {/* General Error */}
      {errors.general && (
        <p className="text-red-500 text-sm mb-3">{errors.general}</p>
      )}

      {/* Add Module Button */}
      <button
        onClick={addModule}
        className="flex items-center gap-2 bg-[#A7E1B2] text-[#124734] px-4 py-2 rounded-md hover:bg-[#8ccf9a] transition"
      >
        <Plus size={18} /> Add Another Module
      </button>

      {/* Save Course */}
      <button
        onClick={handleSave}
        className="mt-6 w-60 bg-[#009846] text-white py-3 rounded-md hover:bg-[#007a39]"
      >
        Save & Continue →
      </button>
    </div>
  );
}

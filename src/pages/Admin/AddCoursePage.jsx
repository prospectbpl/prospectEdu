import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";
import { useToast } from "../../context/ToastContext";
import { coursesApi } from "../../services/courses";
import { usersApi } from "../../services/users";
import Breadcrumb from "../../components/Breadcrumb";
import { uploadsApi } from "../../services/uploads";
import { categoriesApi } from "../../services/categories";
export default function AddCoursePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([""]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // All form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [short, setShort] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [info, setInfo] = useState("");
  const [professors, setProfessors] = useState([""]); // kept (existing)
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [date, setDate] = useState("");
  const [img, setImg] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  // Tags
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const sidebarWidth = isCollapsed ? 80 : 256;

  const canonicalUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    return origin && pathname ? `${origin}${pathname}` : "";
  }, []);

  const pageTitle = "Add New Course | ProspectEdu Admin";
  const pageDescription =
    "Create a new course with title, category, professors, pricing, tags, and image in ProspectEdu Admin.";

    useEffect(() => {
  (async () => {
    try {
      const [teachersRes, categoriesRes] = await Promise.all([
        usersApi.listTeachers(),
        categoriesApi.list(),
      ]);

      setTeacherOptions(teachersRes.data.teachers || []);
      setCategoryOptions(categoriesRes.data.categories || []);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to load dropdown data",
        "error"
      );
    }
  })();
}, []);

  const handlePickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImg(true);
      const res = await uploadsApi.uploadCourseImage(file);
      setImg(res.data.url); // saved in DB
      showToast("Image uploaded!", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Image upload failed", "error");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAddTag = () => setShowTagInput(true);

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const teacherIds = selectedTeacherIds.filter(Boolean);

      const professorNames = teacherIds
        .map((id) => teacherOptions.find((t) => t._id === id)?.fullName)
        .filter(Boolean);

      const payload = {
        title,
        category,
        short,
        description,
        duration,
        info,
        professors: professorNames, // optional display
        assignedTeachers: teacherIds, // linkage
        price: Number(price || 0),
        discount: Number(discount || 0),
        tax: Number(tax || 0),
        date,
        img,
        tags,
      };

      await coursesApi.create(payload);

      showToast("Course added successfully!", "success");
      navigate("/admin/courses");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to add course";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Hidden H1 for SEO (no layout change) */}
      <h1 className="sr-only">Add New Course</h1>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>
      

      {/* MAIN */}
      <main
        className="flex flex-col flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100vw - ${sidebarWidth}px)`,
        }}
        aria-label="Add course admin page"
      >

        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Add New Course" />
        </div>
          

        {/* CONTENT */}
        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">
           <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin-dashboard" },
          { label: "Add Courses" },
        ]}
      />
          <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-[#124734] mb-6">
              Add Course
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="font-medium text-gray-700">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Category */}
              {/* Category */}
<div>
  <label className="font-medium text-gray-700">Category</label>

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full mt-2 p-2 border rounded"
  >
    <option value="">Select Category</option>

    {categoryOptions.map((c) => (
      <option key={c._id} value={c.name}>
        {c.name}
      </option>
    ))}
  </select>
</div>

              {/* Short */}
              <div>
                <label className="font-medium text-gray-700">
                  Short Description
                </label>
                <input
                  type="text"
                  value={short}
                  onChange={(e) => setShort(e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Full Info */}
              <div>
                <label className="font-medium text-gray-700">
                  Course Information
                </label>
                <textarea
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  rows="4"
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-medium text-gray-700">
                  Course Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">
                  Course Duration
                </label>
                <textarea
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  rows="1"
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Professors */}
              <div>
                <label className="font-medium text-gray-700">Professors</label>

                {selectedTeacherIds.map((tid, i) => (
                  <select
                    key={i}
                    value={tid}
                    onChange={(e) => {
                      const updated = [...selectedTeacherIds];
                      updated[i] = e.target.value;
                      setSelectedTeacherIds(updated);
                    }}
                    className="w-full mt-2 p-2 border rounded"
                  >
                    <option value="">Select Teacher</option>
                    {teacherOptions.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTeacherIds([...selectedTeacherIds, ""])
                  }
                  className="mt-2 text-sm text-[#124734] underline"
                >
                  + Add another professor
                </button>
              </div>

              {/* Pricing */}
              <div>
                <label className="font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="font-medium text-gray-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Tax */}
              <div>
                <label className="font-medium text-gray-700">Tax (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Date */}
              <div>
                <label className="font-medium text-gray-700">Start Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="font-medium text-gray-700">Tags</label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#ECF5EE] text-[#124734] rounded-full text-xs cursor-pointer"
                      onClick={() => handleRemoveTag(i)}
                    >
                      {tag} ✕
                    </span>
                  ))}
                </div>

                {showTagInput ? (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    className="w-full mt-2 p-2 border rounded"
                    placeholder="Type tag & press Enter"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="mt-2 text-sm text-[#124734] underline"
                    onClick={handleAddTag}
                  >
                    + Add Tag
                  </button>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="font-medium text-gray-700">Course Image</label>

                <div className="mt-2 flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handlePickImage} />
                  {uploadingImg && (
                    <span className="text-sm text-gray-500">Uploading...</span>
                  )}
                </div>

                {/* Preview */}
                <div className="mt-3">
                  <img
                    src={img || "/placeholder-course.png"}
                    alt={title ? `${title} course image` : "Course image preview"}
                    className="w-full max-w-sm h-40 object-contain bg-[#F0F5F2] rounded"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* URL visible */}
                <input
                  type="text"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  className="w-full mt-3 p-2 border rounded"
                  placeholder="Image URL will appear here after upload"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-[#124734] text-white px-6 py-2 rounded-md hover:bg-[#0E3A2B]"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Add Course"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

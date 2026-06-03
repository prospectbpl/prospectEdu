import React, { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { coursesApi } from "../../../services/courses";
import { useLocation } from "react-router-dom";


export default function CourseDetail({ courseId }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [openDelete, setOpenDelete] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await coursesApi.adminGet(courseId);
      setCourse(res.data.course);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  if (courseId) fetchCourse();
}, [courseId, location.key]); // ✅ add location.key


  const cost = useMemo(() => {
    const price = Number(course?.price || 0);
    const tax = Number(course?.tax || 0);
    const discount = Number(course?.discount || 0);

    const discountAmt = (price * discount) / 100;
    const taxAmt = (price * tax) / 100;
    const total = price + taxAmt - discountAmt;

    return { price, tax, discount, discountAmt, taxAmt, total };
  }, [course]);

  const handleDelete = async () => {
    try {
      await coursesApi.adminDelete(courseId);
      showToast("Course deleted successfully!", "success");
      navigate("/admin/courses");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to delete course", "error");
    } finally {
      setOpenDelete(false);
    }
  };

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!course) return <p className="text-red-500">Course not found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE — IMAGE + BASIC INFO */}
      <div className="col-span-1">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <img
            src={course.img || "/placeholder-course.png"}
            alt={course.title}
            className="w-full h-40 object-contain bg-[#F0F5F2] rounded-t-xl"
          />

          <div className="p-4">
            <h1 className="text-xl font-semibold text-[#124734]">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.short}</p>

            {/* Admin Actions */}
            <div className="flex gap-4 mt-6">
  
      <button
        onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
        className="bg-[#124734] text-white px-4 py-2 rounded-md hover:bg-[#0E3A2B]"
      >
        Edit Course
      </button>

      <button
        onClick={() => setOpenDelete(true)}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Delete Course
      </button>
   
</div>

          </div>
        </div>

        {/* About Course Box */}
        <div className="bg-white rounded-xl shadow p-5 mt-6">
          <h2 className="font-semibold text-[#124734] mb-3">About Course</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <p className="text-gray-500">Professor(s)</p>
            <div className="font-medium flex flex-col">
  {course.assignedTeachers?.length
    ? course.assignedTeachers.map((t, i) => (
        <span key={t._id || i} className="leading-tight">
          • {t.fullName}
        </span>
      ))
    : "N/A"}
</div>


            <p className="text-gray-500">Price</p>
            <p className="font-medium">₹{cost.price.toLocaleString()}</p>

            <p className="text-gray-500">Date</p>
            <p className="font-medium">{course.date || "—"}</p>
          </div>

          {/* COST BREAKDOWN */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-[#124734] mb-2">Cost Breakdown</h3>

            <table className="w-full text-sm">
              <tbody className="text-gray-700">
                <tr>
                  <td className="py-2">Base Price</td>
                  <td className="py-2 font-medium text-right">
                    ₹{cost.price.toLocaleString()}
                  </td>
                </tr>

                {cost.discount > 0 && (
                  <tr>
                    <td className="py-2">Discount ({cost.discount}%)</td>
                    <td className="py-2 font-medium text-red-600 text-right">
                      -₹{cost.discountAmt.toFixed(2)}
                    </td>
                  </tr>
                )}

                {cost.tax > 0 && (
                  <tr>
                    <td className="py-2">Tax ({cost.tax}%)</td>
                    <td className="py-2 font-medium text-yellow-600 text-right">
                      +₹{cost.taxAmt.toFixed(2)}
                    </td>
                  </tr>
                )}

                <tr>
                  <td colSpan="2" className="border-t pt-2"></td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold">Total Cost</td>
                  <td className="py-3 font-semibold text-[#124734] text-right">
                    ₹{cost.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — FULL COURSE INFORMATION */}
      <div className="col-span-2">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-[#124734] mb-4">Course Description</h2>
          <p className="text-gray-600 mb-4">{course.description}</p>

          <h2 className="text-lg font-semibold text-[#124734] mb-4">Course Information</h2>
          <p className="text-gray-600 leading-relaxed mb-4">{course.info || course.description}</p>

          <div className="mt-6">
            <h3 className="font-semibold text-[#124734] mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {course.tags?.length
                ? course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#ECF5EE] text-[#124734] rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))
                : "No tags available"}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
  open={openDelete}
  title="Delete Course?"
  message="Are you sure you want to delete this course? This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setOpenDelete(false)}
/>

    </div>
  );
}

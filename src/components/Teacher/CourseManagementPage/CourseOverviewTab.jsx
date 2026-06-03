import React, { useMemo } from "react";

export default function CourseOverviewTab({ course }) {
  const cost = useMemo(() => {
    const price = Number(course?.price || 0);
    const tax = Number(course?.tax || 0);
    const discount = Number(course?.discount || 0);

    const discountAmt = (price * discount) / 100;
    const taxAmt = (price * tax) / 100;
    const total = price + taxAmt - discountAmt;

    return { price, tax, discount, discountAmt, taxAmt, total };
  }, [course]);

  if (!course) {
    return (
      <div className="bg-white p-6 rounded-xl border border-[#E6F4EC] shadow-sm">
        <p className="text-[#124734]">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE */}
      <div className="col-span-1">
        <div className="bg-white rounded-xl shadow overflow-hidden border border-[#E6F4EC]">
          <img
            src={course.img || "/placeholder-course.png"}
            alt={course.title}
            className="w-full h-40 object-contain bg-[#F0F5F2]"
          />

          <div className="p-4">
            <h1 className="text-xl font-semibold text-[#124734]">
              {course.title}
            </h1>

            <p className="text-gray-600 mt-2">{course.short || "—"}</p>

            {/* Teacher-only info */}
            
          </div>
        </div>

        {/* ABOUT COURSE */}
        <div className="bg-white rounded-xl shadow p-5 mt-6 border border-[#E6F4EC]">
          <h2 className="font-semibold text-[#124734] mb-3">About Course</h2>

          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <p className="text-gray-500">Professor(s)</p>
            <div className="font-medium flex flex-col">
              {course.assignedTeachers?.length ? (
                course.assignedTeachers.map((t, i) => (
                  <span key={t._id || i}>• {t.fullName}</span>
                ))
              ) : (
                <span>N/A</span>
              )}
            </div>

            <p className="text-gray-500">Category</p>
            <p className="font-medium">{course.category || "—"}</p>

            <p className="text-gray-500">Start Date</p>
            <p className="font-medium">{course.date || "—"}</p>
          </div>

          {/* COST BREAKDOWN */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-[#124734] mb-2">Cost Breakdown</h3>

            <table className="w-full text-sm">
              <tbody className="text-gray-700">
                <tr>
                  <td className="py-2">Base Price</td>
                  <td className="py-2 text-right font-medium">₹{cost.price}</td>
                </tr>

                {cost.discount > 0 && (
                  <tr>
                    <td className="py-2">Discount</td>
                    <td className="py-2 text-right text-red-600">
                      -₹{cost.discountAmt.toFixed(2)}
                    </td>
                  </tr>
                )}

                {cost.tax > 0 && (
                  <tr>
                    <td className="py-2">Tax</td>
                    <td className="py-2 text-right text-yellow-600">
                      +₹{cost.taxAmt.toFixed(2)}
                    </td>
                  </tr>
                )}

                <tr className="border-t">
                  <td className="py-3 font-semibold">Total</td>
                  <td className="py-3 font-semibold text-right text-[#124734]">
                    ₹{cost.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="col-span-2">
        <div className="bg-white rounded-xl shadow p-6 border border-[#E6F4EC]">
          <h2 className="text-lg font-semibold text-[#124734] mb-4">
            Course Description
          </h2>
          <p className="text-gray-600 mb-4">{course.description || "—"}</p>

          <h2 className="text-lg font-semibold text-[#124734] mb-4">
            Course Information
          </h2>
          <p className="text-gray-600">{course.info || course.description || "—"}</p>

          <div className="mt-6">
            <h3 className="font-semibold text-[#124734] mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {course.tags?.length ? (
                course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#ECF5EE] text-[#124734] rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No tags available</span>
              )}
            </div>
          </div>

          {/* Gallery */}
          {course.gallery?.length ? (
            <div className="mt-8">
              <h3 className="font-semibold text-[#124734] mb-3">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {course.gallery.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="h-28 w-full object-contain bg-[#F0F5F2] rounded-lg border"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

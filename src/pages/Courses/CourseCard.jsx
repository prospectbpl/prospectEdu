import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { state: { from: `/checkout/${course._id}` } });
      return;
    }

    navigate(`/checkout/${course._id}`);
  };

  return (
    <article
      className="flex flex-col justify-between overflow-hidden  bg-[#ECF5EE]
 border border-[#A7E1B2] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 h-[340px] w-full"
      aria-label={`Course: ${course.title}`}
    >
      <div className="flex justify-center items-center h-[140px] mb-2">
        <img
          src={course.image}
          alt={`${course.title} course`}
          loading="lazy"
          decoding="async"
          width="200"
          height="140"
          className="h-full w-auto object-contain"
        />
      </div>

      <div className=" text-center">
        <h3 className="font-heading text-base font-semibold text-[#124734] mb-1 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-[#5B7065] line-clamp-1">
          {course.mode} | {course.startDate}
        </p>
      </div>

      <div className="mt-1 flex flex-col items-center">
        <p className="text-sm font-semibold text-[#124734]">₹{course.price}</p>

        <div className=" mt-2 flex gap-3">
          {course.isPurchased ? (
            <button
              onClick={() => navigate(`/student/courses/${course._id}/modules`)}
              className="w-28 px-4 py-1.5 text-xs rounded-full border border-[#009846] text-[#009846] hover:bg-[#009846] hover:text-white transition text-center"
              type="button"
            >
              View
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="w-28 px-4 py-1.5 text-xs rounded-full border border-[#009846] text-[#009846] hover:bg-[#009846] hover:text-white transition text-center"
                aria-label={`Explore ${course.title}`}
                type="button"
              >
                Explore
              </button>

              <button
                onClick={handleBuyNow}
                className="w-28 px-4 py-1.5 text-xs rounded-full border border-[#009846] text-[#009846] hover:bg-[#009846] hover:text-white transition text-center"
                aria-label={`Enroll now for ${course.title}`}
                type="button"
              >
                Enroll Now
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

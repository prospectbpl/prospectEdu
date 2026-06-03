import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

import itCourse1 from "../assets/video.webp";
import itCourse2 from "../assets/video.webp";
import lawCourse from "../assets/video.webp";
import electricalCourse1 from "../assets/video.webp";
import electricalCourse2 from "../assets/video.webp";

export default function PopularCourses() {
  const courses = [
    {
      title: "PG Programme in Quantity Surveying & Contract Management",
      category: "Information Technology",
      img: itCourse1,
      mode: "Online | Working Professionals",
      slug: "quantity-surveying",
    },
    {
      title: "PG Programme in Project Management for Working Professionals",
      category: "Information Technology",
      img: itCourse2,
      mode: "Online | Professional Level",
      slug: "project-management",
    },
    {
      title: "PG Programme in Construction Management for Working Professionals",
      category: "Information Technology",
      img: itCourse1,
      mode: "Hybrid | Weekend Classes",
      slug: "construction-management",
    },
    {
      title: "Law Internship Programme",
      category: "Law",
      img: lawCourse,
      mode: "Offline / Online | 6 Weeks",
      slug: "law-internship",
    },
    {
      title: "Electrical System Design & Drafting",
      category: "Electrical",
      img: electricalCourse1,
      mode: "Online | Beginner to Advanced",
      slug: "electrical-design",
    },
    {
      title: "Power Distribution & Control Systems",
      category: "Electrical",
      img: electricalCourse2,
      mode: "Offline | Industrial Training",
      slug: "power-distribution",
    },
  ];

  return (
    <section className="w-full bg-[#F9FAFB] py-16" aria-labelledby="popular-heading">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 id="popular-heading" className="text-3xl font-heading font-semibold text-[#124734] mb-8">
          Popular Courses
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next"
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {courses.map((course, index) => (
            <SwiperSlide key={index}>
              <article className="bg-white border border-[#A7E1B2] rounded-xl shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-[1.03] h-[370px] flex flex-col">

                {/* Image */}
                <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded-t-xl bg-[#F0F5F2]">
                  <img
                    src={course.img}
                    alt={course.title}
                    loading="lazy"
                    width="300"
                    height="160"
                    className="w-auto h-full object-contain"
                  />
                </div>

                {/* Text */}
                <div className="p-4 flex flex-col flex-grow text-left">
                  <Link to={`/courses/${course.slug}`}>
                    <h3 className="font-heading text-base font-semibold text-[#124734] mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-[#5B7065] font-body">
                    {course.category} • {course.mode}
                  </p>
                </div>

              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        <Link
          to="/courses"
          className="inline-block mt-8 px-8 py-3 rounded-full border border-[#009846] text-[#009846] text-lg font-medium hover:bg-[#009846] hover:text-white transition-all duration-300"
        >
          Explore Courses
        </Link>
      </div>

      {/* Swiper Styling Fixes */}
      <style>{`
        .swiper-button-prev,
        .swiper-button-next {
          color: #009846 !important;
          background: #A7E1B2;
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: #009846;
          color: white !important;
        }
        .swiper-pagination-bullet {
          background: #A7E1B2;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #009846;
        }
      `}</style>
    </section>
  );
}

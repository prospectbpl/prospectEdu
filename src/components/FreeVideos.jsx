import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

import itVideo from "../assets/video.webp";
import lawVideo from "../assets/video.webp";
import electricalVideo from "../assets/video.webp";
import aiVideo from "../assets/video.webp";
import renewableVideo from "../assets/video.webp";

export default function FreeVideos() {
  const videos = [
    {
      title: "Introduction to Java Programming",
      subtitle: "Learn Java fundamentals for backend development.",
      img: itVideo,
      category: "Information Technology",
      slug: "java-programming-intro",
    },
    {
      title: "Basics of Contract Law",
      subtitle: "Understand legal contracts, clauses, and structure.",
      img: lawVideo,
      category: "Law",
      slug: "contract-law-basics",
    },
    {
      title: "Fundamentals of Electrical Circuits",
      subtitle: "Learn the basics of voltage, current, and resistance.",
      img: electricalVideo,
      category: "Electrical",
      slug: "electrical-circuits",
    },
    {
      title: "AI & Machine Learning Simplified",
      subtitle: "Get started with AI using real-world examples.",
      img: aiVideo,
      category: "Information Technology",
      slug: "ai-ml-simplified",
    },
    {
      title: "Renewable Energy Systems Overview",
      subtitle: "Explore solar, wind, and hydro systems.",
      img: renewableVideo,
      category: "Electrical",
      slug: "renewable-energy-overview",
    },
  ];

  return (
    <section
      className="w-full bg-[#F9FAFB] py-16"
      aria-labelledby="free-videos-heading"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <h2
          id="free-videos-heading"
          className="text-3xl font-heading font-semibold text-[#124734] mb-8"
        >
          Free Videos
        </h2>

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {videos.map((video, index) => (
            <SwiperSlide key={index}>
              <article className="bg-white border border-[#A7E1B2] rounded-xl shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-[1.03] overflow-hidden">

                <Link to={`/videos/${video.slug}`} aria-label={`Watch ${video.title}`}>
                  <div className="relative">
                    <img
                      src={video.img}
                      alt={`${video.title} free educational video`}
                      loading="lazy"
                      width="320"
                      height="192"
                      className="w-full h-48 object-cover"
                    />

                    {/* Play Overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition"
                      aria-label={`Play ${video.title}`}
                    >
                      <span className="w-12 h-12 bg-white text-[#009846] rounded-full flex items-center justify-center text-xl font-bold">
                        ▶
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Text */}
                <div className="p-4">
                  <h3 className="font-heading text-base font-semibold text-[#124734] mb-1 line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-[#5B7065] font-body line-clamp-2">
                    {video.subtitle}
                  </p>
                  <p className="text-xs text-[#009846] font-semibold mt-2">
                    {video.category}
                  </p>
                </div>

              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

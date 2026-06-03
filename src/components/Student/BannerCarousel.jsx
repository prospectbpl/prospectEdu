import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function BannerCarousel() {
  const banners = [
    {
      img: "/src/assets/banner.webp",
      alt: "RRB JE 2025-26 Batch",
    },
    {
      img: "/src/assets/banner.webp",
      alt: "UPSC Civil Services Online Course",
    },
    {
      img: "/src/assets/banner.webp",
      alt: "SSC JE Mechanical 2025 Batch",
    },
    {
      img: "/src/assets/banner.webp",
      alt: "GATE Preparation 2025",
    },
    {
      img: "/src/assets/banner.webp",
      alt: "Bilingual Courses for College Students",
    },
  ];

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 relative z-10">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="rounded-lg"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <img
              src={banner.img}
              alt={banner.alt}
              className="w-full h-48 md:h-60 lg:h-64 object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination Styling */}
      <style>{`
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

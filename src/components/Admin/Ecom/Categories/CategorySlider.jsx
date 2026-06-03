import React, { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import itImg from "../../../../assets/it.webp";

const categories = [
  { title: "Information Technology", img: itImg },
  { title: "Management", img: itImg },
  { title: "Engineering", img: itImg },
  { title: "Law", img: itImg },
  { title: "Architecture", img: itImg },
  { title: "Finance & Accounting", img: itImg },
  { title: "Medical & Health", img: itImg },
  { title: "Soft Skills", img: itImg },
];

export default function CategorySlider({categories}) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="relative mb-6 w-full">

      {/* LEFT ARROW */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-20 hover:bg-gray-100"
      >
        <FiChevronLeft size={20} />
      </button>

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        className="overflow-x-auto px-24 py-2 scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="grid grid-rows-2 grid-flow-col gap-4">
          {categories.map((c) => (
            <div
              key={c.title}
              className="
                w-[200px] 
                bg-[#ECF5EE] 
                shadow-sm 
                rounded-xl 
                border border-[#CDE7D3] 
                p-4 
                flex flex-col 
                items-center 
                hover:shadow-md 
                cursor-pointer 
                transition
              "
            >
              <div className="w-16 h-16 flex items-center justify-center mb-3">
                <img src={c.img} className="w-14 h-14 object-contain" />
              </div>

              <p className="font-medium text-[#124734] text-center text-sm">
                {c.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT ARROW */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-20 hover:bg-gray-100"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeaderSection({ page, title, subtitle, image }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1E5631] text-white w-full py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start px-6 md:px-8 gap-10">

        {/* LEFT COLUMN — SHIFTED DOWN */}
        <div className="w-full md:w-1/2 flex flex-col text-left mt-4 md:mt-8">

          <p className="text-sm text-gray-200 mb-2">
            <span
              onClick={() => navigate("/")}
              className="cursor-pointer hover:underline"
            >
              Home
            </span>{" "}
            &gt; {page}
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold mb-2 leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-[#B7F399] text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src={image}
            alt="Header"
            className="w-[220px] sm:w-[260px] md:w-[330px] rounded-lg shadow-md"
          />
        </div>

      </div>
    </div>
  );
}

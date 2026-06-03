import React from "react";

/**
 * WhyTestSeries
 * Props:
 *  - image (string) : src for right side image (optional)
 */
const WhyTestSeries = ({ image }) => {
  return (
    <section aria-label="why-test-series" className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={image}
          alt="Why Take Test Series"
          className="max-w-sm md:max-w-md rounded-xl"
        />
      </div>

      {/* Right Content */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-[#1E5631] mb-4">
          Why Take Test Series?
        </h2>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#EAF4EC] rounded-2xl p-5 shadow-md">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-semibold mb-1">Latest Exam Pattern</h3>
            <p className="text-gray-600 text-sm">
              High-quality online tests designed as per updated exam patterns.
            </p>
          </div>

          <div className="bg-[#FFFEE0] rounded-2xl p-5 shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold mb-1">
              In-Depth Performance Analysis
            </h3>
            <p className="text-gray-600 text-sm">
              Get detailed insights on your strengths and weak areas.
            </p>
          </div>

          <div className="bg-[#E4F7E6] rounded-2xl p-5 shadow-md sm:col-span-2">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="text-lg font-semibold mb-1">Save Test & Questions</h3>
            <p className="text-gray-600 text-sm">
              Save and revisit your tests anytime for better revision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTestSeries;

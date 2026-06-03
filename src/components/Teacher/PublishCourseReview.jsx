import { CheckCircle } from "lucide-react";
import { useState } from "react";

export default function PublishCourseReview({
  courseData = {},
  modules = [],
  defaultSettings = {},
  onPublish,
  onBack,
}) {

  const [settings, setSettings] = useState({
    live: defaultSettings.live ?? true,
    doubts: defaultSettings.doubts ?? true,
    downloads: defaultSettings.downloads ?? false,
    comments: defaultSettings.comments ?? true,
    progressBar: defaultSettings.progressBar ?? true,
  });

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-8">

      {/* COURSE SUMMARY */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#E6F4EC]">
        <h3 className="text-xl font-semibold text-[#124734] mb-3">
          Course Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <p className="text-sm text-[#5B7065]">Course Title</p>
            <p className="text-lg text-[#124734] font-medium">
              {courseData.title || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#5B7065]">Category</p>
            <p className="text-lg text-[#124734] font-medium">
              {courseData.category || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#5B7065]">Level</p>
            <p className="text-lg text-[#124734] font-medium">
              {courseData.level || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#5B7065]">Duration</p>
            <p className="text-lg text-[#124734] font-medium">
              {courseData.duration || "N/A"} Hours
            </p>
          </div>
        </div>
      </div>

      {/* MODULES SUMMARY */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#E6F4EC]">
        <h3 className="text-xl font-semibold text-[#124734] mb-3">
          Modules Added
        </h3>

        {modules.length === 0 ? (
          <p className="text-[#5B7065]">No modules added.</p>
        ) : (
          <ul className="space-y-2">
            {modules.map((mod, index) => (
              <li
                key={index}
                className="border border-[#A7E1B2] p-3 rounded-md bg-[#F9FAFB]"
              >
                Module {index + 1} — {mod.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PUBLISH SETTINGS */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#E6F4EC]">
        <h3 className="text-xl font-semibold text-[#124734] mb-4">
          Publish Settings
        </h3>

        <div className="space-y-4">
          {Object.keys(settings).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between"
            >
              <span className="text-[#124734] font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={() => toggleSetting(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#009846] transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-[#124734] px-5 py-2 rounded-md hover:bg-gray-300"
        >
          ← Back
        </button>

        <button
          onClick={() => onPublish(settings)}
          className="flex items-center gap-2 bg-[#009846] text-white px-6 py-2 rounded-md hover:bg-[#007a39] text-lg font-medium"
        >
          <CheckCircle size={22} /> Publish Course
        </button>
      </div>
    </div>
  );
}

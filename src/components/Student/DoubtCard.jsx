import React from "react";

export default function DoubtCard({
  title,
  doubtType,
  query,
  date,
  onViewAttachment,
  onViewResponse
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-6 py-6 w-full max-w-xl border border-[#E6F4EC]">
      
      {/* Title */}
      <h2 className="text-lg font-semibold text-[#124734] mb-4">
        {title}
      </h2>

      {/* Info */}
      <div className="text-sm text-[#5B7065] space-y-2 mb-6">

        <p>
          <span className="font-semibold text-[#124734]">Doubt Type:</span>{" "}
          {doubtType}
        </p>

        <p>
          <span className="font-semibold text-[#124734]">Query:</span>{" "}
          <span className="inline-block max-w-xs text-ellipsis overflow-hidden whitespace-nowrap">
            {query}
          </span>
        </p>

        <p>
          <span className="font-semibold text-[#124734]">Asked on:</span>{" "}
          {date}
        </p>

      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onViewAttachment}
          className="bg-[#F2FBF6] px-4 py-2 rounded-xl text-sm font-medium text-[#124734] hover:bg-[#E6F4EC] transition border border-[#D4EDE0]"
        >
          My Attachment
        </button>

        <button
          onClick={onViewResponse}
          className="bg-[#F2FBF6] px-4 py-2 rounded-xl text-sm font-medium text-[#124734] hover:bg-[#E6F4EC] transition border border-[#D4EDE0]"
        >
          View Response
        </button>
      </div>

    </div>
  );
}

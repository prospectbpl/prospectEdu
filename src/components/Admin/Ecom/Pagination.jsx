import React from "react";

export default function Pagination({ page, setPage, totalPages }) {
  const safeTotal = Math.max(Number(totalPages || 1), 1);

  const go = (p) => {
    const next = Math.min(Math.max(1, p), safeTotal);
    setPage(next);
  };

  // Build pages like: 1 2 3 ... last (smart)
  const buildPages = () => {
    if (safeTotal <= 7) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }

    // Show: 1, (page-1,page,page+1), ..., last
    const pages = new Set([1, safeTotal, page - 1, page, page + 1]);

    const arr = [...pages]
      .filter((p) => p >= 1 && p <= safeTotal)
      .sort((a, b) => a - b);

    // Insert "..." gaps
    const final = [];
    for (let i = 0; i < arr.length; i++) {
      if (i > 0 && arr[i] - arr[i - 1] > 1) final.push("...");
      final.push(arr[i]);
    }
    return final;
  };

  const pages = buildPages();

  return (
    <div className="flex items-center gap-3 mt-6">
      <button
        disabled={page === 1}
        onClick={() => go(page - 1)}
        className={`px-4 py-2 border rounded-lg text-sm flex items-center gap-2
          ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}
        `}
      >
        ← Previous
      </button>

      <div className="flex gap-2">
        {pages.map((p, i) => (
          <button
            key={`${p}-${i}`}
            disabled={p === "..."}
            onClick={() => typeof p === "number" && go(p)}
            className={`px-3 py-2 rounded-lg border text-sm
              ${
                page === p
                  ? "bg-[#C8EFC9] text-[#124734] font-semibold"
                  : "hover:bg-gray-100"
              }
              ${p === "..." ? "cursor-not-allowed opacity-60" : ""}
            `}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        disabled={page === safeTotal}
        onClick={() => go(page + 1)}
        className={`px-4 py-2 border rounded-lg text-sm flex items-center gap-2
          ${
            page === safeTotal
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
          }
        `}
      >
        Next →
      </button>
    </div>
  );
}

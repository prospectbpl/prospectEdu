export default function Toast({ message, type = "success", onClose }) {
  const colors = {
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[5000] animate-slideIn">
      <div className="bg-white inline-flex space-x-3 p-3 text-sm rounded-lg shadow-lg border border-gray-200">

        {/* ICON */}
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
          <path
            d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25"
            stroke={colors[type]}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* TEXT */}
        <div>
          <h3 className="font-medium text-slate-800">{message}</h3>

          {type === "success" && (
            <p className="text-slate-500 text-xs">
              Action completed successfully.
            </p>
          )}
        </div>

        {/* CLOSE */}
        <button
          type="button"
          aria-label="close"
          onClick={onClose}
          className="cursor-pointer mb-auto text-slate-400 hover:text-slate-600 active:scale-95 transition"
        >
          <svg width="14" height="14" fill="none">
            <rect
              y="12.532"
              width="17.498"
              height="2.1"
              rx="1.05"
              transform="rotate(-45.74 0 12.532)"
              fill="currentColor"
              fillOpacity=".7"
            />
            <rect
              x="12.531"
              y="13.914"
              width="17.498"
              height="2.1"
              rx="1.05"
              transform="rotate(-135.74 12.531 13.914)"
              fill="currentColor"
              fillOpacity=".7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

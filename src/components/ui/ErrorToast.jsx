export default function ErrorToast({ message, onClose }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-fadeIn">
      <div className="flex items-center justify-between text-red-600 max-w-80 w-full bg-red-600/10 h-12 shadow rounded-md px-3 border border-red-200">

        {/* Left red bar */}
        <div className="h-full w-1.5 bg-red-600 rounded-l-md"></div>

        {/* Icon + message */}
        <div className="flex items-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="icon line"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.95 16.5h.1"
              stroke="currentColor"
              strokeWidth="1.95"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M3 12a9 9 0 0 1 9-9h0a9 9 0 0 1 9 9h0a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9m9 0V7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          <p className="text-sm ml-2 font-medium">{message}</p>
        </div>

        {/* Close button */}
        <button
          type="button"
          aria-label="close"
          onClick={onClose}
          className="active:scale-90 transition-all ml-3 text-red-500 hover:text-red-700"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

      </div>
    </div>
  );
}

import { Pin, PinOff, CheckCircle2 } from "lucide-react";

export default function QueryItem({
  data,
  selected,
  onClick,
  onPin,
  onResolve,
}) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition ${
        selected
          ? "bg-[#E6F4EA] border-[#A7E1B2]"
          : "bg-white border-gray-200 hover:bg-[#F2FBF5]"
      }`}
    >
      {/* TOP ROW: Student + Pin */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#124734]">{data.student}</h3>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className="cursor-pointer text-[#124734]"
        >
          {data.pinned ? <Pin size={16} /> : <PinOff size={16} />}
        </div>
      </div>

      {/* QUESTION */}
      <p className="text-sm text-[#5B7065] mt-1 line-clamp-2">{data.question}</p>

      {/* TIME + UNREAD + RESOLVED */}
      <div className="flex justify-between mt-2 items-center">
        <p className="text-xs text-[#98A6A2]">{data.time}</p>

        <div className="flex items-center gap-2">

          {/* UNREAD BADGE */}
          {data.unread > 0 && (
            <span className="text-xs px-2 py-1 bg-[#DFF6E6] text-[#124734] rounded-full">
              {data.unread}
            </span>
          )}

          {/* RESOLVED TOGGLE */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
            className="cursor-pointer"
          >
            {data.resolved ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <CheckCircle2 size={16} className="text-gray-300" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

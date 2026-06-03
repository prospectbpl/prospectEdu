import { Paperclip } from "lucide-react";

export default function MessageBubble({ m }) {
  const isTeacher = m.from === "teacher";

  const isImage =
    m?.attachment?.resourceType === "image" ||
    (m?.attachment?.mimetype || "").startsWith("image/");

  return (
    <div
      className={`p-3 rounded-xl max-w-md shadow-sm ${
        isTeacher
          ? "ml-auto bg-[#A7E1B2]/50 text-[#124734]"
          : "bg-[#A7E1B2] border border-[#E6F4EC] text-[#124734]"
      }`}
    >
      {/* Text */}
      {m.text ? <p className="whitespace-pre-wrap text-sm">{m.text}</p> : null}

      {/* Attachment */}
      {m.attachment?.url ? (
        <div className="mt-2">
          {isImage ? (
            <a href={m.attachment.url} target="_blank" rel="noreferrer">
              <img
                src={m.attachment.url}
                alt={m.attachment.name || "attachment"}
                className="w-48 rounded-lg border hover:opacity-95 transition"
              />
            </a>
          ) : (
            <a
              href={m.attachment.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-[#F2FBF5] transition"
            >
              <Paperclip size={16} />
              <span className="text-xs truncate max-w-[200px]">
                {m.attachment.name || "attachment"}
              </span>
              <span className="text-[10px] text-[#009846] ml-auto">Open</span>
            </a>
          )}
        </div>
      ) : null}

      {/* Time */}
      <div className="mt-1 text-[10px] text-[#5B7065] text-right">
        {m.time}
      </div>
    </div>
  );
}

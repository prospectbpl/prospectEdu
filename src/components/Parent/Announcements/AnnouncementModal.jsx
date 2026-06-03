import { X, FileText } from "lucide-react";

export default function AnnouncementModal({ announcement, onClose }) {
  if (!announcement) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[450px] shadow-xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#124734]">
          {announcement.title}
        </h2>

        <p className="text-sm text-[#5B7065] mt-1">{announcement.category}</p>

        {/* Description */}
        <p className="mt-4 text-[#124734] leading-relaxed">
          {announcement.description}
        </p>

        {/* Attachments */}
        {announcement.attachments.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-[#124734]">Attachments:</h3>

            {announcement.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 mt-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <FileText size={18} className="text-[#124734]" />
                <span className="text-sm text-[#124734]">{file}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 text-sm text-[#5B7065]">
          Posted by: <b>{announcement.postedBy}</b>
        </div>
      </div>
    </div>
  );
}

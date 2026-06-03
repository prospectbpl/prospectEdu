import { Paperclip, ImageIcon } from "lucide-react";

export default function UploadBar({ onPickFile, onPickImage }) {
  return (
    <div className="px-4 py-2 border-t bg-white">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-[#124734]">
          <Paperclip size={18} />
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile?.(f);
              e.target.value = "";
            }}
          />
          File
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-[#124734]">
          <ImageIcon size={18} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickImage?.(f);
              e.target.value = "";
            }}
          />
          Screenshot
        </label>
      </div>
    </div>
  );
}

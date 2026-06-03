import { User2 } from "lucide-react";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";

export default function ChildRow({ child, onRemove }) {
  const { openConfirm } = useConfirm();
  const { showToast } = useToast();

  const handleRemoveClick = () => {
    const label = child.fullName || child.name || "this child";
    openConfirm(
      "Remove Child?",
      `Are you sure you want to remove ${label}?`,
      async () => {
        try {
          await onRemove();
          showToast("Child removed successfully", "success");
        } catch (e) {
          showToast(e?.response?.data?.message || "Failed to remove child", "error");
        }
      }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-[#F0F6F2] rounded-lg gap-4 sm:gap-0">
      <div className="flex items-center gap-3 w-full">
        <div className="h-12 w-12 rounded-full bg-[#E6F4EC] flex items-center justify-center text-[#124734] shrink-0">
          <User2 />
        </div>

        <div className="w-full">
          <p className="font-semibold text-[#124734]">{child.fullName || child.name || "—"}</p>

          <div className="text-sm text-[#5B7065] mt-1 break-words space-y-1">
            <p>
              Email:{" "}
              <span className="font-medium text-[#124734]">
                {child.email || child.emailAddress || "—"}
              </span>
            </p>
            <p>
              Phone:{" "}
              <span className="font-medium text-[#124734]">{child.phone || "—"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex sm:justify-end w-full sm:w-auto">
        <button
          onClick={handleRemoveClick}
          className="px-3 py-1 bg-white border border-red-100 text-red-600 rounded-md hover:bg-red-50 w-full sm:w-auto"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

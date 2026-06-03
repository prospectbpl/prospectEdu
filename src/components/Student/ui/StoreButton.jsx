import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { activityApi } from "../../../services/activity";
export default function StoreButton() {
  const navigate = useNavigate();

  const handleClick = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    try {
      await activityApi.log({
        type: "/student/store",
        title: "Store",
        route: "/ecommerce-home",
      });

      // notify RecentActivity immediately
      window.dispatchEvent(new Event("activity_refresh"));
    } catch (e) {
      console.error("Store activity log failed", e);
    }

    navigate("/ecommerce-home");
  };
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#A7E1B2]/30 px-4 py-2 rounded-md hover:bg-[#009846]/20 transition"
    >
      <ShoppingCart size={18} className="text-[#124734]" />
      <span className="font-semibold text-[#124734]">Store</span>
    </button>
  );
}

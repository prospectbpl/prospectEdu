import NotificationBell from "../../Student/ui/NotificationBell";
import ProfileAvatar from "../../Student/ui/ProfileAvatar";
import StoreButton from "../../Student/ui/StoreButton";

export default function AdminTopbar({ pageTitle }) {
  return (
    <header className="bg-white px-6 py-3 flex items-center justify-between shadow-sm w-full">


      {/* LEFT SECTION */}
      <div className="flex flex-col leading-tight">
        {pageTitle ? (
          <>
            <p className="text-sm text-gray-600 font-body">
              Hello <span className="font-semibold text-[#124734]">Admin</span>, Welcome Back!
            </p>
            <h2 className="text-lg font-heading font-semibold text-[#124734] -mt-1">
              {pageTitle}
            </h2>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 font-body">
              Hello <span className="font-semibold text-[#124734]">Admin</span>, Welcome Back!
            </p>
            <h2 className="text-lg font-heading font-semibold text-[#124734] -mt-1">
              Your Dashboard Today
            </h2>
          </>
        )}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        <StoreButton />
        <NotificationBell />
        <ProfileAvatar role="admin" />
      </div>
    </header>
  );
}
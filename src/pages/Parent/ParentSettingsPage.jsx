import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useToast } from "../../context/ToastContext";

import AddChildModal from "../../components/Parent/Settings/AddChildModal";
import ChildRow from "../../components/Parent/Settings/ChildRow";

// ✅ API
import { parentsApi } from "../../services/parents";

export default function ParentSettingsPage() {
  const location = useLocation();

  // ✅ SEO: canonical URL
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  // ✅ SEO: breadcrumb schema
  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Parent Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/parent`
              : "/parent",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Settings",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;
  const { showToast } = useToast();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [parentProfile, setParentProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [children, setChildren] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleProfileChange = (field, value) =>
    setParentProfile((p) => ({ ...p, [field]: value }));

  // ✅ Load parent profile
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoadingProfile(true);
        const { data } = await parentsApi.getMyProfile();
        if (ignore) return;

        const p = data?.profile;
        setParentProfile({
          name: p?.fullName || "",
          email: p?.email || "",
          phone: p?.phone || "",
          address: p?.address || "",
        });
      } catch (e) {
        showToast(e?.response?.data?.message || "Failed to load profile", "error");
      } finally {
        if (!ignore) setLoadingProfile(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [showToast]);

  // ✅ Load linked children
  useEffect(() => {
    let ignore = false;
    async function loadChildren() {
      try {
        setLoadingChildren(true);
        const { data } = await parentsApi.getMyChildren();
        if (ignore) return;
        setChildren(Array.isArray(data?.children) ? data.children : []);
      } catch (e) {
        showToast(e?.response?.data?.message || "Failed to load children", "error");
      } finally {
        if (!ignore) setLoadingChildren(false);
      }
    }
    loadChildren();
    return () => {
      ignore = true;
    };
  }, [showToast]);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        fullName: parentProfile.name,
        email: parentProfile.email,
        phone: parentProfile.phone,
        address: parentProfile.address,
      };

      const { data } = await parentsApi.updateMyProfile(payload);

      const p = data?.profile;
      setParentProfile({
        name: p?.fullName || "",
        email: p?.email || "",
        phone: p?.phone || "",
        address: p?.address || "",
      });

      showToast("Profile updated successfully!", "success");
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Add child: phone -> backend returns student details
  const handleAddChild = async (phone) => {
    const { data } = await parentsApi.addChildByPhone({ phone });
    const child = data?.child;
    if (!child?._id) throw new Error("Invalid response");

    setChildren((prev) => {
      const exists = prev.some((c) => String(c._id) === String(child._id));
      if (exists) return prev;
      return [child, ...prev];
    });

    showToast("Child added successfully", "success");
  };

  // ✅ Remove child link
  const handleRemoveChild = async (studentId) => {
    await parentsApi.removeChild(studentId);
    setChildren((prev) => prev.filter((c) => String(c._id) !== String(studentId)));
  };

  return (
    <div className="flex h-screen bg-[#F7FBF8] overflow-hidden">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Parent Settings | ProspectEdu</title>
        <meta
          name="description"
          content="Manage parent profile details and linked children in ProspectEdu."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div
        className="fixed top-0 left-0 h-full transition-all duration-300 z-40"
        style={{ width: sidebarWidth }}
      >
        <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <ParentTopbar pageTitle="Settings" showStudentSwitcher={false} />
        <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "Settings" },
        ]}
      />

        <div className="p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: Profile */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-[#E6F4EC] shadow-md p-6">
                  <h3 className="text-xl font-semibold text-[#124734]">Parent Profile</h3>
                  <p className="text-sm text-[#5B7065] mt-1">
                    Update your personal information
                  </p>

                  <hr className="my-4 border-[#EAF6EE]" />

                  {loadingProfile ? (
                    <div className="text-sm text-[#5B7065]">Loading profile...</div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-[#5B7065]">Full name</label>
                        <input
                          value={parentProfile.name}
                          onChange={(e) => handleProfileChange("name", e.target.value)}
                          className="w-full mt-2 p-2 border border-[#E6F4EC] rounded-md outline-[#009846]"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#5B7065]">Email</label>
                        <input
                          value={parentProfile.email}
                          onChange={(e) => handleProfileChange("email", e.target.value)}
                          className="w-full mt-2 p-2 border border-[#E6F4EC] rounded-md outline-[#009846]"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#5B7065]">Phone</label>
                        <input
                          value={parentProfile.phone}
                          onChange={(e) => handleProfileChange("phone", e.target.value)}
                          className="w-full mt-2 p-2 border border-[#E6F4EC] rounded-md outline-[#009846]"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#5B7065]">Address</label>
                        <input
                          value={parentProfile.address}
                          onChange={(e) => handleProfileChange("address", e.target.value)}
                          className="w-full mt-2 p-2 border border-[#E6F4EC] rounded-md outline-[#009846]"
                        />
                      </div>

                      <div className="mt-4">
                        <button
                          disabled={saving}
                          onClick={handleUpdateProfile}
                          className="px-4 py-2 bg-[#009846] text-white rounded-lg shadow-sm hover:bg-[#0e3a29] w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {saving ? "Updating..." : "Update Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: CHILDREN */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-[#E6F4EC] shadow-md p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[#124734]">Manage Children</h3>
                      <p className="text-sm text-[#5B7065] mt-1">
                        Add or remove children linked to this account
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-[#009846] text-white rounded-md shadow-sm hover:bg-[#008a3a] w-full sm:w-auto"
                    >
                      + Add New Child
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {loadingChildren ? (
                      <div className="p-4 bg-[#F8FFF8] text-[#5B7065] rounded-md">
                        Loading children...
                      </div>
                    ) : children.length === 0 ? (
                      <div className="p-4 bg-[#F8FFF8] text-[#5B7065] rounded-md">
                        No children linked.
                      </div>
                    ) : (
                      children.map((c) => (
                        <ChildRow key={c._id} child={c} onRemove={() => handleRemoveChild(c._id)} />
                      ))
                    )}
                  </div>

                  <p className="text-xs text-[#98A6A2] mt-6">
                    Tip: Add multiple children and switch between them anywhere in the app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddModal && (
          <AddChildModal onClose={() => setShowAddModal(false)} onAdd={handleAddChild} />
        )}
      </div>
    </div>
  );
}

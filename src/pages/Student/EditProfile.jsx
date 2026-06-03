// src/pages/Student/EditProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
} from "../../services/student.service";

/** ✅ tiny SEO helper (no extra deps) */
function upsertMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}
function upsertMetaByProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}
function upsertCanonical(href) {
  let el = document.querySelector(`link[rel="canonical"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

export default function EditProfile() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const navigate = useNavigate();
  const sidebarWidth = isCollapsed ? 80 : 256;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ controlled form states
  const [basic, setBasic] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    interested: "",
    highestEducation: "",
  });

  const [education, setEducation] = useState({
    currentlyPursuing: "",
    preparingFor: "",
    occupation: "",
    lastExamName: "",
    lastExamYear: "",
    preparingSince: "",
  });

  // ✅ SEO (private page => noindex,follow)
  useEffect(() => {
    const title =
      activeTab === "basic"
        ? "My Profile – Basic Details | ProspectEdu"
        : "My Profile – Education Details | ProspectEdu";
    const desc =
      "Update your ProspectEdu student profile details including basic information and education details.";

    document.title = title;

    const robots = upsertMetaByName("robots", "noindex, follow");
    const description = upsertMetaByName("description", desc);

    // OG/Twitter (helps sharing + rich previews)
    const ogTitle = upsertMetaByProperty("og:title", title);
    const ogDesc = upsertMetaByProperty("og:description", desc);
    const ogType = upsertMetaByProperty("og:type", "website");

    const twCard = upsertMetaByName("twitter:card", "summary");
    const twTitle = upsertMetaByName("twitter:title", title);
    const twDesc = upsertMetaByName("twitter:description", desc);

    // Canonical (strip query/hash)
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    const canonical = upsertCanonical(canonicalUrl);

    return () => {
      // cleanup only what we add/update here (safe)
      [robots, description, ogTitle, ogDesc, ogType, twCard, twTitle, twDesc, canonical].forEach(
        (el) => el && el.remove()
      );
    };
  }, [activeTab]);

  // ✅ load profile on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getMyStudentProfile();

        const user = res.user || {};
        const profile = res.profile || {};

        setBasic((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          phone: user.phone || "",
          email: user.email || "",
          gender: profile.gender || "",
          interested: profile.interested || "",
          highestEducation: profile.highestEducation || "",
        }));

        setEducation((prev) => ({
          ...prev,
          currentlyPursuing: profile.currentlyPursuing || "",
          preparingFor: profile.preparingFor || "",
          occupation: profile.occupation || "",
          lastExamName: profile.lastExamName || "",
          lastExamYear: profile.lastExamYear || "",
          preparingSince: profile.preparingSince || "",
        }));
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChangeBasic = (key) => (e) =>
    setBasic((p) => ({ ...p, [key]: e.target.value }));

  const onChangeEdu = (key) => (e) =>
    setEducation((p) => ({ ...p, [key]: e.target.value }));

  // ✅ submit basic
  const submitBasic = async () => {
    try {
      setSaving(true);
      const payload = {
        fullName: basic.fullName,
        phone: basic.phone,
        gender: basic.gender,
        interested: basic.interested,
        highestEducation: basic.highestEducation,
      };

      const res = await updateMyStudentProfile(payload);

      // refresh local state from server response (best practice)
      const user = res.user || {};
      const profile = res.profile || {};

      setBasic((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        phone: user.phone || prev.phone,
        gender: profile.gender ?? prev.gender,
        interested: profile.interested ?? prev.interested,
        highestEducation: profile.highestEducation ?? prev.highestEducation,
      }));
      window.dispatchEvent(new Event("profile_refresh"));
      alert("Basic details updated!");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update basic details");
    } finally {
      setSaving(false);
    }
  };

  // ✅ submit education
  const submitEducation = async () => {
    try {
      setSaving(true);
      const payload = { ...education };

      const res = await updateMyStudentProfile(payload);

      const profile = res.profile || {};
      setEducation((prev) => ({
        ...prev,
        currentlyPursuing: profile.currentlyPursuing ?? prev.currentlyPursuing,
        preparingFor: profile.preparingFor ?? prev.preparingFor,
        occupation: profile.occupation ?? prev.occupation,
        lastExamName: profile.lastExamName ?? prev.lastExamName,
        lastExamYear: profile.lastExamYear ?? prev.lastExamYear,
        preparingSince: profile.preparingSince ?? prev.preparingSince,
      }));
      window.dispatchEvent(new Event("profile_refresh"));
      alert("Education details updated!");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || "Failed to update education details"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#124734] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <StudentSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Topbar */}
        <div
          className="fixed top-0 bg-white shadow-sm z-[999] h-[64px]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="My Profile" />
        </div>

        {/* Subheader */}
        <div
          className="sticky top-[64px] bg-[#F9FAFB] border-b border-[#E6F4EC] px-4 py-2 z-[998]"
          style={{ left: sidebarWidth }}
        >
          <div className="w-full flex flex-col items-start ">
            <p className="text-sm text-[#5B7065] mb-2">
              <span
                className="cursor-pointer hover:text-[#009846] hover:underline"
                onClick={() => navigate("/student-dashboard")}
              >
                Home
              </span>{" "}
              / Profile /{" "}
              <span className="text-[#124734] font-medium">
                {activeTab === "basic" ? "Basic Details" : "Education Details"}
              </span>
            </p>

            <div className="flex gap-6 border-b border-[#E6F4EC]">
              <button
                onClick={() => setActiveTab("basic")}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "basic"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
              >
                Basic Details
              </button>
              <button
                onClick={() => setActiveTab("education")}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "education"
                    ? "text-[#009846] border-b-2 border-[#009846]"
                    : "text-[#5B7065]"
                }`}
              >
                Education Details
              </button>
            </div>
          </div>
        </div>

        {/* Main Form Area */}
        <main
          className="flex-1 overflow-y-auto px-1 py-0"
          style={{ marginTop: "80px" }}
          aria-labelledby="student-profile-heading"
        >
          {/* ✅ semantic H1 without layout change */}
          <h1 id="student-profile-heading" className="sr-only">
            Student Profile Editor
          </h1>

          {activeTab === "basic" && (
            <div className="max-w-3xl bg-white p-5 rounded-xl shadow-sm border border-[#E6F4EC] ml-4">
              <h2 className="text-2xl font-heading text-[#124734] mb-2">
                Basic Details
              </h2>
              <p className="text-sm text-[#5B7065] mb-6">
                Edit your Basic Details in the fields below
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm mb-1 text-[#124734]">
                    * Name
                  </label>
                  <input
                    type="text"
                    value={basic.fullName}
                    onChange={onChangeBasic("fullName")}
                    className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[#124734]">
                    * Select Gender
                  </label>
                  <select
                    value={basic.gender}
                    onChange={onChangeBasic("gender")}
                    className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Others">Others</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[#124734]">
                    * Interested
                  </label>
                  <input
                    value={basic.interested}
                    onChange={onChangeBasic("interested")}
                    className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 outline-none"
                    placeholder="Engineering / Law / Management ..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[#124734]">
                    * Highest Education
                  </label>
                  <input
                    value={basic.highestEducation}
                    onChange={onChangeBasic("highestEducation")}
                    className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 outline-none"
                    placeholder="12th / Graduate / Post Graduate ..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[#124734]">
                    * Email Address
                  </label>
                  <input
                    type="email"
                    value={basic.email}
                    className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 bg-[#F3F3F3] outline-none"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[#124734]">
                    * Phone Number
                  </label>
                  <input
                    type="text"
                    value={basic.phone}
                    onChange={onChangeBasic("phone")}
                    className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={submitBasic}
                  className="mt-8 px-6 py-3 bg-[#009846] text-white rounded-md shadow-sm hover:bg-[#007d39] transition text-sm font-medium disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update Basic Details"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "education" && (
            <div className="max-w-5xl bg-white p-8 rounded-xl shadow-sm border border-[#E6F4EC] ml-4">
              <h2 className="text-2xl font-heading text-[#124734] mb-2">
                Education Details
              </h2>

              <p className="text-sm text-[#5B7065] mb-6">
                Edit your Education Details in below fields
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["currentlyPursuing", "Currently Pursuing"],
                  ["preparingFor", "Preparing For"],
                  ["occupation", "Occupation"],
                  ["lastExamName", "Last Exam Name"],
                  ["lastExamYear", "Last Exam Year"],
                  ["preparingSince", "How long you are preparing for"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm mb-1 text-[#124734]">
                      * {label}
                    </label>
                    <input
                      type="text"
                      value={education[key]}
                      onChange={onChangeEdu(key)}
                      className="w-full border border-[#A7E1B2] rounded-lg px-4 py-2 outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={submitEducation}
                className="mt-8 px-6 py-3 bg-[#009846] text-white rounded-md shadow-sm hover:bg-[#007d39] transition text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update Education Details"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

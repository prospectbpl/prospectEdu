// src/pages/Student/MyTestSeries.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { fetchMyPurchasedSeries } from "../../lib/testPurchaseApi";

function upsertMeta(name, content) {
  if (!content) return () => {};
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {
    // keep it (safe). If you prefer cleanup, uncomment:
    // el?.remove();
  };
}

function upsertLink(rel, href) {
  if (!href) return () => {};
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return () => {
    // keep it (safe). If you prefer cleanup, uncomment:
    // el?.remove();
  };
}

export default function MyTestSeries() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [mode, setMode] = useState("online"); // online | offline

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  // ✅ SEO (no layout changes)
  useEffect(() => {
    const title = "My Test Series | ProspectEdu Student";
    document.title = title;

    const descCleanup = upsertMeta(
      "description",
      "View and manage your purchased test series in ProspectEdu student dashboard."
    );
    const robotsCleanup = upsertMeta("robots", "noindex, follow");

    // canonical (works even for SPA; helpful for crawlers that still read it)
    const canonicalUrl = window.location?.href || "";
    const canonCleanup = upsertLink("canonical", canonicalUrl);

    return () => {
      descCleanup?.();
      robotsCleanup?.();
      canonCleanup?.();
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyPurchasedSeries();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => load();
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const filteredList = useMemo(() => {
    let list = items;

    if (mode === "online") list = list.filter((x) => x.type === "Online");
    if (mode === "offline") list = list.filter((x) => x.type === "Offline");

    if (activeTab === "all") return list;
    return list;
  }, [items, mode, activeTab]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="My Test Series" />
        </header>

        <nav className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] py-3">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5">
            <div>
              <p className="text-sm text-[#5B7065] mb-2">
                Home / <span className="text-[#124734] font-medium">My Test Series</span>
              </p>

              <div className="flex gap-6 border-b border-[#E6F4EC]">
                <button
                  className={`pb-2 text-sm font-medium ${
                    activeTab === "all" ? "text-[#009846] border-b-2 border-[#009846]" : "text-[#5B7065]"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  All Test Series
                </button>
              </div>
            </div>

            <div className="flex items-center bg-[#E6F4EC] rounded-full border border-[#CDE8D5] overflow-hidden">
              <button
                onClick={() => setMode("online")}
                className={`px-5 py-1.5 text-sm font-medium transition-all ${
                  mode === "online" ? "bg-[#009846] text-white" : "text-[#124734] hover:bg-[#DFF3E6]"
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setMode("offline")}
                className={`px-5 py-1.5 text-sm font-medium transition-all ${
                  mode === "offline" ? "bg-[#009846] text-white" : "text-[#124734] hover:bg-[#DFF3E6]"
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-8" style={{ marginTop: "128px", height: "calc(100vh - 128px)" }}>
          <div className="max-w-6xl mx-auto w-full">
            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">Loading...</div>
            ) : filteredList.length === 0 ? (
              <RefreshComponent message="You haven't purchased any test series!" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((t) => (
                  <div
                    key={t._id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={t.imageUrl || "/src/assets/test1.webp"}
                        alt={t.title}
                        className="w-full h-44 object-contain bg-[#F9FAFB]"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        className={`absolute top-2 right-2 text-xs font-semibold px-3 py-1 rounded-md text-white ${
                          t.type === "Online" ? "bg-[#1E5631]" : "bg-red-600"
                        }`}
                      >
                        {t.type}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-semibold text-lg mb-3 text-center">{t.title}</h3>
                      <hr className="my-3 border-gray-200" />

                      <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700">
                        <p>
                          <strong>Total Test:</strong> {t.totalTest}
                        </p>
                        <p>
                          <strong>Language:</strong> {t.language}
                        </p>
                        <p>
                          <strong>Total Question:</strong> {t.totalQuestion}
                        </p>
                        <p>
                          <strong>Amount:</strong>{" "}
                          <b className="text-red-600">{Number(t.price || 0) === 0 ? "Free" : `₹${t.price}`}</b>
                        </p>
                        <p className="col-span-2">
                          <strong>Question Type:</strong> {t.questionType}
                        </p>
                      </div>

                      <div className="mt-6 text-center">
                        <button
                          onClick={() => navigate(`/student-test-learning/${t._id}`)}
                          className="border border-[#1E5631] text-[#1E5631] font-medium px-6 py-2 rounded-full hover:bg-[#1E5631] hover:text-white transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

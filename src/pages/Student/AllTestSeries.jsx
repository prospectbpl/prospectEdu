// src/pages/Student/AllTestSeries.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import RefreshComponent from "../../components/RefreshComponent";
import { fetchPublicTestSeries } from "../../lib/testSeriesApi";

function upsertMeta(name, content) {
  const key = `meta[name="${name}"]`;
  let tag = document.head.querySelector(key);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel, href) {
  const key = `link[rel="${rel}"]`;
  let tag = document.head.querySelector(key);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

export default function AllTestSeries() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const tabs = [
    { key: "all", label: "All Test Series" },
    { key: "online", label: "Online Test Series" },
    { key: "offline", label: "Offline Test Series" },
    { key: "both", label: "Online + Offline Test Series" },
  ];

  // ✅ SEO (private page => noindex)
  useEffect(() => {
    document.title = "All Test Series | Student Dashboard | ProspectEdu";
    upsertMeta(
      "description",
      "Explore all available test series in your ProspectEdu student dashboard. Filter by online or offline mode and checkout easily."
    );
    upsertMeta("robots", "noindex, follow");

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    upsertLink("canonical", canonicalUrl);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPublicTestSeries();
        setItems(data);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all" || activeTab === "both") return items;
    if (activeTab === "online") return items.filter((x) => x.type === "Online");
    if (activeTab === "offline") return items.filter((x) => x.type === "Offline");
    return items;
  }, [items, activeTab]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } fixed top-0 left-0 h-full z-40 transition-all duration-300`}
      >
        <StudentSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Test Series" />
        </header>

        <nav
          className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] py-3"
          aria-label="Student test series navigation"
        >
          <div className="w-full flex flex-col items-start pl-5">
            <p className="text-sm text-[#5B7065] mb-2">
              <span
                className="hover:underline hover:text-[#009846] cursor-pointer"
                onClick={() => navigate("/student-dashboard")}
              >
                Home
              </span>{" "}
              /{" "}
              <span
                className="hover:underline hover:text-[#009846] cursor-pointer"
                onClick={() => navigate("/student/all-test-series")}
              >
                Recommended Test Series
              </span>{" "}
              / <span className="text-[#124734] font-medium">All Test Series</span>
            </p>

            <div
              className="flex flex-wrap gap-2 w-full"
              role="tablist"
              aria-label="Test series filters"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`panel-${tab.key}`}
                  id={`tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? "bg-[#009846] text-white shadow"
                      : "bg-white text-[#124734] border border-[#CDE8D5] hover:bg-[#E6F4EC]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main
          className="flex-1 overflow-y-auto px-6 py-8"
          style={{ marginTop: "128px" }}
          aria-labelledby="all-test-series-h1"
        >
          {/* Hidden H1 for semantics (no layout change) */}
          <h1 id="all-test-series-h1" className="sr-only">
            All Test Series
          </h1>

          <section
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
            <div className="w-full max-w-6xl mx-auto">
              {loading ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6F4EC]">
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <RefreshComponent message="No test series available." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((t) => (
                    <div
                      key={t._id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={t.imageUrl || "/src/assets/test1.webp"}
                          alt={t.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-44 object-contain bg-[#F9FAFB]"
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
                        <h2 className="font-semibold text-lg mb-3 text-center">
                          {t.title}
                        </h2>
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
                            <strong>Price:</strong>{" "}
                            <b className="text-red-600">
                              {Number(t.price || 0) === 0 ? "Free" : `₹${t.price}`}
                            </b>
                          </p>
                          <p className="col-span-2">
                            <strong>Question Type:</strong> {t.questionType}
                          </p>
                        </div>

                        <div className="mt-6 text-center">
                          <button
                            onClick={() => navigate(`/checkout-test-learning/${t._id}`)}
                            className="border border-[#1E5631] text-[#1E5631] font-medium px-6 py-2 rounded-full hover:bg-[#1E5631] hover:text-white transition"
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

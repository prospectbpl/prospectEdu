import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Download, Loader2 } from "lucide-react";

import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import { studyMaterialsApi } from "../../services/studyMaterials";

function safeName(name) {
  const n = String(name || "file").trim();
  return n || "file";
}

function extBadge(fileType) {
  const t = String(fileType || "").toLowerCase();
  if (!t) return "FILE";
  return t.toUpperCase();
}

// ✅ SEO helpers
function upsertMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function StudyMaterials() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all"); // all | pdf | handwritten
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [scopeInfo, setScopeInfo] = useState({ scope: "", categories: [] });

  // ✅ SEO (private page)
  useEffect(() => {
    document.title = "Study Materials | ProspectEdu Student";
    upsertMeta("description", "Access and download your study materials (PDF/handwritten) in ProspectEdu.");
    upsertMeta("robots", "noindex, follow");
    upsertLink("canonical", window.location.href);
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await studyMaterialsApi.studentList({
        type: activeTab, // backend expects "all" | "pdf" | "handwritten"
        q,
      });

      setItems(res.data?.items || []);
      setScopeInfo({
        scope: res.data?.scope || "",
        categories: res.data?.categories || [],
      });
    } catch (e) {
      console.log(e);
      setItems([]);
      setScopeInfo({ scope: "", categories: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, q]);

  const counts = useMemo(() => {
    let pdf = 0;
    let handwritten = 0;
    for (const it of items) {
      if (String(it.materialType) === "pdf") pdf += 1;
      if (String(it.materialType) === "handwritten") handwritten += 1;
    }
    return { all: items.length, pdf, handwritten };
  }, [items]);

  const downloadFile = async (it) => {
    try {
      const res = await studyMaterialsApi.getFileBlob(it._id);
      const mime = res.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mime });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName(it.fileName || it.title || "file");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log(e);
      alert("Failed to download file");
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
        aria-label="Student navigation sidebar"
      >
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      {/* Main */}
      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidthPx,
          width: `calc(100vw - ${sidebarWidthPx}px)`,
        }}
      >
        {/* Topbar */}
        <header className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]" style={{ left: sidebarWidthPx, right: 0 }}>
          <StudentTopbar pageTitle="Study Materials" />
        </header>

        {/* Toolbar */}
        <div className="sticky top-[64px] bg-[#F9FAFB] z-[998] border-b border-[#E6F4EC] px-6 py-4" style={{ left: sidebarWidthPx }}>
          <p className="text-sm text-[#5B7065] mb-3">
            <span className="hover:underline hover:text-[#009846] cursor-pointer" onClick={() => navigate("/student-dashboard")}>
              Home
            </span>{" "}
            / <span className="text-[#124734] font-medium">Study Materials</span>
          </p>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 justify-between">
            <div className="flex gap-6 border-b border-[#E6F4EC]">
              {[
                { key: "all", label: `All (${counts.all})` },
                { key: "pdf", label: `PDFs (${counts.pdf})` },
                { key: "handwritten", label: `Handwritten (${counts.handwritten})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`pb-2 text-sm font-medium transition ${
                    activeTab === t.key ? "text-[#009846] border-b-2 border-[#009846]" : "text-[#5B7065] hover:text-[#124734]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-[360px]">
              <div className="flex items-center gap-2 bg-white border border-[#E6F4EC] rounded-xl px-3 py-2 shadow-sm">
                <Search className="w-4 h-4 text-[#5B7065]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search notes…"
                  className="w-full outline-none text-sm text-[#124734] placeholder:text-[#8BA095]"
                />
              </div>
            </div>
          </div>

          {scopeInfo?.scope ? (
            <div className="mt-3 text-xs text-[#5B7065]">
              {scopeInfo.scope === "subscribed" ? (
                <span>
                  Showing materials for your enrolled course categories
                  {scopeInfo.categories?.length ? (
                    <span className="text-[#124734] font-medium"> ({scopeInfo.categories.join(", ")})</span>
                  ) : null}
                </span>
              ) : scopeInfo.scope === "all" ? (
                <span>Showing all published materials.</span>
              ) : scopeInfo.scope === "subscribed-empty" ? (
                <span>No categories found for your enrollments.</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-8" style={{ marginTop: "64px" }}>
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white border border-[#E6F4EC] rounded-2xl shadow-sm p-5">
              {loading ? (
                <div className="flex items-center gap-2 text-[#5B7065] text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading materials…
                </div>
              ) : items.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-[#ECF5EE] border border-[#A7E1B2] flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#009846]" />
                  </div>
                  <div className="mt-3 text-[#124734] font-semibold">No materials found</div>
                  <div className="mt-1 text-sm text-[#5B7065]">Try changing the tab or searching with a different keyword.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((it) => (
                    <article key={it._id} className="border border-[#E6F4EC] rounded-2xl p-5 hover:shadow-md transition bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[#124734] font-semibold leading-snug line-clamp-2">{it.title}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-[#ECF5EE] text-[#124734] border border-[#A7E1B2]">
                              {String(it.category || "").toUpperCase()}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                              {it.materialType === "handwritten" ? "HANDWRITTEN" : "PDF"}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-[#F9FAFB] text-[#5B7065] border border-[#E6F4EC]">
                              {extBadge(it.fileType)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-xs text-[#5B7065]">
                        File: <span className="text-[#124734]">{safeName(it.fileName)}</span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => downloadFile(it)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#A7E1B2] text-[#124734] text-sm hover:bg-[#ECF5EE] transition"
                          type="button"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate(-1)} className="mt-5 text-sm underline text-[#124734]">
              ← Back
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

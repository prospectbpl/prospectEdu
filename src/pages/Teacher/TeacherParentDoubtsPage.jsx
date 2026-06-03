import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import TeacherSidebar from "../../components/Teacher/TeacherSidebar";
import TeacherTopbar from "../../components/Teacher/TeacherTopbar";
import { teacherDoubtsApi } from "../../lib/parentDoubtsApi";
import Breadcrumb from "../../components/Breadcrumb";
import { Search, Inbox, Clock, Send, UserRound, BadgeCheck } from "lucide-react";

function Badge({ status }) {
  const isOpen = status === "OPEN";
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${
        isOpen
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      {isOpen ? "OPEN" : "ANSWERED"}
    </span>
  );
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}

export default function TeacherParentDoubtsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // ✅ SEO
  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const breadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Teacher Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/teacher-dashboard`
              : "/teacher-dashboard",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Parent Doubts",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await teacherDoubtsApi.inbox();
      const list = res?.data?.data || [];
      setItems(list);
      if (!selected && list.length) setSelected(list[0]);
    } catch {
      setItems([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setErr("");
    setAnswer(selected?.answer || "");
  }, [selected]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => {
      return (
        (x.subject || "").toLowerCase().includes(s) ||
        (x.message || "").toLowerCase().includes(s) ||
        (x.parent?.name || x.parent?.fullName || "").toLowerCase().includes(s) ||
        (x.status || "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const submitAnswer = async () => {
    try {
      setErr("");
      if (!selected?._id) return;
      if (answer.trim().length < 2) return setErr("Answer is too short");

      setSending(true);
      await teacherDoubtsApi.answer(selected._id, { answer });
      await load(); // refresh list + status
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send answer");
    } finally {
      setSending(false);
    }
  };

  const parentName = selected?.parent?.name || selected?.parent?.fullName || "Parent";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ✅ SEO (NO layout impact) */}
      <Helmet>
        <title>Parent Doubts | Teacher Dashboard | ProspectEdu</title>
        <meta
          name="description"
          content="View parent doubts and reply from the ProspectEdu teacher dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <TeacherSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 flex flex-col">
        <TeacherTopbar title="Parent Doubts" />
         <Breadcrumb
        items={[
          { label: "Dashboard", to: "/teacher-dashboard" },
          { label: "Parents Doubts" },
        ]}
      />

        <div className="p-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Parent Doubts Inbox</h1>
              <p className="text-sm text-gray-500">
                Answer parents’ doubts and keep a clean history.
              </p>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Search parent, subject..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Inbox */}
            <div className="lg:col-span-1 bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Inbox size={18} />
                  <span className="font-semibold">Inbox</span>
                </div>
                <span className="text-xs text-gray-500">{filtered.length}</span>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-sm text-gray-500">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No doubts found.</div>
                ) : (
                  filtered.map((d) => {
                    const active = selected?._id === d._id;
                    const pName = d.parent?.name || d.parent?.fullName || "Parent";
                    return (
                      <button
                        key={d._id}
                        onClick={() => setSelected(d)}
                        className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                          active ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {d.subject}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                              <UserRound size={12} /> {pName}
                            </div>
                          </div>
                          <Badge status={d.status} />
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                          <Clock size={12} />
                          <span>{formatDate(d.createdAt)}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detail + Answer */}
            <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
              {!selected ? (
                <div className="p-8 text-center text-gray-500">Select a doubt to answer.</div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selected.subject}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={14} /> {parentName}
                        </span>
                        <span className="text-gray-300">•</span>
                        <Badge status={selected.status} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(selected.createdAt)}</div>
                  </div>

                  {/* Parent doubt */}
                  <div className="mt-5 p-4 rounded-2xl border bg-gray-50">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Parent Doubt</div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Answer box */}
                  <div className="mt-4 p-4 rounded-2xl border bg-green-50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-800 mb-2">
                      <BadgeCheck size={14} /> Your Reply
                    </div>

                    {err ? (
                      <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3">
                        {err}
                      </div>
                    ) : null}

                    <textarea
                      rows={5}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-green-200 bg-white"
                      placeholder="Write a clear and helpful answer..."
                    />

                    <div className="mt-3 flex items-center justify-end">
                      <button
                        disabled={sending}
                        onClick={submitAnswer}
                        className="px-4 py-2 rounded-xl bg-[#124734] text-white hover:bg-[#0f3e2d] flex items-center gap-2 disabled:opacity-60"
                      >
                        <Send size={16} />
                        {sending ? "Sending..." : "Send Answer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

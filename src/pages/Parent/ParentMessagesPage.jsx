import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import ParentSidebar from "../../components/Parent/ParentSidebar";
import ParentTopbar from "../../components/Parent/ParentTopbar";
import { parentDoubtsApi } from "../../lib/parentDoubtsApi";
import Breadcrumb from "../../components/Breadcrumb";
import {
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  MessageSquareText,
  User,
  Sparkles,
  AlertCircle,
} from "lucide-react";

function Badge({ status }) {
  const isOpen = status === "OPEN";
  return (
    <span
      className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${
        isOpen
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
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

function NewDoubtModal({ open, onClose, onCreated }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) {
      setSubject("");
      setCategory("General");
      setPriority("MEDIUM");
      setMessage("");
      setSaving(false);
      setErr("");
    }
  }, [open]);

  const submit = async () => {
    try {
      setErr("");

      if (subject.trim().length < 3) return setErr("Subject must be at least 3 characters");
      if (message.trim().length < 5) return setErr("Message must be at least 5 characters");

      setSaving(true);

      // ✅ No teacherId: it goes to ALL teachers
      await parentDoubtsApi.create({
        subject,
        message,
        category,
        priority,
      });

      onCreated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to submit doubt");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              Ask a Doubt
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Send your question — all teachers can view and reply.
            </p>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl border hover:bg-gray-50">
            Close
          </button>
        </div>

        <div className="p-6 space-y-4">
          {err ? (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {err}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-2xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-2xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. Doubt in Fractions (Chapter 3)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-2xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="General / Maths / Science..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Your Doubt</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-2xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Write your question clearly..."
            />
          </div>
        </div>

        <div className="px-6 py-5 border-t flex items-center justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2.5 rounded-2xl border hover:bg-white">
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className="px-4 py-2.5 rounded-2xl bg-[#124734] text-white hover:bg-[#0f3e2d] flex items-center gap-2 disabled:opacity-60 shadow"
          >
            <Send size={16} />
            {saving ? "Sending..." : "Send Doubt"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ParentDoubt() {
  const location = useLocation();

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
          name: "Parent Dashboard",
          item:
            typeof window !== "undefined"
              ? `${window.location.origin}/parent`
              : "/parent",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Messages",
          item: canonicalUrl,
        },
      ],
    }),
    [canonicalUrl]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await parentDoubtsApi.myDoubts();
      const list = res?.data?.data || [];
      setItems(list);
      setSelected((prev) => prev || list[0] || null);
    } catch {
      setItems([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => {
      return (
        (x.subject || "").toLowerCase().includes(s) ||
        (x.message || "").toLowerCase().includes(s) ||
        (x.status || "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  const answeredByName =
    selected?.answeredBy?.name || selected?.answeredBy?.fullName || "Teacher";

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-visible">
      {/* ✅ SEO */}
      <Helmet>
        <title>Parent Messages | ProspectEdu</title>
        <meta
          name="description"
          content="Ask teachers doubts, view replies and manage message threads in ProspectEdu parent dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col">
        <ParentTopbar title="Messages" />
      
       <Breadcrumb
        items={[
          { label: "Dashboard", to: "/parent-dashboard" },
          { label: "Messages" },
        ]}
      />
        <div className="p-5 ">
          {/* Header */}
          <div className="rounded-3xl border bg-white shadow-sm p-5 mb-4 text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  Ask Teacher Doubts
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Ask questions anytime — all teachers can view and respond.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-9 pr-3 py-2.5 rounded-2xl border bg-white outline-none focus:ring-2 focus:ring-emerald-200 w-[240px] sm:w-[320px]"
                    placeholder="Search doubts..."
                  />
                </div>

                <button
                  onClick={() => setShowNew(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#124734] text-white hover:bg-[#0f3e2d] flex items-center gap-2 shadow"
                >
                  <Plus size={16} /> Ask a Doubt
                </button>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* List */}
            <div className="lg:col-span-1 bg-white rounded-3xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800">
                  <MessageSquareText size={18} />
                  <span className="font-bold">Your Doubts</span>
                </div>
                <span className="text-xs text-gray-500">{filtered.length}</span>
              </div>

              <div className="max-h-[68vh] overflow-y-auto">
                {loading ? (
                  <div className="p-5 text-sm text-gray-500">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <MessageSquareText className="text-emerald-700" size={22} />
                    </div>
                    <p className="mt-3 font-semibold text-gray-900">No doubts yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Click <b>Ask a Doubt</b> to start.
                    </p>
                  </div>
                ) : (
                  filtered.map((d) => {
                    const active = selected?._id === d._id;
                    return (
                      <button
                        key={d._id}
                        onClick={() => setSelected(d)}
                        className={`w-full text-left px-5 py-4 border-b hover:bg-gray-50 transition ${
                          active ? "bg-emerald-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-gray-900 text-sm line-clamp-1">
                              {d.subject}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                              {d.message}
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

            {/* Detail */}
            <div className="lg:col-span-2 bg-white rounded-3xl border shadow-sm overflow-hidden">
              {!selected ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 border flex items-center justify-center">
                    <MessageSquareText size={22} className="text-gray-600" />
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">Select a doubt</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a doubt from the left to view details & reply.
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">
                        {selected.subject}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <User size={14} />
                          {selected.status === "ANSWERED"
                            ? `Answered by ${answeredByName}`
                            : "Waiting for teacher reply"}
                        </span>

                        <span className="text-gray-300">•</span>

                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 border">
                          {selected.category || "General"}
                        </span>

                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 border">
                          {selected.priority || "MEDIUM"}
                        </span>

                        <Badge status={selected.status} />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">{formatDate(selected.createdAt)}</div>
                  </div>

                  <div className="mt-5 p-5 rounded-3xl border bg-gray-50">
                    <div className="text-xs font-bold text-gray-700 mb-2">Your Doubt</div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  <div className="mt-4 p-5 rounded-3xl border bg-emerald-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
                      <CheckCircle2 size={14} />
                      Teacher Reply
                    </div>

                    {selected.status === "ANSWERED" && selected.answer ? (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.answer}</p>
                    ) : (
                      <p className="text-sm text-gray-600">No reply yet. Please check back later.</p>
                    )}
                  </div>

                  {selected.status === "ANSWERED" && selected.answeredAt ? (
                    <p className="text-[11px] text-gray-500 mt-3">
                      Replied on {formatDate(selected.answeredAt)}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <NewDoubtModal open={showNew} onClose={() => setShowNew(false)} onCreated={load} />
      </div>
    </div>
  );
}

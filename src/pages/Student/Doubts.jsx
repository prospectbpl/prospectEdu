import React, { useEffect, useMemo, useRef, useState } from "react";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentTopbar from "../../components/Student/StudentTopbar";
import AskDoubtModal from "../../components/Student/AskDoubtModal";
import Breadcrumb from "../../components/Breadcrumb";
import { api } from "../../lib/api";

function upsertHeadMeta({ name, property, content }) {
  if (!content) return;
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    if (name) el.setAttribute("name", name);
    if (property) el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

export default function Doubts() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidthPx = isCollapsed ? 80 : 256;

  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const didFirstLoadRef = useRef(false);

  // ✅ unread tracking (student sees unread TEACHER messages)
  const [lastSeenMap, setLastSeenMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("student_doubt_seen") || "{}");
    } catch {
      return {};
    }
  });

  // ✅ prevent UI "refresh" (re-render) unless data changed
  const lastListStampRef = useRef("");
  const lastThreadStampRef = useRef("");

  // ✅ smart scroll (don’t jump if user scrolls up)
  const threadBoxRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const markSeen = (ticketId) => {
    const updated = { ...lastSeenMap, [ticketId]: new Date().toISOString() };
    setLastSeenMap(updated);
    localStorage.setItem("student_doubt_seen", JSON.stringify(updated));
  };

  const getUnreadForTicket = (ticket) => {
    const lastSeen = lastSeenMap[ticket._id];
    const msgs = ticket.messages || [];
    if (!msgs.length) return 0;

    const cutoff = lastSeen ? new Date(lastSeen) : null;

    // unread = teacher messages after lastSeen
    return msgs.filter((m) => {
      if (m.fromRole !== "teacher") return false;
      if (!m.createdAt) return false;
      return cutoff ? new Date(m.createdAt) > cutoff : true;
    }).length;
  };

  const load = async (silent = false) => {
    // ✅ only show loading on first load (not on polling)
    if (!silent && !didFirstLoadRef.current) setLoading(true);

    try {
      const res = await api.get("/support-tickets/me");
      const next = res?.data?.data || [];

      const stamp = next
        .map((t) => `${t._id}:${t.lastMessageAt || t.updatedAt || t.createdAt || ""}`)
        .join("|");

      if (stamp !== lastListStampRef.current) {
        lastListStampRef.current = stamp;
        setItems(next);
      }

      didFirstLoadRef.current = true;
    } catch {
      // ✅ don't setItems([]) here during polling (causes list blink)
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadThread = async (id) => {
    try {
      const res = await api.get(`/support-tickets/${id}`);
      const next = res?.data?.data || null;

      // ✅ stamp based on message count + last message time
      const msgs = next?.messages || [];
      const last = msgs.length ? msgs[msgs.length - 1] : null;
      const stamp = `${next?._id || ""}:${msgs.length}:${last?.createdAt || ""}:${
        next?.assignedTeacher?._id || next?.assignedTeacher || ""
      }`;

      if (stamp !== lastThreadStampRef.current) {
        lastThreadStampRef.current = stamp;
        setThread(next);

        // ✅ auto-scroll ONLY if user is at bottom
        if (stickToBottomRef.current) {
          requestAnimationFrame(() => {
            threadBoxRef.current?.scrollTo({
              top: threadBoxRef.current.scrollHeight,
              behavior: "smooth",
            });
          });
        }
      }
    } catch {
      // don’t keep setting null repeatedly — flicker
    }
  };

  // ✅ SEO (private page): title + meta (noindex)
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Doubts | Student Dashboard";

    const robots = upsertHeadMeta({ name: "robots", content: "noindex, follow" });
    const desc = upsertHeadMeta({
      name: "description",
      content: "Ask doubts, view teacher replies, and manage your support tickets.",
    });

    return () => {
      document.title = prevTitle;
      if (robots?.parentNode) robots.parentNode.removeChild(robots);
      if (desc?.parentNode) desc.parentNode.removeChild(desc);
    };
  }, []);

  useEffect(() => {
    load();
  }, []);

  // ✅ poll list so new messages reorder to top + badge updates
  useEffect(() => {
    const t = setInterval(() => load(true), 5000); // ✅ silent polling
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected?._id) loadThread(selected._id);
  }, [selected?._id]);

  // ✅ poll thread (your chat already does this)
  useEffect(() => {
    if (!selected?._id) return;
    const t = setInterval(() => loadThread(selected._id), 5000);
    return () => clearInterval(t);
  }, [selected?._id]);

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
    );
  }, [items]);

  const sendMessage = async (file) => {
    if (!selected?._id) return;
    if (!text.trim() && !file) return;

    setSending(true);
    try {
      const fd = new FormData();
      fd.append("text", text);
      if (file) fd.append("file", file);

      const res = await api.post(`/support-tickets/${selected._id}/messages`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setText("");
      setThread(res?.data?.data || null);

      // ✅ student sent => mark seen
      markSeen(selected._id);

      await load(); // refresh left list
    } finally {
      setSending(false);
    }
  };

  const teacherName =
    thread?.assignedTeacher?.name || (thread?.assignedTeacher ? "Assigned" : "Unassigned");

  return (
    <div className="flex h-screen bg-[#F7FAFF] overflow-hidden">
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} fixed top-0 left-0 h-full z-40 transition-all duration-300`}
        aria-label="Student sidebar"
      >
        <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      <div
        className="flex flex-col flex-1 h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidthPx, width: `calc(100vw - ${sidebarWidthPx}px)` }}
      >
        <header
          className="fixed top-0 z-[999] bg-white shadow-sm h-[64px]"
          style={{ left: sidebarWidthPx, right: 0 }}
        >
          <StudentTopbar isCollapsed={isCollapsed} pageTitle="Doubts" />
          
        </header>
       
        
        {/* Main content */}
        
        <main
          className="flex-1 mt-[64px] flex overflow-hidden text-left"
          aria-labelledby="doubts-page-heading"
        >
          
          
          {/* Hidden semantic H1 */}
          <h1 id="doubts-page-heading" className="sr-only">
            Student Doubts and Replies
          </h1>
          
          

          {/* LEFT LIST */}
          <section
            className="w-[360px] max-w-[90vw] border-r bg-white overflow-y-auto"
            aria-label="My doubts list"
          >
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#124734]">My Doubts</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#009846] hover:bg-[#007d39] transition text-white px-4 py-2 rounded-lg text-sm shadow"
                aria-label="Ask a new doubt"
              >
                Ask Doubt
              </button>
            </div>

            {loading ? (
              <div className="p-5 text-sm text-[#5B7065]">Loading...</div>
            ) : sorted.length === 0 ? (
              <div className="p-5 text-sm text-[#5B7065]">No doubts yet.</div>
            ) : (
              <div className="p-3 space-y-2">
                {sorted.map((d) => {
                  const unread = getUnreadForTicket(d);

                  return (
                    <button
                      key={d._id}
                      onClick={() => {
                        setSelected(d);
                        // ✅ opened => mark seen
                        markSeen(d._id);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition ${
                        selected?._id === d._id
                          ? "bg-[#A7E1B2] border-[#A7E1B2]"
                          : "bg-white hover:bg-[#F2FBF5]"
                      }`}
                      aria-label={`Open doubt: ${d.doubtType || "Doubt"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#124734] truncate">
                            {d.doubtType || "Doubt"}
                          </p>
                          <p className="text-xs text-[#5B7065] truncate">{d.question}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* ✅ UNREAD BADGE (same layout, just added small badge) */}
                          {unread > 0 ? (
                            <span className="text-[11px] px-2 py-1 bg-[#DFF6E6] text-[#124734] rounded-full">
                              {unread}
                            </span>
                          ) : null}

                          <span className="text-[10px] text-[#98A6A2]">
                            {new Date(d.lastMessageAt || d.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#5B7065] mt-1">
                        Teacher:{" "}
                        <span className="font-medium">
                          {d.assignedTeacher?.name ||
                            (d.assignedTeacher ? "Assigned" : "Unassigned")}
                        </span>
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT THREAD */}
          <section className="flex-1 bg-[#F9FAFB] flex flex-col" aria-label="Doubt thread">
            {!selected ? (
              <div className="h-full flex items-center justify-center text-[#5B7065]">
                Select a doubt to view replies
              </div>
            ) : !thread ? (
              <div className="p-5 text-sm text-[#5B7065]">Loading thread...</div>
            ) : (
              <>
                <div className="p-4 border-b bg-white">
                  <h2 className="text-base font-semibold text-[#124734]">
                    {thread.doubtType || "Doubt"} • {teacherName}
                  </h2>
                  <p className="text-[11px] text-[#98A6A2] mt-1">Last 10 days only</p>
                </div>

                <div
                  ref={threadBoxRef}
                  onScroll={() => {
                    const el = threadBoxRef.current;
                    if (!el) return;
                    const atBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 80;
                    stickToBottomRef.current = atBottom;
                  }}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FFFA]"
                  role="log"
                  aria-label="Messages"
                >
                  {(thread.messages || []).map((m) => {
                    const isMe = m.fromRole === "student";
                    return (
                      <div
                        key={m._id}
                        className={`max-w-[85%] md:max-w-[520px] p-3 rounded-xl border ${
                          isMe ? "ml-auto bg-[#A7E1B2]/50" : "bg-[#A7E1B2] border-[#A7E1B2]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-[#124734]">
                            {isMe ? "You" : "Teacher"}
                          </span>
                          <span className="text-[10px] text-[#5B7065]">
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {m.text ? <p className="text-sm text-[#124734] mt-1">{m.text}</p> : null}

                        {m.attachment?.url ? (
                          <a
                            href={m.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#009846] underline mt-2 inline-block"
                          >
                            View attachment ({m.attachment.name || "file"})
                          </a>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t bg-white flex gap-2" aria-label="Send message">
                  <input
                    className="flex-1 p-2 border rounded-lg outline-[#124734]"
                    placeholder="Write a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={sending}
                    aria-label="Message text"
                  />
                  <label className="px-3 py-2 border rounded-lg cursor-pointer text-sm">
                    File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) sendMessage(f);
                        e.target.value = "";
                      }}
                      disabled={sending}
                      aria-label="Upload attachment"
                    />
                  </label>
                  <button
                    onClick={() => sendMessage(null)}
                    disabled={sending}
                    className="px-4 bg-[#124734] text-white rounded-lg disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </section>
        </main>

        <AskDoubtModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={async () => {
            setShowModal(false);
            await load();
          }}
        />
      </div>
    </div>
  );
}

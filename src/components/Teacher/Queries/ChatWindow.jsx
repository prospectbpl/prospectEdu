import { useEffect, useRef, useState } from "react";
import UploadBar from "./UploadBar";
import MessageBubble from "./MessageBubble";
import { api } from "../../../lib/api";

export default function ChatWindow({ doubt }) {
  const [thread, setThread] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const lastThreadStampRef = useRef("");
const threadBoxRef = useRef(null);
const stickToBottomRef = useRef(true);
const firstLoadedRef = useRef(false);


const load = async (silent = false) => {
  try {
    // ✅ show loader ONLY on the very first load
    if (!silent && !firstLoadedRef.current) setLoading(true);

    const res = await api.get(`/support-tickets/${doubt._id}`);
    const next = res?.data?.data || null;

    const msgs = next?.messages || [];
    const last = msgs.length ? msgs[msgs.length - 1] : null;

    // ✅ stable stamp
    const stamp = `${next?._id || ""}:${msgs.length}:${last?.createdAt || ""}:${
      next?.assignedTeacher?._id || next?.assignedTeacher || ""
    }`;

    // ✅ only update state if changed OR first time
    if (!thread || stamp !== lastThreadStampRef.current) {
      lastThreadStampRef.current = stamp;
      setThread(next);

      // ✅ auto-scroll only if user at bottom
      if (stickToBottomRef.current) {
        requestAnimationFrame(() => {
          threadBoxRef.current?.scrollTo({
            top: threadBoxRef.current.scrollHeight,
            behavior: "smooth",
          });
        });
      }
    }

    firstLoadedRef.current = true;
  } catch {
    // no state reset => no flicker
  } finally {
    // ✅ stop loader after first load only
    if (!silent && !firstLoadedRef.current) setLoading(false);
    if (!silent) setLoading(false);
  }
};

useEffect(() => {
  if (!doubt?._id) return;
  load(false);

  const t = setInterval(() => load(true), 3000); // ✅ silent polling
  return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [doubt?._id]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  const send = async (file) => {
    if (!doubt?._id) return;
    if (!input.trim() && !file) return;

    setSending(true);
    try {
      const fd = new FormData();
      fd.append("text", input);
      if (file) fd.append("file", file);

      await api.post(`/support-tickets/${doubt._id}/messages`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setInput("");
      await load();
    } finally {
      setSending(false);
    }
  };

  // ✅ keep layout: show header + messages area + uploadbar + composer always
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-[#124734]">
          {thread?.student?.name || "Student"}
        </h2>
        <p className="text-xs text-[#5B7065]">
          Assigned: {thread?.assignedTeacher?.name || "Unassigned"} • Last 10 days only
        </p>
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
>

        {loading ? (
          <div className="text-sm text-[#5B7065]">Loading chat...</div>
        ) : (thread?.messages || []).length === 0 ? (
          <div className="text-sm text-[#5B7065]">No messages yet.</div>
        ) : (
          (thread.messages || []).map((m) => (
            <div
              key={m._id}
              className={m.fromRole === "teacher" ? "flex justify-end" : "flex justify-start"}
            >
              <MessageBubble
                m={{
                  from: m.fromRole,
                  text: m.text,
                  time: new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  attachment: m.attachment,
                }}
              />
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <UploadBar onPickFile={send} onPickImage={send} />

      <div className="p-3 border-t bg-white flex gap-2">
        <input
          className="flex-1 p-2 border rounded-lg outline-[#124734]"
          placeholder="Type your reply..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending || loading}
        />
        <button
          onClick={() => send(null)}
          disabled={sending || loading}
          className="px-4 bg-[#124734] text-white rounded-lg disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}

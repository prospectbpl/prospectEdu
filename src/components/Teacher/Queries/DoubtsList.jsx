import { useEffect, useMemo, useRef, useState } from "react";
import QueryItem from "./QueryItem";
import DoubtSearchBar from "./DoubtSearchBar";
import { api } from "../../../lib/api";


export default function DoubtsList({ onSelect, selectedId }) {
  const [search, setSearch] = useState("");
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const didFirstLoadRef = useRef(false);
const lastListStampRef = useRef("");


  // ✅ unread tracking (teacher sees unread STUDENT messages)
  const [lastSeenMap, setLastSeenMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("teacher_doubt_seen") || "{}");
    } catch {
      return {};
    }
  });

  const markSeen = (ticketId) => {
    const updated = { ...lastSeenMap, [ticketId]: new Date().toISOString() };
    setLastSeenMap(updated);
    localStorage.setItem("teacher_doubt_seen", JSON.stringify(updated));
  };

  const getUnreadForTicket = (ticket) => {
    const lastSeen = lastSeenMap[ticket._id];
    const msgs = ticket.messages || [];
    if (!msgs.length) return 0;

    const cutoff = lastSeen ? new Date(lastSeen) : null;

    // unread = student messages after lastSeen
    return msgs.filter((m) => {
      if (m.fromRole !== "student") return false;
      if (!m.createdAt) return false;
      return cutoff ? new Date(m.createdAt) > cutoff : true;
    }).length;
  };

  const load = async (silent = false) => {
  if (!silent && !didFirstLoadRef.current) setLoading(true);

  try {
    const res = await api.get("/support-tickets/teacher/inbox");
    const next = res?.data?.data || [];

    const stamp = next
      .map((t) => `${t._id}:${t.lastMessageAt || t.updatedAt || t.createdAt || ""}`)
      .join("|");

    if (stamp !== lastListStampRef.current) {
      lastListStampRef.current = stamp;
      setDoubts(next);
    }

    didFirstLoadRef.current = true;
  } catch {
    // ✅ don't setDoubts([]) on polling errors → causes list blink
  } finally {
    if (!silent) setLoading(false);
  }
};


  useEffect(() => {
    load();
  }, []);

  // ✅ poll list for new student messages (badge + reorder)
 useEffect(() => {
  const t = setInterval(() => load(true), 5000); // ✅ silent polling
  return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const togglePin = async (id) => {
    await api.patch(`/support-tickets/${id}/pin`);
    load();
  };

  const toggleResolved = async (id) => {
    await api.patch(`/support-tickets/${id}/resolved`);
    load();
  };

  const filtered = useMemo(() => {
    return doubts
      .filter((d) => {
        const student = d.student?.name || "";
        const q = d.question || "";
        return (
          student.toLowerCase().includes(search.toLowerCase()) ||
          q.toLowerCase().includes(search.toLowerCase())
        );
      })
      // ✅ keep pinned first, but within pinned/unpinned sort newest message first
      .sort((a, b) => {
        const pinDiff = Number(b.pinned) - Number(a.pinned);
        if (pinDiff !== 0) return pinDiff;
        return new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt);
      });
  }, [search, doubts]);

  // grouping by today/yesterday/older (kept)
  const now = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const groups = {
    today: [],
    yesterday: [],
    older: [],
  };

  filtered.forEach((d) => {
    const dt = new Date(d.lastMessageAt || d.createdAt);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(dt, now)) groups.today.push(d);
    else if (isSameDay(dt, yesterday)) groups.yesterday.push(d);
    else groups.older.push(d);
  });

  const render = (label, arr) =>
    arr.length > 0 ? (
      <>
        <h3 className="text-xs uppercase text-[#5B7065] mt-2">{label}</h3>
        {arr.map((d) => (
          <QueryItem
            key={d._id}
            data={{
              student: d.student?.name || "Student",
              question: d.question,
              time: new Date(d.lastMessageAt || d.createdAt).toLocaleString(),
              pinned: !!d.pinned,
              resolved: !!d.resolved,
              unread: getUnreadForTicket(d), // ✅ now real unread
            }}
            selected={selectedId === d._id}
            onClick={() => {
              onSelect(d);
              markSeen(d._id); // ✅ open => mark as read
            }}
            onPin={() => togglePin(d._id)}
            onResolve={() => toggleResolved(d._id)}
          />
        ))}
      </>
    ) : null;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-[#124734]">Student Doubts</h2>
      <DoubtSearchBar value={search} onChange={setSearch} />

      {loading ? (
        <div className="text-sm text-[#5B7065]">Loading...</div>
      ) : (
        <>
          {render("Today", groups.today)}
          {render("Yesterday", groups.yesterday)}
          {render("Older", groups.older)}
          {filtered.length === 0 ? <div className="text-sm text-[#5B7065]">No doubts.</div> : null}
        </>
      )}
    </div>
  );
}

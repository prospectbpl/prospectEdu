import {
  ChevronDown,
  ChevronUp,
  Trash,
  Edit,
  Video as VideoIcon,
  FileText,
  Upload,
  Play,
  Check,
  X
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { uploadsApi } from "../../../services/uploads"; // adjust path
import { courseContentApi } from "../../../services/courseContent"; // adjust path

export default function ModuleCard({ module, index, viewOnly = false, onRefresh , onView})
{
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("video"); // 'video' or 'pdf'
  const [filePreview, setFilePreview] = useState(null); // { file, url, name }
  const [playUrl, setPlayUrl] = useState(null); // video url to play in modal
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title || "");

  const [savingModule, setSavingModule] = useState(false);
  const [deletingModule, setDeletingModule] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditTitle(module.title || "");
  }, [module.title]);
  useEffect(() => {
    return () => {
      // cleanup preview url on unmount
      if (filePreview?.url?.startsWith("blob:")) {
        try { URL.revokeObjectURL(filePreview.url); } catch {}
      }
    };
    // eslint-disable-next-line
  }, []);

  const saveModuleTitle = async () => {
    const nextTitle = editTitle.trim();
    if (!nextTitle) return alert("Module title is required");

    try {
      setSavingModule(true);
      await courseContentApi.updateModule(String(module._id), { title: nextTitle });
      setIsEditing(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to update module");
    } finally {
      setSavingModule(false);
    }
  };

  const deleteModule = async () => {
    const ok = window.confirm(
      `Delete "${module.title}"?\n\nThis will also delete all lessons inside this module.`
    );
    if (!ok) return;

    try {
      setDeletingModule(true);
      await courseContentApi.deleteModule(String(module._id));
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to delete module");
    } finally {
      setDeletingModule(false);
    }
  };


  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // revoke previous preview
    if (filePreview?.url?.startsWith("blob:")) {
      try { URL.revokeObjectURL(filePreview.url); } catch {}
    }
    const url = URL.createObjectURL(f);
    setFilePreview({ file: f, url, name: f.name });
  };
const isSubmittingRef = useRef(false);

const submitAddLesson = async () => {
  if (isSubmittingRef.current) return;
  isSubmittingRef.current = true;

  try {
    if (!lessonTitle.trim()) {
      alert("Enter lesson title");
      return;
    }
    const file = filePreview?.file;
    if (!file) {
      alert("Please choose a file to upload");
      return;
    }

    // 1) upload file to cloudinary via backend
    const up = await uploadsApi.uploadLessonFile(file);

    // 2) decide type
    const isVideo = file.type.startsWith("video/");
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const type = isVideo ? "video" : ext === "pdf" ? "pdf" : "doc";

    // 3) create lesson in DB
    await courseContentApi.createLesson(String(module._id), {
      title: lessonTitle.trim(),
      type,
      contentUrl: up.data.url,
      filePublicId: up.data.publicId,
      fileName: up.data.originalName,
      mimeType: up.data.mimeType,
      isPublished: true,
    });

    // 4) reset UI
    setLessonTitle("");
    setLessonType("video");
    setShowAddForm(false);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;

    // 5) refresh modules from DB
  if (onRefresh) await onRefresh();

  } catch (err) {
    console.log(err);
    alert(err?.response?.data?.message || "Failed to upload/create lesson");
  } finally {
    isSubmittingRef.current = false;
  }
};
const handleDeleteLesson = async (li) => {
  const lesson = module.lessons?.[li];
  if (!lesson?._id) return;

  const ok = window.confirm(`Delete lesson "${lesson.title}"?`);
  if (!ok) return;

  try {
    await courseContentApi.deleteLesson(String(lesson._id));
    if (onRefresh) await onRefresh();
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.message || "Failed to delete lesson");
  }
};


  return (
    <div className="border border-[#A7E1B2] rounded-xl p-4 bg-white shadow-sm">
      {/* Top Row */}
      <div
  className="flex justify-between items-center cursor-pointer"
  onClick={() => {
    if (!isEditing && onView) onView();
  }}
>
        <div
  className="cursor-pointer"
  onClick={() => {
    if (!isEditing && onView) onView();
  }}
>
  {isEditing ? (
    <input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      className="border border-[#A7E1B2] px-2 py-1 rounded-md text-[#124734] font-medium"
      autoFocus
      disabled={savingModule}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    <h3 className="text-lg font-semibold text-[#124734]">
      {module.title || `Module ${index + 1}`}
    </h3>
  )}

  <p className="text-sm text-[#5B7065]">
    {module.lessons?.length || 0} Lessons
  </p>
</div>

        <div className="flex items-center gap-3">
          {!viewOnly && (
            <>
              {isEditing ? (
                <>
                  <Check
                    size={20}
                    className={`cursor-pointer ${savingModule ? "opacity-50" : "text-green-600 hover:text-green-800"}`}
                   onClick={(e) => {
  e.stopPropagation();
  if (!savingModule) saveModuleTitle();
}}

                    title="Save"
                  />
                  <X
                    size={20}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                   onClick={(e) => {
  e.stopPropagation();
  setEditTitle(module.title || "");
  setIsEditing(false);
}}

                    title="Cancel"
                  />
                </>
              ) : (
               <Edit
  size={18}
  className="cursor-pointer text-[#124734] hover:text-[#009846]"
  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
/>
              )}

              <Trash
  size={18}
  className={`cursor-pointer ${deletingModule ? "opacity-50" : "text-red-500 hover:text-red-700"}`}
  onClick={(e) => { e.stopPropagation(); if (!deletingModule) deleteModule(); }}
/>
            </>
          )}

          {open ? (
            <ChevronUp size={22} className="cursor-pointer text-[#124734]"onClick={(e) => {
  e.stopPropagation();
  setOpen(false);
}}
 />
          ) : (
            <ChevronDown size={22} className="cursor-pointer text-[#124734]" onClick={(e) => {
  e.stopPropagation();
  setOpen(true);
}}
 />
          )}
        </div>
      </div>


      {/* Expanded content */}
      {open && (
        <div className="mt-4 pl-2 space-y-4">
          {/* Lessons List */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#124734] mb-2 flex items-center gap-2">
                <VideoIcon size={18} /> Lessons
              </h4>

              <button
                className="flex items-center gap-2 bg-[#009846] text-white px-3 py-1 rounded-md text-sm"
                onClick={(e) => {
  e.stopPropagation();
  setShowAddForm((s) => !s);
}}

              >
                <Upload size={14} /> Add Lesson
              </button>
            </div>

            {module.lessons?.length > 0 ? (
              <ul className="space-y-2">
                {module.lessons.map((lesson, li) => (
                  <li
                    key={li}
                    className="flex items-center justify-between text-sm text-[#5B7065] bg-[#F9FAFB] p-2 rounded border border-[#E6F4EC]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{lesson.type === "video" ? "🎥" : "📄"}</span>
                      <div>
                        <div className="font-medium text-[#124734]">{lesson.title}</div>
                        <div className="text-xs text-[#5B7065]">{lesson.fileName || ""}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {lesson.type === "video" ? (
                        <button
                          className="flex items-center gap-2 text-[#124734]"
                          onClick={() => setPlayUrl(lesson.contentUrl)}
                          title="Play video"
                        >
                          <Play size={16} />
                        </button>
                      ) : (
                        <a
                         href={lesson.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#124734] underline text-sm"
                        >
                          Open
                        </a>
                      )}

                      <Trash
                        size={16}
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        onClick={() => handleDeleteLesson(li)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#5B7065]">No lessons yet — add one.</p>
            )}
          </div>

          {/* Add Lesson Form (toggle) */}
          {showAddForm && (
            <div className="border border-[#E6F4EC] rounded-md p-3 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  className="col-span-2 border px-3 py-2 rounded-md"
                  placeholder="Lesson title (e.g. Introduction)"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                />

                <select
                  className="border px-3 py-2 rounded-md"
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">DOC / DOCX</option>
                </select>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <label className="cursor-pointer bg-[#124734] text-white px-3 py-2 rounded-md flex items-center gap-2">
                  <Upload size={14} />
                  Choose File
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
  lessonType === "video"
    ? "video/*"
    : lessonType === "pdf"
    ? "application/pdf"
    : ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

                    hidden
                    onChange={handleFileChange}
                  />
                </label>

                {/* preview */}
                {filePreview ? (
                  <div className="text-sm text-[#5B7065]">
                    <div className="font-medium">{filePreview.name}</div>
                    {lessonType === "video" ? (
                      <div className="mt-2">
                        <video src={filePreview.url} controls className="max-w-xs rounded" />
                      </div>
                    ) : (
                      <a href={filePreview.url} target="_blank" rel="noreferrer" className="text-sm underline">
                        Preview PDF
                      </a>
                    )}
                    <button
                      className="ml-3 text-red-600 text-sm"
                      onClick={() => {
                        try { URL.revokeObjectURL(filePreview.url); } catch {}
                        setFilePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = null;
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-[#5B7065]">No file selected</div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    // create preview if file selected
                    if (!filePreview) {
                      // try to read input directly (some browsers)
                      const f = fileInputRef.current?.files?.[0];
                      if (f) {
                        const url = URL.createObjectURL(f);
                        setFilePreview({ file: f, url, name: f.name });
                        return;
                      }
                      alert("Please select a file.");
                      return;
                    }
                    submitAddLesson();
                  }}
                  className="bg-[#009846] text-white px-4 py-2 rounded-md"
                >
                  Add Lesson
                </button>

                <button
                  onClick={() => {
                    // cleanup
                    if (filePreview?.url?.startsWith("blob:")) {
                      try { URL.revokeObjectURL(filePreview.url); } catch {}
                    }
                    setShowAddForm(false);
                    setLessonTitle("");
                    setLessonType("video");
                    setFilePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = null;
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Video Player Modal (simple overlay) */}
          {playUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white max-w-3xl w-full p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-[#124734]">Video Player</div>
                  <button
                    className="text-red-600"
                    onClick={() => {
                      // revoke if blob and then close
                      if (playUrl?.startsWith("blob:")) {
                        try { URL.revokeObjectURL(playUrl); } catch {}
                      }
                      setPlayUrl(null);
                    }}
                  >
                    Close
                  </button>
                </div>
                <video src={playUrl} controls className="w-full rounded" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

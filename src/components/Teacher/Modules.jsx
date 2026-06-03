import { useState, useCallback, useEffect } from "react";
import ModuleCard from "./CourseManagementPage/ModuleCard";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { courseContentApi } from "../../services/courseContent"; // ✅ CHANGED (adjust path)
import { useNavigate } from "react-router-dom";

export default function Modules({ course }) { // ✅ CHANGED
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ NEW
  const navigate = useNavigate();
  const courseId = course?._id; // ✅ NEW

  const reload = async () => { // ✅ NEW
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await courseContentApi.teacherModulesWithLessons(courseId);
      setModules(res.data.modules || []);
    } catch (e) {
      console.log(e);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { // ✅ NEW
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const addModule = async () => { // ✅ CHANGED
    if (!courseId) return;

    try {
      const payload = {
        title: `Module ${modules.length + 1}`,
        description: "",
        order: modules.length + 1,
        isPublished: true,
      };

      await courseContentApi.createModule(courseId, payload);
      await reload();
    } catch (e) {
      console.log(e);
      alert(e?.response?.data?.message || "Failed to create module");
    }
  };

  // Drag UI only (backend order save can be added later)
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    setModules((prev) => {
      const updated = Array.from(prev);
      const [movedItem] = updated.splice(sourceIndex, 1);
      updated.splice(destIndex, 0, movedItem);
      return updated;
    });
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#124734]">Modules</h2>

        <button
          onClick={addModule}
          className="flex items-center gap-2 bg-[#124734] text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Add Module
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="modules-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
             {loading ? (
  <p className="text-sm text-gray-500">Loading modules...</p>
) : modules.length === 0 ? (
  <p className="text-sm text-gray-500">
    No modules added yet. Click "Add Module" to start.
  </p>
) : (
  modules.map((mod, index) => (
    <Draggable key={mod._id} draggableId={String(mod._id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`transition ${
            snapshot.isDragging ? "shadow-lg border border-green-300" : ""
          }`}
        >
          <ModuleCard
            module={mod}
            index={index}
            onView={() => navigate(`/teacher/course/${courseId}/module/${mod._id}`)}
            onRename={async (newTitle) => {
              await courseContentApi.updateModule(mod._id, { title: newTitle });
              await reload();
            }}
            onDelete={async () => {
              await courseContentApi.deleteModule(mod._id);
              await reload();
            }}
             onRefresh={reload}
          />
        </div>
      )}
    </Draggable>
  ))
)}

{provided.placeholder}

            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

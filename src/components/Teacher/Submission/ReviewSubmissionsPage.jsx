import { useState } from "react";
import { FileText, FileCheck, ArrowRight } from "lucide-react";

export default function ReviewSubmissionsPage({ onBack, onOpenAssignment }) {
  const assignments = [
    {
      id: 1,
      title: "Data Structures Assignment 1",
      due: "2025-01-15",
      submissions: 12,
      type: "assignment",
    },
    {
      id: 2,
      title: "Quiz: Stack & Queue",
      due: "2025-01-20",
      submissions: 8,
      type: "quiz",
    },
  ];

  return (
    <div className="bg-white border border-[#A7E1B2] p-6 rounded-xl shadow-sm max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-[#124734]">
          Review Submissions
        </h2>

      </div>

      {/* List of Assignments */}
      <div className="space-y-4">
        {assignments.map((a) => (
          <div 
            key={a.id} 
            className="p-4 border border-[#A7E1B2] rounded-lg bg-[#F9FAFB] hover:shadow-sm transition cursor-pointer"
            onClick={() => onOpenAssignment(a.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-[#124734] flex items-center gap-2">
                  {a.type === "assignment" 
                    ? <FileText size={18} />
                    : <FileCheck size={18} />}
                  {a.title}
                </h3>

                <p className="text-sm text-[#5B7065]">
                  Due Date: <span className="text-[#124734]">{a.due}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[#124734] font-medium">
                  {a.submissions} submissions
                </span>

                <ArrowRight size={20} className="text-[#124734]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

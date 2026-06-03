// src/components/Teacher/EditProfile/SubjectCheckboxGroup.jsx

export default function SubjectCheckboxGroup({ title, options, selected, onToggle }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[#124734] mb-2">{title}</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-[#E6F4EC] p-4 rounded-lg bg-[#F9FAFB]">

        {options.map((subject) => (
          <label key={subject} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(subject)}
              onChange={() => onToggle(subject)}
            />
            <span className="text-[#124734] text-sm">{subject}</span>
          </label>
        ))}

      </div>
    </div>
  );
}

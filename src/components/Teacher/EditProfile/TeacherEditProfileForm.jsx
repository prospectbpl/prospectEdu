// src/components/Teacher/EditProfile/TeacherEditProfileForm.jsx

import {useEffect, useState } from "react";
import { getMyTeacherProfile, updateMyTeacherProfile } from "../../../services/teacherProfile";
import SubjectCheckboxGroup from "./SubjectCheckboxGroup";

export default function TeacherEditProfileForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    teacherId: "",
    department: "",
    designation: "",
    experience: "",
    qualification: "",
    subjects: [],
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject) => {
    setForm((prev) => {
      const exists = prev.subjects.includes(subject);
      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter((s) => s !== subject)
          : [...prev.subjects, subject],
      };
    });
  };
useEffect(() => {
  getMyTeacherProfile().then((res) => {
    const p = res.data.profile;
    setForm({
      fullName: p.fullName || "",
      email: p.email || "",
      phone: p.phone || "",
      teacherId: p.teacherId || "",
      department: p.department || "",
      designation: p.designation || "",
      experience: p.experience || "",
      qualification: p.qualification || "",
      subjects: p.subjects || [],
    });
  });
}, []);

  const submit = async (e) => {
  e.preventDefault();

  await updateMyTeacherProfile({
    fullName: form.fullName,
    phone: form.phone,
    teacherId: form.teacherId,
    department: form.department,
    designation: form.designation,
    experience: Number(form.experience),
    qualification: form.qualification,
    subjects: form.subjects,
  });

  alert("Profile updated successfully");
};


  return (
    <form
      onSubmit={submit}
      className="bg-white border border-[#E6F4EC] rounded-xl shadow-sm p-6 space-y-8"
    >

      {/* BASIC INFO */}
      <section>
        <h3 className="text-lg font-semibold text-[#124734] mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-[#5B7065]">Full Name</label>
            <input
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-[#5B7065]">Email</label>
           <input
  disabled
  className="w-full mt-1 border rounded-md p-2 bg-gray-100"
  value={form.email}
/>

          </div>

          <div>
            <label className="text-sm text-[#5B7065]">Mobile Number</label>
            <input
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

        </div>
      </section>

      {/* PROFESSIONAL DETAILS */}
      <section>
        <h3 className="text-lg font-semibold text-[#124734] mb-4">
          Professional Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-[#5B7065]">Teacher ID</label>
            <input
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.teacherId}
              onChange={(e) => update("teacherId", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-[#5B7065]">Department</label>
            <select
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
            >
              <option value="">Select</option>
              <option value="IT">IT</option>
              <option value="Law">Law</option>
              <option value="Management">Management</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[#5B7065]">Designation</label>
            <select
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="HOD">Head of Department</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[#5B7065]">Years of Experience</label>
            <input
              type="number"
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-[#5B7065]">Highest Qualification</label>
            <select
              className="w-full mt-1 border rounded-md p-2 outline-[#009846]"
              value={form.qualification}
              onChange={(e) => update("qualification", e.target.value)}
            >
              <option value="">Select</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="PhD">PhD</option>
              <option value="MBA">MBA</option>
              <option value="LLB">LLB</option>
              <option value="LLM">LLM</option>
            </select>
          </div>

        </div>
      </section>

      {/* SUBJECT CHECKBOX GROUPS */}
      <section>
        <h3 className="text-lg font-semibold text-[#124734] mb-4">
          Subjects You Teach
        </h3>

        <div className="space-y-6">

          <SubjectCheckboxGroup
            title="IT Subjects"
            options={[
              "Data Structures",
              "DBMS",
              "Operating Systems",
              "Computer Networks",
              "Java Programming",
              "Web Development",
              "Cyber Security",
              "Machine Learning",
            ]}
            selected={form.subjects}
            onToggle={handleSubjectToggle}
          />

          <SubjectCheckboxGroup
            title="Law Subjects"
            options={[
              "Constitutional Law",
              "Criminal Law",
              "Contract Law",
              "Tort Law",
              "Family Law",
              "Corporate Law",
              "IPR",
              "Cyber Law",
            ]}
            selected={form.subjects}
            onToggle={handleSubjectToggle}
          />

          <SubjectCheckboxGroup
            title="Management Subjects"
            options={[
              "Principles of Management",
              "Marketing Management",
              "HR Management",
              "Financial Accounting",
              "Organizational Behavior",
              "Business Law",
              "Operations Management",
              "Strategic Management",
            ]}
            selected={form.subjects}
            onToggle={handleSubjectToggle}
          />

          <SubjectCheckboxGroup
            title="Civil Engineering Subjects"
            options={[
              "Strength of Materials",
              "Fluid Mechanics",
              "Structural Analysis",
              "Concrete Technology",
              "Geotechnical Engineering",
              "Transportation Engineering",
              "Environmental Engineering",
              "Surveying",
            ]}
            selected={form.subjects}
            onToggle={handleSubjectToggle}
          />

        </div>
      </section>

      {/* BUTTONS */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          className="px-4 py-2 border rounded-md text-[#124734] hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-6 py-2 bg-[#009846] text-white rounded-md hover:bg-[#007a3a]"
        >
          Save Changes
        </button>
      </div>

    </form>
  );
}

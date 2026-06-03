import React, {useState} from "react";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../ui/ConfirmDialog";

export default function TeachersTable({ teachers }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const handleConfirmDelete = () => {
    console.log("Teacher removed:", selectedTeacher);
    setConfirmOpen(false);
  };
  return (
    <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left border-b text-gray-600">
            <th className="py-3 px-2">Profile</th>
            <th className="py-3 px-2 pl-12">Name</th>
            <th className="py-3 px-2 pl-8"  >Department</th>
            <th className="py-3 px-4 pl-12">Gender</th>
            <th className="py-3 px-4 pl-12">Education</th>
            <th className="py-3 px-4 pl-12">Mobile</th>
            <th className="py-3 px-4 pl-12">Email</th>
            <th className="py-3 px-4 pl-8">Joining Date</th>
            <th className="py-3 px-4 pl-4">Salary</th>
            <th className="py-3 px-4">Action</th>
            
          </tr>
        </thead>

        <tbody>
          {teachers.map((t, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <img
                  src={t.profile}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              </td>
              <td className="py-3 px-4">{t.name}</td>
              <td className="py-3 px-4">{t.department}</td>
              <td className="py-3 px-4">{t.gender}</td>
              <td className="py-3 px-4">{t.education}</td>
              <td className="py-3 px-4">{t.mobile}</td>
              <td className="py-3 px-4">{t.email}</td>
              <td className="py-3 px-4">{t.joining}</td>
              <td className="py-3 px-4">{t.salary}</td>
              <td className="py-3 px-4 flex gap-3">
                <button
    onClick={() => navigate("/admin/teachers/edit")}
    className="text-green-600 hover:text-green-800"
  >
    <FiEdit2 size={18} />
  </button>
                <button
                  onClick={() => {
                    setSelectedTeacher(t);
                    setConfirmOpen(true);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <RiDeleteBin6Line size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
         <ConfirmDialog
        open={confirmOpen}
        title="Remove Teacher"
        message={`Are you sure you want to remove ${selectedTeacher?.name}?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

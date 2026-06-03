import React, { useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function AddFeesForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roll || !name || !amount) {
      showToast("Please fill all required fields!", "error");
      return;
    }

    showToast("Fees added successfully!", "success");

    setTimeout(() => {
      navigate("/admin/fees/collection");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Your fields here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Roll No */}
  <div className="flex flex-col">
    <label className="font-medium text-gray-700 mb-1">Roll No.</label>
    <input
      type="text"
      value={roll}
      onChange={(e) => setRoll(e.target.value)}
      placeholder="Roll No"
      className="border border-gray-300 rounded-lg px-4 py-2"
    />
  </div>

  {/* Student Name */}
  <div className="flex flex-col">
    <label className="font-medium text-gray-700 mb-1">Student Name</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Student Name"
      className="border border-gray-300 rounded-lg px-4 py-2"
    />
  </div>

  {/* Fees Type */}
  <div className="flex flex-col">
    <label className="font-medium text-gray-700 mb-1">Fees Type</label>
    <select className="border border-gray-300 rounded-lg px-4 py-2">
      <option>Select Type</option>
      <option>Library</option>
      <option>Tuition</option>
      <option>Annual</option>
    </select>
  </div>

  {/* Payment Type */}
  <div className="flex flex-col">
    <label className="font-medium text-gray-700 mb-1">Payment Type</label>
    <select className="border border-gray-300 rounded-lg px-4 py-2">
      <option>Select Payment Type</option>
      <option>Cash</option>
      <option>Credit Card</option>
      <option>Cheque</option>
    </select>
  </div>

  {/* Amount */}
  <div className="flex flex-col col-span-1 md:col-span-2">
    <label className="font-medium text-gray-700 mb-1">Amount</label>
    <input
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="Enter Amount"
      className="border border-gray-300 rounded-lg px-4 py-2"
    />
  </div>

  {/* Collection Date */}
  <div className="flex flex-col">
    <label className="font-medium text-gray-700 mb-1">Collection Date</label>
    <input
      type="date"
      className="border border-gray-300 rounded-lg px-4 py-2"
    />
  </div>

  {/* Status */}
  <div className="flex flex-col">
    <label className="font-medium text-gray-700 mb-1">Status</label>
    <select className="border border-gray-300 rounded-lg px-4 py-2">
      <option>Paid</option>
      <option>Pending</option>
      <option>Unpaid</option>
    </select>
  </div>

  {/* Payment Reference No */}
  <div className="flex flex-col col-span-1 md:col-span-2">
    <label className="font-medium text-gray-700 mb-1">
      Payment Reference Number
    </label>
    <input
      type="text"
      className="border border-gray-300 rounded-lg px-4 py-2"
      placeholder="Reference No"
    />
  </div>

  {/* Payment Details */}
  <div className="flex flex-col col-span-1 md:col-span-2">
    <label className="font-medium text-gray-700 mb-1">Payment Details</label>
    <textarea
      rows={3}
      className="border border-gray-300 rounded-lg px-4 py-2"
      placeholder="Payment details..."
    ></textarea>
  </div>

</div>

      <button
        type="submit"
        className="bg-[#124734] text-white px-6 py-2 rounded-md hover:bg-[#0E3A2B] transition"
      >
        Submit
      </button>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="bg-red-400 text-white px-6 py-2 rounded-md hover:bg-red-500 transition ml-3"
      >
        Cancel
      </button>

    </form>
  );
}

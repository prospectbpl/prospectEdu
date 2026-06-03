import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar";
import AdminTopbar from "../../components/Admin/Layout/AdminTopbar";

export default function FeesReceiptPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <div className="flex bg-[#F9FAFB] h-screen">

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* MAIN AREA */}
      <div
        className="flex-1 transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100vw - ${sidebarWidth}px)`,
        }}
      >
        {/* TOPBAR */}
        <div
          className="fixed top-0 bg-white shadow-sm h-[64px] flex items-center z-[999]"
          style={{ left: sidebarWidth, right: 0 }}
        >
          <AdminTopbar pageTitle="Fees Receipt" />
        </div>

        {/* MAIN CONTENT */}
        <div className="px-6 pt-[90px] pb-10 overflow-y-auto">

          {/* Breadcrumb */}
          <div className="w-full flex flex-col items-start ">
          <div className="text-gray-600 text-sm mb-4">
            <span
              className="cursor-pointer hover:text-[#124734]"
              onClick={() => navigate("/admin-dashboard")}
            >
              Dashboard
            </span>
            {" / "}
            <span
              className="cursor-pointer hover:text-[#124734]"
              onClick={() => navigate("/admin/fees/collection")}
            >
              Fees Collection
            </span>
            {" / "}
            <span className="text-[#124734] font-semibold">
              Receipt {receiptId}
            </span>
          </div>
          </div>

          {/* RECEIPT CARD */}
          <div className="bg-white shadow rounded-xl p-10">

            {/* TOP BAR */}
            <div className="flex justify-between text-gray-700">
              <h1 className="text-2xl font-semibold">Invoice</h1>
              <div className="text-sm">
                <p className="font-semibold">Status: Pending</p>
                <p className="text-gray-500">Date: 01/12/2023</p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex justify-between mt-10">
              <div>
                <h2 className="font-semibold text-gray-800 mb-2">From:</h2>
                <p className="text-gray-600">Webz Poland</p>
                <p className="text-gray-600">Madalinskiego 8</p>
                <p className="text-gray-600">#8901 Mormora Road Chi Minh City</p>
                <p className="text-gray-600">Email: info@example.com</p>
                <p className="text-gray-600">Phone: +01 123 456 7890</p>
              </div>

              <div>
                <h2 className="font-semibold text-gray-800 mb-2">To:</h2>
                <p className="text-gray-600">Bob Mart</p>
                <p className="text-gray-600">Attn: Daniel Marek</p>
                <p className="text-gray-600">#8901 Mormora Road Chi Minh City</p>
                <p className="text-gray-600">Email: info@example.com</p>
                <p className="text-gray-600">Phone: +02 987 654 3210</p>
              </div>
            </div>

            {/* TABLE */}
            <div className="mt-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">#</th>
                    <th className="p-3">Fees Type</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b">
                    <td className="p-3">1</td>
                    <td className="p-3">Annual Fees</td>
                    <td className="p-3">Monthly</td>
                    <td className="p-3">#54620</td>
                    <td className="p-3">8 August 2021</td>
                    <td className="p-3">$999.00</td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-3">2</td>
                    <td className="p-3">Annual Fees</td>
                    <td className="p-3">Yearly</td>
                    <td className="p-3">#54310</td>
                    <td className="p-3">7 August 2021</td>
                    <td className="p-3">$3000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="mt-10 flex justify-end">
              <div className="text-right text-gray-700 space-y-2">
                <p>Subtotal: <strong>$8,497.00</strong></p>
                <p>Discount (20%): <strong>$1,699.40</strong></p>
                <p>VAT (10%): <strong>$679.76</strong></p>
                <p className="text-xl font-semibold mt-2">
                  Total: <span className="text-[#124734]">$7,477.36</span>
                </p>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-10 flex gap-4">
              <button className="bg-[#124734] text-white px-6 py-2 rounded-md">
                Proceed to Payment
              </button>
              <button
                className="bg-gray-200 px-6 py-2 rounded-md"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

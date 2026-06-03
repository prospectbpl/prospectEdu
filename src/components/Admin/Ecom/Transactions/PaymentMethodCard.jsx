import React from "react";
import { FiMoreHorizontal } from "react-icons/fi";

export default function PaymentMethodCard() {
  return (
    <div className="bg-white p-6 rounded-xl shadow border border-[#A7E1B2] 
                    flex flex-col gap-4 w-[580px] h-[340px]">

      {/* Header + 3-dot menu */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#124734]">Payment Method</h2>
        <FiMoreHorizontal className="text-gray-500 cursor-pointer" />
      </div>

      {/* Green Card */}
      <div className="bg-gradient-to-br from-green-600 to-teal-400 text-white 
                      rounded-xl p-5 flex justify-between">

        <div>
          <p className="text-sm">Finaci</p>
          <h3 className="text-xl font-semibold tracking-widest">•••• •••• •••• 2345</h3>

          <p className="text-sm mt-3">Card Holder: Noman Mansoor</p>
          <p className="text-sm">Expiry: 02/30</p>
        </div>

        <div className="text-sm space-y-1 mt-2 text-right">
          <p>Status: <span className="text-green-200 font-medium">Active</span></p>
          <p>Transactions: 1,250</p>
          <p>Revenue: $50,000</p>
          <button className="underline text-white text-sm">View Transactions</button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button className="px-6 py-2 border rounded-md text-[#124734] border-[#124734]">
          Add Card
        </button>

        <button className="px-6 py-2 bg-red-100 text-red-600 rounded-md">
          Deactivate
        </button>
      </div>
    </div>
  );
}

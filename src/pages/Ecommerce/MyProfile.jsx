/* --- RESPONSIVE MyProfile.jsx (same layout, only SEO + perf updated) --- */

import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import EcomHeader from "../../components/EcomHeader";
import locationIcon from "../../assets/location.webp";
import Footer from "../../components/Footer";
import { useAddress } from "../../context/AddressContext";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : location.pathname;

  const breadcrumbJsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Profile",
          item: canonicalUrl,
        },
      ],
    };
  }, [canonicalUrl]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { addresses, addAddress, removeAddress, fetchAddresses } = useAddress();

  const [newAddress, setNewAddress] = useState({
    name: user?.fullName || user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setNewAddress((prev) => ({
      ...prev,
      name: prev.name || user?.fullName || user?.name || "",
      phone: prev.phone || user?.phone || "",
      email: prev.email || user?.email || "",
    }));
  }, [user]);

  const saveAddress = async () => {
    try {
      const payload = {
        name: newAddress.name,
        phone: newAddress.phone,
        email: newAddress.email,
        address: newAddress.address,
        city: newAddress.city,
        pincode: newAddress.pincode,
        state: newAddress.state,
        country: newAddress.country,
      };

      if (editingId) {
        await removeAddress(editingId);
        await addAddress(payload);
        setEditingId(null);
      } else {
        await addAddress(payload);
      }

      await fetchAddresses();

      setShowForm(false);

      setNewAddress({
        name: user?.fullName || user?.name || "User",
        phone: user?.phone || "",
        email: user?.email || "",
        address: "",
        city: "",
        pincode: "",
        state: "",
        country: "India",
      });
    } catch (err) {
      console.log("Save address error:", err);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await removeAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.log("Delete address error:", err);
    }
  };

  return (
    <section className=" pt-36">
      <Helmet>
        <title>My Profile | ProspectEdu</title>
        <meta
          name="description"
          content="Manage your ProspectEdu profile details and saved addresses securely."
        />
        <link rel="canonical" href={canonicalUrl} />
        {/* private page - prevent indexing */}
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <EcomHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 font-[Open_Sans] pb-20 text-left">
        {/* Breadcrumb */}
        <p className="text-gray-600 mb-5 text-sm md:text-base">
          <span
            className="cursor-pointer text-[#124734] hover:underline"
            onClick={() => navigate("/ecommerce-home")}
          >
            Home
          </span>{" "}
          &gt; Profile
        </p>

        {/* Main Box */}
        <div className="bg-white shadow-md rounded-xl p-5 md:p-10 border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-[#124734] mb-6">
            Welcome {user?.fullName || user?.name || "User"}
          </h1>

          {/* Phone & Email */}
          <div className="flex flex-col md:flex-row md:items-center text-lg mb-8 gap-3 md:gap-20">
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {user?.phone ? `+91 ${user.phone}` : "-"}
            </p>

            <p>
              <span className="font-semibold">Email:</span> {user?.email || "-"}
            </p>
          </div>

          {/* Saved Address */}
          <p className="text-gray-700 font-semibold mb-3">Saved Address :</p>

          {addresses.map((addr) => (
            <div
              key={addr._id || addr.id}
              className="bg-[#A7E1B2] p-4 md:p-6 rounded-xl flex flex-col md:flex-row justify-between gap-4 border border-[#A7E1B2] mb-5"
            >
              {/* LEFT */}
              <div className="flex gap-3">
                <img
                  src={locationIcon}
                  className="w-10 h-10"
                  alt="Location icon"
                  loading="lazy"
                  decoding="async"
                />

                <div>
                  <h3 className="text-lg font-semibold text-[#124734]">
                    {addr.name}
                  </h3>

                  <p className="text-gray-700 text-sm mt-1">
                    {addr.phone}, {addr.email}
                    <br />
                    {addr.address}, {addr.city}, {addr.state}, {addr.country}
                  </p>

                  <p className="text-gray-800 font-medium mt-2">
                    Pincode : {addr.pincode}
                  </p>
                </div>
              </div>

              {/* RIGHT (Buttons) */}
              <div className="flex items-center gap-4 self-end md:self-center">
                <button
                  onClick={() => {
                    setEditingId(addr._id || addr.id);
                    setShowForm(true);
                    setNewAddress({
                      name: addr.name,
                      phone: addr.phone,
                      email: addr.email,
                      address: addr.address,
                      city: addr.city,
                      pincode: addr.pincode,
                      state: addr.state,
                      country: addr.country,
                    });
                  }}
                  className="text-[#124734] hover:text-black"
                  aria-label="Edit address"
                >
                  <FiEdit2 size={20} />
                </button>

                <button
                  onClick={() => deleteAddress(addr._id || addr.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Delete address"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Address Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
              }}
              className="bg-[#124734] text-white px-4 md:px-6 py-3 rounded-lg font-semibold hover:bg-[#0f3a23] w-full md:w-auto"
            >
              {showForm ? "Close Address Form" : "Add New Address"}
            </button>
          </div>

          {/* Address Form */}
          {showForm && (
            <div className="mt-10 bg-white shadow-md p-6 md:p-8 rounded-xl border">
              <h2 className="text-xl font-bold text-[#124734] mb-6">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>

              {/* Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="font-semibold">* Contact Name</label>
                  <input
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                    className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                  />
                </div>

                <div>
                  <label className="font-semibold">* Contact Number</label>
                  <input
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="font-semibold">* Email</label>
                <input
                  value={newAddress.email}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, email: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="font-semibold">* Address</label>
                <textarea
                  rows="3"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                ></textarea>
              </div>

              {/* City + Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="font-semibold">* City</label>
                  <input
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                  />
                </div>

                <div>
                  <label className="font-semibold">* Pincode</label>
                  <input
                    value={newAddress.pincode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, pincode: e.target.value })
                    }
                    className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                  />
                </div>
              </div>

              {/* State */}
              <div className="mb-6">
                <label className="font-semibold">* State</label>
                <input
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                />
              </div>

              {/* Country */}
              <div className="mb-6">
                <label className="font-semibold">Country</label>
                <input
                  value="India"
                  readOnly
                  className="w-full border rounded-lg p-3 mt-2 outline-[#124734]"
                />
              </div>

              {/* Save */}
              <button
                onClick={saveAddress}
                className="bg-[#124734] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0d3a25] w-full md:w-auto"
              >
                {editingId ? "Update Address" : "Save Address"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-10">
        <Footer />
      </div>
    </section>
  );
};

export default MyProfile;

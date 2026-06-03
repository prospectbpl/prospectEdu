import React, { useState } from "react";
import { api } from "../lib/api"; // ✅ adjust path if needed

const ContactUs = () => {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "Payment Related Issue",
    message: "",
  });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  const isPhone10 = (v) => /^[0-9]{10}$/.test(String(v || "").trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Name required");
    if (!isEmail(form.email)) return alert("Valid email required");
    if (!isPhone10(form.phone)) return alert("Valid 10 digit phone required");
    if (!form.issue.trim()) return alert("Issue required");
    if (!form.message.trim()) return alert("Message required");

    setSaving(true);
    try {
      await api.post("/contacts", form);
      alert("✅ Your request has been submitted successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        issue: "Payment Related Issue",
        message: "",
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit contact request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-8 py-20 font-[Open_Sans,sans-serif] text-[#124734]">
      <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
      <div className="h-[4px] w-44 bg-[#A7E1B2] mb-12"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#A7E1B2] p-10 text-[#124734]">
          <h3 className="text-2xl font-bold mb-2">Let's Talk with Us</h3>
          <p className="text-gray-700 mb-8">Get free academic counseling & course details.</p>

          <h4 className="text-lg font-semibold mb-4">Contact Info :</h4>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📞</span>
            <p className="text-gray-800">Phone Number: 9752812898</p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">✉️</span>
            <p className="text-gray-800">For Courses Related Queries: prospectbpl@gmail.com</p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📍</span>
            <p className="text-gray-800">
              Address: Prospect Education & Social Welfare Society, R-52, First Floor, Zone-1,
              MP Nagar, Near Shree Vatika, Bhopal (M.P.)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">⏰</span>
            <p className="text-gray-800">Hours of Operation: Monday – Saturday: 10:00am – 7:00pm</p>
          </div>
        </div>

        <div className="bg-[#F9FAFB] p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Name"
              autoComplete="name"
              aria-label="Your full name"
              className="w-full p-3 border rounded-lg bg-white outline-[#1E5631]"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email Address"
              autoComplete="email"
              aria-label="Your email address"
              className="w-full p-3 border rounded-lg bg-white outline-[#1E5631]"
            />

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Phone Number"
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              aria-label="Your phone number"
              className="w-full p-3 border rounded-lg bg-white outline-[#1E5631]"
            />

            <select
              name="issue"
              value={form.issue}
              onChange={onChange}
              aria-label="Select issue type"
              className="w-full p-3 border rounded-lg bg-white outline-[#1E5631]"
            >
              <option>Payment Related Issue</option>
              <option>PDF/Video related issue</option>
              <option>Books and E-commerce Store</option>
              <option>Application/Web/Account Related Issue</option>
              <option>Feedback</option>
              <option>Other Query</option>
            </select>

            <textarea
              rows="4"
              name="message"
              value={form.message}
              onChange={onChange}
              placeholder="Write Your Message"
              aria-label="Your message"
              className="w-full p-3 border rounded-lg bg-white outline-[#1E5631]"
            ></textarea>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#1E5631] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#144923] transition disabled:opacity-60"
            >
              {saving ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;

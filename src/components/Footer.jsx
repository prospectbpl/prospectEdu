import { Mail, MapPin, Phone } from "lucide-react";
import logo from "../assets/logo.png.webp";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#124734] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand + Address */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-4">
            <img
              src={logo}
              alt="ProspectEdu – Career Focused E-Learning Platform"
              className="h-12 w-auto"
              loading="lazy"
            />
            <span className="text-2xl font-heading font-semibold text-[#A7E1B2]">
              ProspectEdu
            </span>
          </Link>

          <address className="not-italic text-sm text-[#F9FAFB] leading-relaxed">
            ProspectEdu Learning <br />
            R-52, First Floor, Chetak Bridge, <br />
            Near Hotel Shree Vatika, Zone-1, <br />
            MP Nagar, Bhopal, Madhya Pradesh 462003
          </address>

          <div className="mt-4 flex flex-col gap-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-[#A7E1B2]" aria-hidden="true" />
              India’s Trusted E-Learning Platform
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-[#A7E1B2]" aria-hidden="true" />
              <a href="mailto:enquiry@prospectedu.in" className="hover:text-[#A7E1B2]">
                enquiry@prospectedu.in
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-[#A7E1B2]" aria-hidden="true" />
              <a href="tel:+919876543210" className="hover:text-[#A7E1B2]">
                +91 98765 43210
              </a>
            </p>
          </div>
        </div>

        {/* Company Links */}
        <nav aria-label="Company information">
          <h3 className="text-lg font-semibold text-[#A7E1B2] mb-3">
            Company
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about-us" className="hover:text-[#A7E1B2]">About Us</Link></li>
            <li><Link to="/contact-us" className="hover:text-[#A7E1B2]">Contact-Us</Link></li>
            <li><Link to="/career" className="hover:text-[#A7E1B2]">Careers</Link></li>
            <li><Link to="/blog" className="hover:text-[#A7E1B2]">Blog</Link></li>
           
          </ul>
        </nav>

        {/* Popular Courses */}
        <nav aria-label="Popular career courses">
          <h3 className="text-lg font-semibold text-[#A7E1B2] mb-3">
            Popular Career Courses
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/categories/engineering" className="hover:text-[#A7E1B2]">Engineering Courses</Link></li>
            <li><Link to="/categories/law" className="hover:text-[#A7E1B2]">Law Courses</Link></li>
            <li><Link to="/categories/management" className="hover:text-[#A7E1B2]">Management Courses</Link></li>
          </ul>
        </nav>

        {/* Resources */}
        <nav aria-label="Learning resources">
          <h3 className="text-lg font-semibold text-[#A7E1B2] mb-3">
            Learning Resources
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/ecommerce-home" className="hover:text-[#A7E1B2]">Ecommerce</Link></li>
            <li><Link to="/scholarship" className="hover:text-[#A7E1B2]">Scholarships</Link></li>
            <li><Link to="/research-report" className="hover:text-[#A7E1B2]">Research</Link></li>
            <li><Link to="/ask-doubt" className="hover:text-[#A7E1B2]">Ask Doubt</Link></li>
            <li><Link to="/news" className="hover:text-[#A7E1B2]">News & Updates</Link></li>
            <li><Link to="/donate" className="hover:text-[#A7E1B2]">Donate</Link></li>
             <li><Link to="/achievers" className="hover:text-[#A7E1B2]">Achievers</Link></li>

          </ul>
        </nav>
      </div>

      {/* Divider */}
      <div className="border-t border-[#A7E1B2]/30 my-6 mx-8"></div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#F9FAFB]/90">
        <p>© {new Date().getFullYear()} ProspectEdu. All rights reserved.</p>

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="#" aria-label="ProspectEdu on Facebook" className="hover:scale-110 transition">
            <i className="fab fa-facebook text-[#A7E1B2] text-xl" aria-hidden="true"></i>
          </a>
          <a href="#" aria-label="ProspectEdu on Twitter" className="hover:scale-110 transition">
            <i className="fab fa-x-twitter text-[#A7E1B2] text-xl" aria-hidden="true"></i>
          </a>
          <a href="#" aria-label="ProspectEdu on Instagram" className="hover:scale-110 transition">
            <i className="fab fa-instagram text-[#A7E1B2] text-xl" aria-hidden="true"></i>
          </a>
          <a href="#" aria-label="ProspectEdu on LinkedIn" className="hover:scale-110 transition">
            <i className="fab fa-linkedin text-[#A7E1B2] text-xl" aria-hidden="true"></i>
          </a>
          <a href="#" aria-label="ProspectEdu on YouTube" className="hover:scale-110 transition">
            <i className="fab fa-youtube text-[#A7E1B2] text-xl" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

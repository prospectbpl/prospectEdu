import itIcon from "../assets/it.webp";
import lawIcon from "../assets/law.webp";
import electricalIcon from "../assets/electrical.webp";
import medicalIcon from "../assets/medical.webp";
import { Link } from "react-router-dom";

export default function CategorySection() {
  const categories = [
    {
      title: "Engineering",
      icon: itIcon,
      description: "Explore programming and software courses.",
      path: "/categories/engineering",
    },
    {
      title: "Law",
      icon: lawIcon,
      description: "Understand the principles of law and legal studies.",
      path: "/categories/law",
    },
    {
      title: "Management",
      icon: electricalIcon,
      description: "Dive into power systems and Management.",
      path: "/categories/management",
    },
    {
      title: "Medical",
      icon: medicalIcon,
      description: "Understand how the human body works.",
      path: "/categories/medical",
    },
  ];

  return (
    <section className="w-full bg-[#F9FAFB] py-16" aria-labelledby="category-heading">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Section Heading */}
        <h2 id="category-heading" className="text-3xl font-heading font-semibold text-[#124734] mb-10">
          Categories
        </h2>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <article
              key={i}
              className="bg-white border border-[#A7E1B2] rounded-xl p-8 shadow-sm hover:shadow-md 
                         transition-all duration-300 hover:scale-[1.03] group"
            >
              <div className="flex flex-col items-center text-center">

                {/* Icon */}
                <img
                  src={cat.icon}
                  alt={`${cat.title} Category Icon`}
                  loading="lazy"
                  width="64"
                  height="64"
                  className="w-16 h-16 mb-4 object-contain group-hover:scale-110 transition-transform duration-300"
                />

                {/* Title */}
                <h3 className="font-heading text-xl font-semibold text-[#124734] mb-2">
                  {cat.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#5B7065] font-body">
                  {cat.description}
                </p>

                {/* Button */}
                <Link
                  to={cat.path}
                  aria-label={`Explore ${cat.title} Courses`}
                  className="mt-5 px-5 py-2 rounded-full border border-[#009846] 
                             text-[#009846] text-sm font-medium hover:bg-[#009846] 
                             hover:text-white transition"
                >
                  Explore
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

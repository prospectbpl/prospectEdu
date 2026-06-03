import banner from "../assets/banner.webp";
export default function HomeBanner() {
  return (
    <section
      className="
        relative w-full 
        h-[50vh] sm:h-[60vh] md:h-[80vh]   /* Responsive heights only */
        bg-cover bg-center 
        flex items-center justify-center
      "
      style={{
        backgroundImage: `url(${banner})`,
      }}
    >
      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-[#124734]/40"></div>

      <div className="relative z-10 text-center text-white px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-3 sm:mb-4">
          Empowering Education for Every Child
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-body px-2">
          Together we build a future full of hope, learning, and opportunity.
        </p>
      </div>
    </section>
  );
}

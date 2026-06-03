import appStore from "../assets/app-store-badge.webp";
import playStore from "../assets/google-play-badge.webp";

export default function MobileCTA() {
  return (
    <section className="w-full bg-[#F9FAFB] py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
        
        {/* Left: Text */}
        <div className="text-left lg:pl-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#124734] leading-tight">
            The most trusted learning <br className="hidden md:block" /> platform on your phone
          </h2>

          <p className="mt-6 text-[#5B7065] max-w-xl">
            With our training programs, learning online can be a very exciting experience! 
            Take the next step toward achieving your professional and personal objectives — 
            learn on the go with ProspectEdu.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <a
              href="#"
              className="inline-block transform hover:scale-105 transition"
              aria-label="Download on the App Store"
            >
              <img src={appStore} alt="App Store" className="h-30" />
            </a>

            <a
              href="#"
              className="inline-block transform hover:scale-105 transition"
              aria-label="Get it on Google Play"
            >
              <img src={playStore} alt="Google Play" className="h-12" />
            </a>
          </div>
        </div>

        {/* Right: Placeholder graphic */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-64 h-96 md:w-72 md:h-[28rem] bg-white rounded-3xl shadow-lg flex items-center justify-center">
            <div className="w-24 h-48 bg-[#A7E1B2]/40 rounded-lg" />
          </div>
        </div>

      </div>
    </section>
  );
}

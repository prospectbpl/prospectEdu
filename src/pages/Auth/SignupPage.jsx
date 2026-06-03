import { useLocation } from "react-router-dom";
import SignupForm from "../../components/Signup/SignupForm";
import SignupIllustration from "../../components/Signup/SignupIllustration";
import { Helmet } from "react-helmet-async";

export default function SignupPage() {
  const location = useLocation();
  const role = location.state?.role || "Learner"; // default

  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/signup`;

  const pageTitle = `Signup as ${role} | ProspectEdu`;
  const pageDescription =
    "Create your ProspectEdu account to access courses, tests, study materials, and learning dashboards.";

  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Auth pages should NOT be indexed */}
        <meta name="robots" content="noindex, follow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Left Illustration */}
      <SignupIllustration />

      {/* Right Form */}
      <div className="flex flex-col justify-center items-center bg-white px-10 py-16">
        <div className="max-w-md w-full">
          <img
            src="/src/assets/logo.png.webp"
            alt="ProspectEdu Logo"
            className="h-12 mb-4 mx-auto"
            loading="lazy"
            decoding="async"
          />

          {/* ✅ Hidden H1 for SEO without UI impact */}
          <h1 className="sr-only">Create your ProspectEdu account</h1>

          <h2 className="text-2xl font-heading text-[#124734] text-center mb-6">
            Register as {role}
          </h2>

          <SignupForm />
        </div>
      </div>
    </section>
  );
}

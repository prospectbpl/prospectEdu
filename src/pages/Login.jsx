import logo from "../assets/logo.png.webp";
import loginIllustration from "../assets/login-illustration.webp";
import AuthIllustration from "../components/Auth/AuthIllustration";
import LoginForm from "../components/Auth/LoginForm";
import { Helmet } from "react-helmet-async";

export default function Login() {
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
  const canonicalUrl = `${SITE_URL}/login`;

  const pageTitle = "Login | ProspectEdu";
  const pageDescription =
    "Login to ProspectEdu to access your courses, tests, study materials, and dashboard.";

  return (
    <main className="min-h-screen bg-[#F9FAFB]" aria-labelledby="login-page-heading">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ✅ Auth pages should NOT be indexed */}
        <meta name="robots" content="noindex, follow" />

        {/* Social preview (safe even if noindex) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* ✅ SEO H1 (hidden, no UI impact) */}
      <h1 id="login-page-heading" className="sr-only">
        Login to ProspectEdu
      </h1>

      <section className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Illustration */}
        <AuthIllustration
          image={loginIllustration}
          title="Login to access the courses and materials"
          description="Create your account to access courses, tests, and study materials with ease."
        />

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 bg-white shadow-sm">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img
                src={logo}
                alt="ProspectEdu – Online Learning Platform"
                className="h-12 w-auto"
                loading="lazy"
                decoding="async"
              />
              <h2 className="text-2xl font-heading font-semibold text-[#124734]">
                ProspectEdu
              </h2>
            </div>

            {/* Form */}
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}

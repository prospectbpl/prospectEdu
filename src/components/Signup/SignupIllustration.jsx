export default function SignupIllustration() {
  return (
    <aside
      className="flex flex-col justify-center items-center bg-[#F9FAFB] text-center px-6 py-12"
      aria-labelledby="signup-illustration-heading"
    >
      <img
        src="/src/assets/login-illustration.webp"
        alt="ProspectEdu signup illustration showing online learning"
        loading="lazy"
        width="320"
        height="320"
        className="w-3/4 max-w-sm mb-6"
      />

      <h3
        id="signup-illustration-heading"
        className="text-xl font-semibold text-[#124734]"
      >
        Login to access the courses and materials
      </h3>

      <p className="mt-3 text-[#5B7065] text-sm max-w-md">
        Create an account to access courses, tests, and study materials with ease.
      </p>
    </aside>
  );
}

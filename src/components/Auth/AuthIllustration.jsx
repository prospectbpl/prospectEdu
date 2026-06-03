export default function AuthIllustration({ image, title, description }) {
  return (
    <aside
      className="hidden lg:flex w-1/2 bg-[#E8F5E9] items-center justify-center p-10"
      aria-labelledby="auth-illustration-heading"
    >
      <div className="max-w-md text-center">
        <img
          src={image}
          alt={title}
          loading="lazy"
          width="320"
          height="320"
          className="w-80 mx-auto mb-6"
        />

        <h2
          id="auth-illustration-heading"
          className="text-2xl font-heading font-semibold text-[#124734] mb-3"
        >
          {title}
        </h2>

        <p className="text-[#5B7065] text-sm">
          {description}
        </p>
      </div>
    </aside>
  );
}

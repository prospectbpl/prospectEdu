import RoleCard from "./RoleCard";
import { useNavigate } from "react-router-dom";
import dashboardBanner from "../../assets/dashboard-banner.webp";

export default function DashboardSelection() {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    navigate("/signup", { state: { role } });
  };

  const roles = [
    { title: "I'm a Learner", color: "#A7E1B2" },
    { title: "I'm a Teacher", color: "#A7E1B2" },
    { title: "I'm a Parent/Organisation", color: "#A7E1B2" },
    { title: "I'm an Admin", color: "#A7E1B2" },
  ];

  return (
    <section
      id="dashboard"
      className="w-full bg-[#FFFFFF] py-20"
      aria-labelledby="dashboard-heading"
    >
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Article for meaning */}
        <article className="flex flex-col items-center text-center">

<img
  src={dashboardBanner}
  alt="Learning Illustration"
  width="500"
  height="400"
  className="w-3/4 md:w-2/3 mx-auto"
  loading="lazy"
/>

          <h3 className="font-heading text-lg font-semibold mt-8 text-[#124734]">
            Did you know?
          </h3>

          <p className="mt-2 text-[#5B7065] text-sm max-w-md font-body">
            Regardless of who you are, mastering just one more skill with
            ProspectEdu can open doors to endless learning opportunities.
          </p>
        </article>

        <div>
          <h2 className="text-3xl font-heading font-semibold text-[#124734] mb-6" id="dashboard-heading">
            Login as
          </h2>

          <div className="flex flex-col gap-4">
            {roles.map((role, i) => (
              <RoleCard
                key={i}
                title={role.title}
                color={role.color}
                aria-label={`Login as ${role.title}`}
                onClick={() => handleRoleClick(role.title)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

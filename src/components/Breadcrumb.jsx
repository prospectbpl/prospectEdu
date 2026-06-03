import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * items example:
 * [
 *   { label: "Dashboard", to: "/teacher-dashboard" },
 *   { label: "Student Overall Performance" }
 * ]
 */
const Breadcrumb = ({
  items = [],
  className = "",
  textClassName = "text-sm text-[#5B7065]",
  linkClassName = "hover:text-[#009846] cursor-pointer hover:underline",
  separator = " / ",
}) => {
  const navigate = useNavigate();

  if (!items.length) return null;

  return (
    <div className="w-full flex justify-start mt-4 mb-2 ml-6">
      {/* mt-2 → pushes it below heading
          mb-4 → gives clean space before content */}
      <p className={`${textClassName} ${className}`}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          if (item.to && !isLast) {
            return (
              <React.Fragment key={`${item.label}-${idx}`}>
                <span
                  className={linkClassName}
                  onClick={() => navigate(item.to)}
                >
                  {item.label}
                </span>
                {separator}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <span>{item.label}</span>
              {!isLast ? separator : null}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
};

export default Breadcrumb;

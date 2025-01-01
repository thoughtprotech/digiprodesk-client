import React, { useState } from "react";

interface TooltipProps {
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right"; // Tooltip position (default is "top")
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  tooltip,
  position = "top",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Tooltip position classes
  const positionClasses = {
    top: "bottom-full mb-1 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-1 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-2 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-2 top-1/2 transform -translate-y-1/2",
  };

  return (
    <div className="relative">
      <div
        className="group"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <div className="cursor-pointer">{children}</div>

        {/* Tooltip */}
        <div
          className={`absolute z-50 px-2 py-1 text-xs text-text font-bold bg-background border-2 border-border rounded-md ${positionClasses[position]
            } transition-opacity duration-500 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"
            }`}
          style={{ whiteSpace: "nowrap" }}
        >
          {tooltip}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;

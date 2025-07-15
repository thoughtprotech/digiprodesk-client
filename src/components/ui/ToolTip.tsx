import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";  // default "top"
  children: React.ReactNode;
  className?: string;
  cursor?: boolean;
  offset?: number;  // space in px
}

const Tooltip: React.FC<TooltipProps> = ({
  tooltip,
  position = "top",
  children,
  className = "",
  cursor = true,
  offset = 27
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Compute tooltip position on layout
  useLayoutEffect(() => {
    if (!isVisible || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (position) {
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
      case "top":
      default:
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
    }

    setCoords({ top, left });
  }, [isVisible, position, offset]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cursor ? "cursor-pointer inline-block" : "inline-block"}
    >
      {children}
      {isVisible && createPortal(
        <div
          className={`absolute z-[9999] px-2 py-1 text-xs font-bold bg-black bg-opacity-50 text-white rounded-md transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${className}`}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            whiteSpace: 'nowrap',
            // adjust transform for left/right
            transform: position === 'left' || position === 'right'
              ? 'translateY(-50%)'
              : 'translateX(-50%) translateY(-100%)',
          }}
        >
          {tooltip}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;

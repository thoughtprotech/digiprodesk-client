import React from "react";

interface ChipProps {
  text: string;
  link?: string;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ text, link, className }) => {
  const chipContent = (
    <div
      className={className ? `w-fit inline-flex items-center rounded font-bold text-[0.65rem] ${className}`
        : `w-fit inline-flex items-center px-2 rounded-md font-bold text-[0.65rem] bg-gray-100/30 text-text border-gray-300`}
      style={{
        cursor: link ? "pointer" : "default",
      }}
    >
      <h1>{text}</h1>
    </div>
  );

  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {chipContent}
    </a>
  ) : (
    chipContent
  );
};

export default Chip;

import useOutsideClick from "@/hooks/useOutsideClick";
import React, { useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
}

const Select: React.FC<CustomSelectProps> = ({
  options,
  defaultValue,
  onChange,
  placeholder,
  name,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find((option) => option.value === defaultValue) || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: dropdownRef,
    handler: () => {
      if (!disabled) setIsOpen(false);
    },
  });

  const handleOptionClick = (option: Option) => {
    if (disabled) return;
    setSelectedOption(option);
    setIsOpen(false);

    if (onChange) {
      // Create a synthetic event to mimic React.ChangeEvent<HTMLInputElement>
      const event = {
        target: {
          name,
          value: option.value,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(event);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`w-full relative inline-block min-w-44 ${disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
    >
      {/* Selected Option */}
      <div
        className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none cursor-pointer ${className}`}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
      >
        <h1 className="font-bold text-textAlt text-sm">
          {selectedOption ? (
            <span className="text-text font-bold text-sm">
              {selectedOption.label}
            </span>
          ) : placeholder ? (
            <span className="text-zinc-600 text-sm font-bold">
              {placeholder}
            </span>
          ) : (
            "Select an Option"
          )}
        </h1>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-background rounded-md shadow-md border-2 border-border">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-foreground whitespace-nowrap text-textAlt text-sm hover:text-text duration-500 ${index === options.length - 1 ? "" : "border-b border-b-border"
                }`}
              onClick={() => handleOptionClick(option)}
            >
              <h1 className="font-bold">{option.label}</h1>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;

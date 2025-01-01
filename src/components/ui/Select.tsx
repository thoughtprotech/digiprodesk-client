import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const Select: React.FC<CustomSelectProps> = ({ options, defaultValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find((option) => option.value === defaultValue) || null
  );

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option.value);
  };

  return (
    <div className="relative inline-block w-44">
      {/* Selected Option */}
      <div
        className="outline-none rounded-md bg-foreground border-2 border-border px-4 py-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : "Select an Option"}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-foreground rounded-md shadow-md">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-foreground whitespace-nowrap"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;

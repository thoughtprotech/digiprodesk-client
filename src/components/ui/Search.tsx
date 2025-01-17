import { Search } from "lucide-react";

export default function SearchInput({
  placeholder,
  onChange,
  value,
  className,
  required,
  name,
  ref
}: {
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
  required?: boolean;
  name?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex items-center rounded-md">
      <div className="border-l-2 border-t-2 border-b-2 border-border rounded-tl-md rounded-bl-md p-2">
        <Search className="w-5 h-5 text-textAlt" />
      </div>
      <input
        type="text"
        placeholder={placeholder || ''}
        onChange={onChange}
        value={value} // Controlled input
        className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-t-2 border-r-2 border-b-2 border-border rounded-tr-md rounded-br-md py-2 text-sm focus:outline-none ${className}`}
        required={required}
        name={name}
        ref={ref}
      />
    </div>
  )
}
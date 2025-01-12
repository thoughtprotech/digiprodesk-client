import React from 'react';

interface InputProps {
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'textArea';
  value?: string; // Optional value for controlled input
  className?: string; // Optional Tailwind CSS class for further customization
}

const Input: React.FC<InputProps> = ({
  placeholder = '',
  onChange,
  type = 'text',
  value,
  className = '',
}) => {
  if (type === 'textArea') {
    return (
      <textarea
        placeholder={placeholder}
        onChange={onChange}
        value={value} // Controlled input
        className={`w-full h-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none focus:border-indigo-500 ${className}`}
      />
    );
  }
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      value={value} // Controlled input
      className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none focus:border-indigo-500 ${className}`}
    />
  );
};

export default Input;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Toast from './Toast';

interface InputProps {
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'textArea' | 'file' | 'checkBox'; // Default type is text
  value?: string | number; // Optional value for controlled input
  className?: string; // Optional Tailwind CSS class for further customization
  required?: boolean;
  name?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
}

const Input: React.FC<InputProps> = ({
  placeholder = '',
  onChange,
  type = 'text',
  value,
  className = '',
  required = false,
  name,
  ref
}) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const uploadedFile = event.dataTransfer?.files[0];
    handleFileChange(uploadedFile);
  };

  const handleFileChange = (uploadedFile: File | null) => {
    if (uploadedFile) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(uploadedFile.type)) {
        return toast.custom((t: any) => (<Toast t={t} content='Please upload a valid image file (JPG or PNG only).' type='warning' />))

      }
    }
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile);

      if (onChange) {
        const syntheticEvent = {
          target: { name, value: uploadedFile }
        };
        onChange(syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  if (type === 'file') {
    // Use the file state for showing the file name, or extract it from the value (file path) if passed
    const fileName = file ? file.name : (typeof value === 'string' ? value.split('/').pop() : '');

    return (
      <div
        className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm ${dragging ? 'border-indigo-500' : 'border-border'} ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="cursor-pointer w-full h-full flex items-center rounded-md relative">
          <input
            type="file"
            name={name}
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            className="hidden"
            accept=".jpg,.jpeg,.png"
            required={required}
            ref={fileInputRef}
          />
          {file || value ? (
            <div className="w-36">
              <div className="w-full">
                <h1 className="truncateText">{fileName}</h1>
              </div>
            </div>
          ) : (
            <div className="text-center text-zinc-600 text-sm">
              {dragging ? (
                <p>Drop the file here</p>
              ) : (
                <p>{placeholder || 'Click To Upload'}</p>
              )}
            </div>
          )}
        </label>
      </div>
    );
  }

  if (type === 'textArea') {
    return (
      <textarea
        placeholder={placeholder}
        onChange={onChange}
        value={value} // Controlled input
        className={`w-full h-full min-h-10 min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none ${className}`}
        name={name}
      />
    );
  }

  if (type === 'checkBox') {
    return (
      <label className="inline-flex items-center cursor-pointer">
        {/* <span className="mr-2">{name}</span> */}
        <div className="relative">
          <input
            type="checkbox"
            onChange={onChange}
            checked={value === 'true' || value === 1} // Convert string 'true' to boolean
            name={name}
            className="hidden sr-only"
            ref={ref}
          />
          <div className={`w-8 h-fit ${value === "true" ? "bg-green-600" : "bg-red-600"} rounded-full transition duration-300 ease-in-out`}>
            <div
              className={`toggle-dot w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ease-in-out bg-white ${value === 'true' ? 'translate-x-4' : ' bg-highlight'
                }`}
            />
          </div>
        </div>
      </label>
    );
  }


  return (
    <input
      type={type}
      placeholder={placeholder || ''}
      onChange={onChange}
      value={value} // Controlled input
      className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none ${className}`}
      required={required}
      name={name}
      ref={ref}
    />
  );
};

export default Input;

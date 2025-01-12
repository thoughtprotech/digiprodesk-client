import React, { useState } from 'react';
import Button from './Button';
import { Trash } from 'lucide-react';
import Tooltip from './ToolTip';

interface InputProps {
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'textArea' | 'file' | 'checkBox'; // Default type is text
  value?: string; // Optional value for controlled input
  className?: string; // Optional Tailwind CSS class for further customization
  required?: boolean;
  name?: string;
}

const Input: React.FC<InputProps> = ({
  placeholder = '',
  onChange,
  type = 'text',
  value,
  className = '',
  required = false,
  name,
}) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);

      if (onChange) {
        const syntheticEvent = {
          target: { name, value: uploadedFile }
        };
        onChange(syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (onChange) {
      const syntheticEvent = {
        target: { name, value: null }
      };
      onChange(syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  if (type === 'file') {
    return (
      <div
        className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md text-sm focus:outline-none ${dragging ? 'border-indigo-500' : 'border-border'} ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="cursor-pointer w-full h-full flex items-center rounded-md p-2">
          <input
            type="file"
            name={name}
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            className="hidden"
            accept="image/*, .pdf, .doc, .docx, .txt"
          />
          {file ? (
            <div className="relative">
              <div className="mb-2">
                {filePreview && filePreview.startsWith('data:image') ? (
                  <img src={filePreview} alt="file-preview" className="w-32 h-32 object-cover rounded-md" />
                ) : (
                  <div className="w-32 h-32 text-center flex items-center justify-center rounded-md">
                    <p>File Preview</p>
                  </div>
                )}
              </div>
              <div className='absolute top-0 right-0'>
                <Button
                  type="button"
                  onClick={handleRemoveFile}
                  icon={
                    <Tooltip tooltip="Remove Document" position="top">
                      <Trash className="w-3 h-3 text-text" />
                    </Tooltip>
                  }
                  className="bg-red-500/60 border border-red-500 hover:bg-red-500 duration-300 rounded-md px-1 p-1 absolute top-0 right-0"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-textAlt">
              {dragging ? (
                <p>Drop the file here</p>
              ) : (
                <p>{placeholder || 'Drag and drop a file or click to select'}</p>
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
        className={`w-full h-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none focus:border-indigo-500 ${className}`}
        name={name}
      />
    );
  }

  if (type === 'checkBox') {
    return (
      <input
        type="checkbox"
        onChange={onChange}
        checked={value === 'true'} // Convert string 'true' to boolean
        name={name}
      />
    );
  }

  return (
    <input
      type={type}
      placeholder={placeholder || 'Enter text'}
      onChange={onChange}
      value={value} // Controlled input
      className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none focus:border-indigo-500 ${className}`}
      required={required}
      name={name}
    />
  );
};

export default Input;

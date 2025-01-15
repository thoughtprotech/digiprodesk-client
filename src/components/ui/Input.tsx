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
            accept="image/*, .pdf, .doc, .docx, .txt"
            value={value} // Controlled input
            required={required}
          />
          {file ? (
            <div className="w-36">
              <div className="w-full">
                {/* {filePreview && filePreview.startsWith('data:image') ? (
                  <img src={filePreview} alt="file-preview" className="w-32 h-32 object-cover rounded-md" />
                ) : (
                  <div className="w-32 h-32 text-center flex items-center justify-center rounded-md">
                    <p>File Preview</p>
                  </div>
                )} */}
                <h1 className='truncateText'>{file.name}</h1>
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
            <div className="text-center text-textAlt text-sm">
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
        className={`w-full h-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none ${className}`}
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
            checked={value === 'true'} // Convert string 'true' to boolean
            name={name}
            className="hidden sr-only"
          />
          <div className="toggle-background w-12 h-fit bg-background rounded-full transition duration-300 ease-in-out">
            <div
              className={`toggle-dot w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-in-out ${value === 'true' ? 'translate-x-6 bg-white' : ' bg-highlight'
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
      placeholder={placeholder || 'Enter text'}
      onChange={onChange}
      value={value} // Controlled input
      className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none ${className}`}
      required={required}
      name={name}
    />
  );
};

export default Input;

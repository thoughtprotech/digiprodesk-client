/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Toast from './Toast';

interface InputProps {
  placeholder?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'date'
    | 'textArea'
    | 'file'
    | 'video'
    | 'checkBox'; // Default type is text
  value?: string | number;
  className?: string;
  required?: boolean;
  name?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
}

// Define maximum file sizes (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos

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

  /**
   * Generic file handler which distinguishes between image and video.
   */
  const handleFileChange = (uploadedFile: File | null, fileType: 'image' | 'video') => {
    if (uploadedFile) {
      if (fileType === 'image') {
        const validImageTypes = ['image/jpeg', 'image/png'];
        if (!validImageTypes.includes(uploadedFile.type)) {
          return toast.custom((t: any) => (
            <Toast
              t={t}
              content='Please upload a valid image file (JPG or PNG only).'
              type='warning'
            />
          ));
        }
        if (uploadedFile.size > MAX_IMAGE_SIZE) {
          return toast.custom((t: any) => (
            <Toast t={t} content='Image size exceeds 5MB.' type='warning' />
          ));
        }
      } else if (fileType === 'video') {
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validVideoTypes.includes(uploadedFile.type)) {
          return toast.custom((t: any) => (
            <Toast
              t={t}
              content='Please upload a valid video file (MP4, WebM, Ogg).'
              type='warning'
            />
          ));
        }
        if (uploadedFile.size > MAX_VIDEO_SIZE) {
          return toast.custom((t: any) => (
            <Toast t={t} content='Video size exceeds 50MB.' type='warning' />
          ));
        }
      }
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

  // IMAGE UPLOAD INPUT
  if (type === 'file') {
    const fileName = file
      ? file.name
      : typeof value === 'string'
      ? value.split('/').pop()
      : '';

    return (
      <div
        className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm ${
          dragging ? 'border-indigo-500' : 'border-border'
        } ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const uploadedFile = event.dataTransfer?.files[0];
          handleFileChange(uploadedFile, 'image');
        }}
      >
        <label className="cursor-pointer w-full h-full flex items-center rounded-md relative">
          <input
            type="file"
            name={name}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null, 'image')
            }
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
              {dragging ? <p>Drop the file here</p> : <p>{placeholder || 'Click To Upload Image'}</p>}
            </div>
          )}
        </label>
      </div>
    );
  }

  // VIDEO UPLOAD INPUT
  if (type === 'video') {
    const fileName = file
      ? file.name
      : typeof value === 'string'
      ? value.split('/').pop()
      : '';

    return (
      <div
        className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm ${
          dragging ? 'border-indigo-500' : 'border-border'
        } ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const uploadedFile = event.dataTransfer?.files[0];
          handleFileChange(uploadedFile, 'video');
        }}
      >
        <label className="cursor-pointer w-full h-full flex items-center rounded-md relative">
          <input
            type="file"
            name={name}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null, 'video')
            }
            className="hidden"
            accept="video/mp4,video/webm,video/ogg"
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
              {dragging ? <p>Drop the file here</p> : <p>{placeholder || 'Click To Upload Video'}</p>}
            </div>
          )}
        </label>
      </div>
    );
  }

  // TEXTAREA INPUT
  if (type === 'textArea') {
    return (
      <textarea
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className={`w-full h-full min-h-10 min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none ${className}`}
        name={name}
      />
    );
  }

  // CHECKBOX INPUT
  if (type === 'checkBox') {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            onChange={onChange}
            checked={value === 'true' || value === 1}
            name={name}
            className="hidden sr-only"
            ref={ref}
          />
          <div className={`w-8 h-fit ${value === "true" ? "bg-green-600" : "bg-red-600"} rounded-full transition duration-300 ease-in-out`}>
            <div
              className={`toggle-dot w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ease-in-out bg-white ${
                value === 'true' ? 'translate-x-4' : 'bg-highlight'
              }`}
            />
          </div>
        </div>
      </label>
    );
  }

  // DEFAULT INPUT (for text, email, password, etc.)
  return (
    <input
      type={type}
      placeholder={placeholder || ''}
      onChange={onChange}
      value={value}
      className={`w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none ${className}`}
      required={required}
      name={name}
      ref={ref}
    />
  );
};

export default Input;

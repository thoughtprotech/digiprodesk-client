import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ImageViewerProps {
  children: React.ReactNode;
  src: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ children, src }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div>
      {/* Clickable Image */}
      <div onClick={togglePopup} className="cursor-pointer">
        {children}
      </div>

      {/* Popup for Enlarged Image */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-fit flex flex-col gap-2 relative bg-background p-4 rounded-md">
            <div className="w-full flex justify-between items-center border-b-2 border-b-border pb-2">
              <div>
                <h1 className="text-xl font-bold">Image Viewer</h1>
              </div>
              <button
                onClick={togglePopup}
                className="text-text rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Image
              src={src}
              alt=""
              width={1000}
              height={1000}
              className="rounded-md max-w-lg max-h-[32rem] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;

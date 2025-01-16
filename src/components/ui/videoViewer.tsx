import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Tooltip from "./ToolTip";

interface VideoViewerProps {
  title?: string;
  children: React.ReactNode;
  src: string;
}

const VideoViewer: React.FC<VideoViewerProps> = ({ title, children, src }) => {
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
      {/* Clickable Video Thumbnail */}
      <div onClick={togglePopup} className="cursor-pointer">
        {children}
      </div>

      {/* Popup for Fullscreen Video */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full h-full flex flex-col gap-2 relative bg-background p-4 rounded-md">
            <div className="w-full flex justify-between items-center border-b-2 border-b-border pb-2">
              <div>
                <h1 className="text-xl font-bold">{
                  title ? title : "Video Viewer"}</h1>
              </div>
              <Tooltip tooltip="Close" position="bottom">
                <button
                  onClick={togglePopup}
                  className="text-text rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </Tooltip>
            </div>
            <video
              src={src}
              controls={false}
              autoPlay
              loop
              className="rounded-md w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoViewer;

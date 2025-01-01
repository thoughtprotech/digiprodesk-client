import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { Crop, X } from "lucide-react";
import Tooltip from "./ToolTip";

// Props interface to define the onScreenshotTaken function
interface ScreenshotComponentProps {
  onScreenshotTaken: (image: string) => void;
  cancelScreenshot: () => void;
}

const ScreenshotComponent: React.FC<ScreenshotComponentProps> = ({
  onScreenshotTaken,
  cancelScreenshot
}) => {
  const [boxSize, setBoxSize] = useState({ width: 300, height: 200 });
  const [boxPosition, setBoxPosition] = useState({ top: 250, left: 355 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      const centerX = (containerWidth - boxSize.width) / 2;
      const centerY = (containerHeight - boxSize.height) / 2;

      setBoxPosition({ top: centerY, left: centerX });
    }
  }, []);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (boxRef.current) {
      const boxRect = boxRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - boxRect.left,
        y: e.clientY - boxRect.top,
      });
      setIsDragging(true);
    }
    e.stopPropagation();
  };

  // Handle drag move
  const handleDragMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();

      const newLeft = Math.min(
        Math.max(e.clientX - containerRect.left - dragOffset.x, 0),
        containerRect.width - boxSize.width
      );
      const newTop = Math.min(
        Math.max(e.clientY - containerRect.top - dragOffset.y, 0),
        containerRect.height - boxSize.height
      );

      setBoxPosition({ top: newTop, left: newLeft });
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.stopPropagation();
  };

  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();

      const newWidth = Math.min(
        Math.max(e.clientX - containerRect.left - boxPosition.left, 50),
        containerRect.width - boxPosition.left
      );
      const newHeight = Math.min(
        Math.max(e.clientY - containerRect.top - boxPosition.top, 50),
        containerRect.height - boxPosition.top
      );

      setBoxSize({ width: newWidth, height: newHeight });
    }
  };

  // Take screenshot
  const takeScreenshot = async () => {
    if (boxRef.current) {
      setIsCapturing(true); // Temporarily hide borders and other elements
      const screenshotButton = document.querySelector("button");
      if (screenshotButton) screenshotButton.style.visibility = "hidden"; // Hide the button

      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for DOM updates

      const { top, left, width, height } = boxRef.current.getBoundingClientRect();

      // Use html2canvas to capture the region
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        x: left,
        y: top,
        width,
        height,
        scrollY: -window.scrollY, // Adjust for scrolling
        scale: window.devicePixelRatio, // High-quality screenshot
        backgroundColor: null, // Preserve transparency
      });

      const image = canvas.toDataURL("image/png");
      onScreenshotTaken(image); // Pass the image data to the parent component

      // Restore UI
      setIsCapturing(false);
      if (screenshotButton) screenshotButton.style.visibility = "visible";
    }
  };

  // Event listeners for mouse move and up
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDragMove(e);
      if (isResizing) handleResizeMove(e);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, boxPosition, boxSize, dragOffset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelScreenshot();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cancelScreenshot]);

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center z-50"
      ref={containerRef}
    >
      {/* Resizable and draggable capture area */}
      <div
        ref={boxRef}
        className={`absolute rounded-md cursor-move ${isCapturing ? "" : "border-4 border-white"
          }`}
        style={{
          width: `${boxSize.width}px`,
          height: `${boxSize.height}px`,
          top: `${boxPosition.top}px`,
          left: `${boxPosition.left}px`,
        }}
        onMouseDown={handleDragStart}
      >
        {!isCapturing && (
          <>
            <div
              className="absolute bottom-0 right-0 w-2 h-2 bg-transparent cursor-se-resize rounded-sm"
              onMouseDown={handleResizeStart}
            />
          </>
        )}
      </div>

      {/* Capture button */}
      <div
        className="absolute w-fit flex gap-2 bg-transparent p-2 rounded-md"
        style={{
          top: `${boxPosition.top + boxSize.height}px`, // Positioned 10px below the capture area
          left: `${boxPosition.left + boxSize.width / 2}px`, // Centered relative to the capture area
          transform: "translateX(-50%)", // Center alignment
        }}
      >
        <Tooltip tooltip="Capture" position="bottom">
          <button
            className="w-fit rounded-md bg-zinc-300/60 dark:bg-zinc-700/60 border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 duration-300 px-4 py-2 flex items-center justify-center space-x-1"
            onClick={takeScreenshot}
          >
            <Crop />
          </button>
        </Tooltip>
        <Tooltip tooltip="Cancel" position="bottom">
          <button
            className="w-fit rounded-md bg-red-500/60 border-2 border-red-500 hover:bg-red-500 px-4 py-2 flex items-center justify-center space-x-1 duration-300"
            onClick={cancelScreenshot}
          >
            <X />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ScreenshotComponent;

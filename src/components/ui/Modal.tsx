// components/ui/Modal.tsx
import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import Tooltip from './ToolTip';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, className }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-foreground rounded-lg p-2 md:min-w-96 h-fit ${className}`}>
        <div className="flex justify-between items-center pb-1 border-b-2 border-border">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Tooltip tooltip="Close" position="top">
            <button onClick={onClose}>
              <X className='w-6 h-6' />
            </button>
          </Tooltip>
        </div>
        <div className="w-full h-full pt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

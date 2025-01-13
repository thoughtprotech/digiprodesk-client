// components/ui/Modal.tsx
import { X } from 'lucide-react';
import React from 'react';
import Tooltip from './ToolTip';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-foreground rounded-lg p-6 md:min-w-96 w-fit md:max-w-2xl">
        <div className="flex justify-between items-center pb-1 border-b-2 border-border">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Tooltip tooltip="Close" position="top">
            <button onClick={onClose}>
              <X className='w-6 h-6' />
            </button>
          </Tooltip>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

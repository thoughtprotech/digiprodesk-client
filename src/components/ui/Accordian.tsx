import { ChevronDown, ChevronUp } from "lucide-react";
import React, { ReactNode } from "react";

interface AccordionProps {
  children: ReactNode;
}

interface AccordionHeaderProps {
  children: ReactNode;
  onClick: () => void;
  isOpen: boolean;
}

interface AccordionContentProps {
  children: ReactNode;
  isOpen: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ children }) => {
  return <div className="w-full rounded-md border border-border bg-transparent">{children}</div>;
};

const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  children,
  onClick,
  isOpen,
}) => {
  return (
    <div
      onClick={onClick}
      className={"cursor-pointer px-4 py-2 bg-transparent"}
    >
      <div className="flex gap-1 justify-between items-center">
        {children}
        <span className="">
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </span>
      </div>
    </div>
  );
};

const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  isOpen,
}) => {
  return (
    <div
      className={`w-full overflow-hidden transition-all duration-300 px-4 flex flex-col gap-1 ${isOpen ? "pb-2" : "pb-0"
        }`}
    >
      {isOpen && <div className="w-full">{children}</div>}
    </div>
  );
};

export { Accordion, AccordionHeader, AccordionContent };

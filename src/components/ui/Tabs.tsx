/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

const Tabs = ({ tabs }: { tabs: any }) => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="w-full h-full mx-auto">
      <div className="w-full h-full flex border-b border-border">
        {tabs.map((tab: any, index: number) => (
          <button
            key={index}
            className={`flex-1 px-4 text-center text-md font-medium 
              ${activeTab === index ? "border-b-2 border-white text-text" : "text-textAlt"}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="w-full h-full border border-border rounded-b-md bg-foreground mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;

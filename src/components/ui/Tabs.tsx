/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

const Tabs = ({ tabs }: { tabs: any }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full h-full mx-auto">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-fit flex items-center justify-center gap-2 rounded-md bg-foreground p-2">
          {tabs.map((tab: any, index: number) => (
            <button
              key={index}
              className={`min-w-32 flex-1 px-4 text-center text-md font-bold hover:text-text duration-300
              ${activeTab === index ? "bg-background rounded-md p-1" : "text-textAlt p-1"}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-full border border-border rounded-md bg-foreground mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;

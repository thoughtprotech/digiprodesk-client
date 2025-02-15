import { useState } from "react";
import Select from "./Select";

export default function DateRangeSelect({ callBack }: { callBack: (startTime: string, endTime: string) => void }) {
  const [dateRange, setDateRange] = useState<"today" | "sevenDays" | "fifteenDays" | "thirtyDays" | "sixtyDays" | "custom">("today");


  const handleChangeDateRange = (value: "today" | "sevenDays" | "fifteenDays" | "thirtyDays" | "sixtyDays" | "custom") => {
    const now = new Date();
    let startDate: Date;
    const endDate: Date = now;

    switch (value) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "sevenDays":
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case "fifteenDays":
        startDate = new Date();
        startDate.setDate(now.getDate() - 15);
        break;
      case "thirtyDays":
        startDate = new Date();
        startDate.setDate(now.getDate() - 30);
        break;
      case "sixtyDays":
        startDate = new Date();
        startDate.setDate(now.getDate() - 60);
        break;
      case "custom":
        // Handle custom date selection based on user input
        console.log("Custom date range selected");
        return;
      default:
        throw new Error("Invalid date range selection");
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    setDateRange(value);
    callBack(startDate.toISOString(), endDate.toISOString());
  }

  return (
    <Select
      className="hover:bg-highlight duration-300"
      options={[
        {
          label: "Today",
          value: "today"
        },
        {
          label: "Last 7 Days",
          value: "sevenDays"
        },
        {
          label: "Last 15 Days",
          value: "fifteenDays"
        },
        {
          label: "Last 30 Days",
          value: "thirtyDays"
        },
        {
          label: "Last 60 Days",
          value: "sixtyDays"
        },
      ]}
      placeholder="Select Range"
      defaultValue={dateRange}
      onChange={(event) => handleChangeDateRange(event.target.value as "today" | "sevenDays" | "fifteenDays" | "thirtyDays" | "sixtyDays" | "custom")}
    />
  )
}
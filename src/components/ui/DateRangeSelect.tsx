import { useState } from "react";
import Select from "./Select";

export default function DateRangeSelect({ callBack }: { callBack: (value: "today" | "sevenDays" | "fifteenDays" | "thirtyDays" | "sixtyDays" | "custom") => void }) {
  const [dateRange, setDateRange] = useState<"today" | "sevenDays" | "fifteenDays" | "thirtyDays" | "sixtyDays" | "custom">("today");

  const handleChangeDateRange = (value: "today" | "sevenDays" | "fifteenDays" | "thirtyDays" | "sixtyDays" | "custom") => {
    setDateRange(value);
    callBack(value);
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
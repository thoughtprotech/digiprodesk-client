/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Select from "./Select";
import toast from "react-hot-toast";
import Toast from "./Toast";

export default function DateRangeSelect({
  callBack,
}: {
  callBack: (startTime: string, endTime: string) => void;
}) {
  const [dateRange, setDateRange] = useState<
    | "today"
    | "sevenDays"
    | "fifteenDays"
    | "thirtyDays"
    | "sixtyDays"
    | "custom"
  >("today");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const handleChangeDateRange = (
    value:
      | "today"
      | "sevenDays"
      | "fifteenDays"
      | "thirtyDays"
      | "sixtyDays"
      | "custom"
  ) => {
    setDateRange(value);

    if (value === "custom") {
      // Set defaults for custom fields (e.g., today's date)
      const todayString = new Date().toISOString().split("T")[0]; // format yyyy-mm-dd
      setCustomStart(todayString);
      setCustomEnd(todayString);
      // Call the callback with today's date as default
      const startDate = new Date(todayString);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(todayString);
      endDate.setHours(23, 59, 59, 999);
      callBack(startDate.toISOString(), endDate.toISOString());
      return;
    }

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
      default:
        throw new Error("Invalid date range selection");
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    callBack(startDate.toISOString(), endDate.toISOString());
  };

  const handleCustomStartChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (customEnd && new Date(customEnd) < new Date(value)) {
      toast.custom((t: any) => (
        <Toast
          t={t}
          content="Start date cannot be after end date"
          type="warning"
        />
      ));
    }
    if (customEnd && new Date(value) > new Date(customEnd)) {
      toast.custom((t: any) => (
        <Toast
          t={t}
          content="Start date cannot be after end date"
          type="warning"
        />
      ));
    }
    setCustomStart(value);
    if (customEnd) {
      const startDate = new Date(value);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
      callBack(startDate.toISOString(), endDate.toISOString());
    }
  };

  const handleCustomEndChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setCustomEnd(value);
    if (customStart) {
      const startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(value);
      endDate.setHours(23, 59, 59, 999);
      callBack(startDate.toISOString(), endDate.toISOString());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        className="hover:bg-highlight duration-300"
        options={[
          { label: "Today", value: "today" },
          { label: "Last 7 Days", value: "sevenDays" },
          { label: "Last 15 Days", value: "fifteenDays" },
          { label: "Last 30 Days", value: "thirtyDays" },
          { label: "Last 60 Days", value: "sixtyDays" },
          { label: "Custom", value: "custom" },
        ]}
        placeholder="Select Range"
        defaultValue={dateRange}
        onChange={(event) =>
          handleChangeDateRange(
            event.target.value as
              | "today"
              | "sevenDays"
              | "fifteenDays"
              | "thirtyDays"
              | "sixtyDays"
              | "custom"
          )
        }
      />
      {dateRange === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={handleCustomStartChange}
            className="bg-background border-2 border-border rounded p-2 focus:outline-none focus:ring-0 font-bold text-sm"
          />
          <input
            type="date"
            value={customEnd}
            onChange={handleCustomEndChange}
            className="bg-background border-2 border-border rounded p-2 focus:outline-none focus:ring-0 font-bold text-sm"
          />
        </div>
      )}
    </div>
  );
}

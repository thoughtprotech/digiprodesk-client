/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Select from "./Select";
import toast from "react-hot-toast";
import Toast from "./Toast";

type DateRangeOption =
  | "today"
  | "sevenDays"
  | "fifteenDays"
  | "thirtyDays"
  | "sixtyDays"
  | "custom";

interface DateRangeSelectProps {
  callBack: (startTime: string, endTime: string) => void;
  defaultStart?: string;
  defaultEnd?: string;
}

/**
 * Helper function to detect the initial date range option based on the provided defaults.
 * If the difference in days matches one of our presets, we return that option;
 * otherwise, we return "custom".
 */
function getInitialDateRange(
  defaultStart: string,
  defaultEnd: string
): DateRangeOption {
  const start = new Date(defaultStart);
  const end = new Date(defaultEnd);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // For "today", we compare to today's start and end-of-day.
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );
  if (
    start.getTime() === todayStart.getTime() &&
    end.getTime() === todayEnd.getTime()
  ) {
    return "today";
  }
  if (diffDays - 1 === 7) return "sevenDays";
  if (diffDays - 1 === 15) return "fifteenDays";
  if (diffDays - 1 === 30) return "thirtyDays";
  if (diffDays - 1 === 60) return "sixtyDays";
  return "custom";
}

export default function DateRangeSelect({
  callBack,
  defaultStart,
  defaultEnd,
}: DateRangeSelectProps) {
  // Determine the initial range option based on defaults (if provided) or fallback to "today"
  const initialDateRange =
    defaultStart && defaultEnd
      ? getInitialDateRange(defaultStart, defaultEnd)
      : "today";
  const [dateRange, setDateRange] = useState<DateRangeOption>(initialDateRange);
  const [customStart, setCustomStart] = useState<string>(defaultStart || "");
  const [customEnd, setCustomEnd] = useState<string>(defaultEnd || "");

  useEffect(() => {
    if (defaultStart && defaultEnd) {
      const newRange = getInitialDateRange(defaultStart, defaultEnd);
      setDateRange(newRange);
      setCustomStart(defaultStart);
      setCustomEnd(defaultEnd);
    }
  }, [defaultStart, defaultEnd]);

  const handleChangeDateRange = (value: DateRangeOption) => {
    setDateRange(value);

    if (value === "custom") {
      // Set defaults for custom fields (e.g., today's date)
      const todayString = new Date().toISOString().split("T")[0]; // format yyyy-mm-dd
      setCustomStart(todayString);
      setCustomEnd(todayString);
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
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "sevenDays":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "fifteenDays":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 15);
        break;
      case "thirtyDays":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case "sixtyDays":
        startDate = new Date(now);
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
    // Warn if the start date is after the end date.
    if (customEnd && new Date(customEnd) < new Date(value)) {
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
          handleChangeDateRange(event.target.value as DateRangeOption)
        }
      />
      {dateRange === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={handleCustomStartChange}
            className="custom-date-input bg-background border-2 border-border rounded p-2 focus:outline-none focus:ring-0 font-bold text-sm"
          />
          <input
            type="date"
            value={customEnd}
            onChange={handleCustomEndChange}
            className="custom-date-input bg-background border-2 border-border rounded p-2 focus:outline-none focus:ring-0 font-bold text-sm"
          />
        </div>
      )}
    </div>
  );
}

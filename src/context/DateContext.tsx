import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type DateContextType = {
  startDate: string | undefined;
  setStartDate: Dispatch<SetStateAction<string>>;
  endDate: string | undefined;
  setEndDate: Dispatch<SetStateAction<string>>;
};

export const DateContext = createContext<DateContextType | undefined>(
  undefined
);

export const DateContextProvider = ({ children }: { children: ReactNode }) => {
  // Create a new Date instance for today
  const now = new Date();

  // Initialize startDate as today 12:00 AM
  const initialStartDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();

  // Initialize endDate as today 11:59 PM
  const initialEndDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  return (
    <DateContext.Provider
      value={{ startDate, setStartDate, endDate, setEndDate }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDateContext = (): DateContextType => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDateContext must be used within a DateContextProvider");
  }
  return context;
};

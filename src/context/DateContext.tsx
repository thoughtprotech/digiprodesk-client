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

export const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateContextProvider = ({ children }: { children: ReactNode }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
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
      throw new Error('useDateContext must be used within a DateProvider');
    }
    return context;
  };
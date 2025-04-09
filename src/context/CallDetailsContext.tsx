import { Location } from "@/utils/types";
import { createContext, useState } from "react";

interface CallDetailsContextProps {
  guestLocation: Location | null | undefined;
  setGuestLocation: (location: Location) => void;
}

export const CallDetailsContext = createContext<CallDetailsContextProps>({
  guestLocation: null,
  setGuestLocation: () => {},
});

// Create a provider that will be used to set the callID
export const CallDetailsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [guestLocation, setGuestLocation] = useState<Location | null | undefined>();

  return (
    <CallDetailsContext.Provider value={{ guestLocation, setGuestLocation }}>
      {children}
    </CallDetailsContext.Provider>
  );
};

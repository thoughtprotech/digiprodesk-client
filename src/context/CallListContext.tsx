import { Call } from '@/utils/types';
import { createContext, useState } from 'react';

interface CallListContextProps {
  callList: Call[];
  setCallList: (callList: Call[]) => void;
  callToPickUp: Call | null;
  setCallToPickUp: (call: Call | null) => void;
}

export const CallListContext = createContext<CallListContextProps>({
  callList: [],
  setCallList: () => { },
  callToPickUp: null,
  setCallToPickUp: () => { },
});

export const CallListProvider = ({ children }: { children: React.ReactNode }) => {
  const [callList, setCallList] = useState<Call[]>([]);
  const [callToPickUp, setCallToPickUp] = useState<Call | null>(null);

  return (
    <CallListContext.Provider value={{ callList, setCallList, callToPickUp, setCallToPickUp }}>
      {children}
    </CallListContext.Provider>
  );
};

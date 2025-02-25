import { CallQueue } from '@/utils/types';
import { createContext, useState } from 'react';

interface CallListContextProps {
  callList: CallQueue[];
  setCallList: (callList: CallQueue[]) => void;
  callToPickUp: CallQueue | null;
  setCallToPickUp: (call: CallQueue | null) => void;
}

export const CallListContext = createContext<CallListContextProps>({
  callList: [],
  setCallList: () => { },
  callToPickUp: null,
  setCallToPickUp: () => { },
});

export const CallListProvider = ({ children }: { children: React.ReactNode }) => {
  const [callList, setCallList] = useState<CallQueue[]>([]);
  const [callToPickUp, setCallToPickUp] = useState<CallQueue | null>(null);

  return (
    <CallListContext.Provider value={{ callList, setCallList, callToPickUp, setCallToPickUp }}>
      {children}
    </CallListContext.Provider>
  );
};

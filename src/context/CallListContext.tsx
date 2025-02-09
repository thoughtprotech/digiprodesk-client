import { Call } from '@/utils/types';
import { createContext, useState } from 'react';

interface CallListContextProps {
  callList: Call[];
  setCallList: (callList: Call[]) => void;
}

export const CallListContext = createContext<CallListContextProps>({
  callList: [],
  setCallList: () => { },
});

export const CallListProvider = ({ children }: { children: React.ReactNode }) => {
  const [callList, setCallList] = useState<Call[]>([]);

  return (
    <CallListContext.Provider value={{ callList, setCallList }}>
      {children}
    </CallListContext.Provider>
  );
}
import { createContext, useState } from 'react';

interface CallContextProps {
  callId: string;
  setCallId: (callId: string) => void;
}

export const CallContext = createContext<CallContextProps>({
  callId: '',
  setCallId: () => { },
});

// Create a provider that will be used to set the callID
export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [callId, setCallId] = useState('');

  return (
    <CallContext.Provider value={{ callId, setCallId }}>
      {children}
    </CallContext.Provider>
  );
};

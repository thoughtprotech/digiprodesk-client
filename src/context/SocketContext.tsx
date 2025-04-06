// context/SocketContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";

interface SocketContextProps {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    if (!userToken) return;
    const decoded = jwt.decode(userToken) as { userName: string };
    const { userName } = decoded;
    const userId = userName;

    if (userId && !socket) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
        auth: { userId },
      });
      console.log({ newSocket });
      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

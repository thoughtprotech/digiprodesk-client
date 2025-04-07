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

// Custom hook to poll for changes in the userToken cookie
const useUserToken = () => {
  const [userToken, setUserToken] = useState<string | null>(() => {
    const cookies = parseCookies();
    return cookies.userToken || null;
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const cookies = parseCookies();
      const token = cookies.userToken || null;
      setUserToken(token);
    }, 1000); // polling every 1 second

    return () => clearInterval(intervalId);
  }, []);

  return userToken;
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const userToken = useUserToken();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log({ userToken });
    if (!userToken) {
      // If there's no token (user is logged out), disconnect any active socket.
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Decode the token to get the userName (or any identifier you use)
    const decoded = jwt.decode(userToken) as { userName: string } | null;
    const userId = decoded?.userName;

    // If there's a valid userId and no active socket, create a new connection.
    if (userId && !socket) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
        auth: { userId },
      });
      console.log("Creating new socket connection:", newSocket);
      setSocket(newSocket);
    }
  }, [userToken, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

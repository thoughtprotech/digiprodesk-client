import { CallProvider } from "@/context/CallContext";
import { CallListProvider } from "@/context/CallListContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { DateContextProvider } from "../context/DateContext";
import { SocketProvider } from "@/context/SocketContext";
import { CallDetailsProvider } from "@/context/CallDetailsContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SocketProvider>
      <CallProvider>
        <CallListProvider>
          <CallDetailsProvider>
            <ThemeProvider>
              <DateContextProvider>
                <Component {...pageProps} />
              </DateContextProvider>
              <Toaster position="bottom-left" reverseOrder={false} />
            </ThemeProvider>
          </CallDetailsProvider>
        </CallListProvider>
      </CallProvider>
    </SocketProvider>
  );
}

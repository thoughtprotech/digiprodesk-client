import { CallProvider } from "@/context/CallContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CallProvider>
      <ThemeProvider>
        <Component {...pageProps} />
        <Toaster
          position="bottom-left"
          reverseOrder={false}
        />
      </ThemeProvider>
    </CallProvider>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Tooltip from "@/components/ui/ToolTip";
import { Phone, Play } from "lucide-react";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

export default function CallingCard({
  title,
  status,
  inCall,
  setInCall,
  setConfirmEndCall
}: {
  title: string;
  status: string;
  inCall: {
    status: boolean;
    callId: string
  };
  setInCall: any;
  setConfirmEndCall: any;
}) {
  const [elapsedTime, setElapsedTime] = useState(0); // Time in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000); // Increment every second

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handleJoinCall = () => {
    if (inCall.status) {
      return setConfirmEndCall({
        status: true,
        callId: title
      });
    }

    setInCall({
      status: true,
      callId: title
    });
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Commenced" />));
  }

  return (
    <div className="w-full h-full bg-foreground rounded-lg p-2 flex flex-col space-y-2 justify-between border-2 border-border">
      <div className="w-full flex flex-col gap-2 justify-between pb-1">
        <div className="w-full flex justify-between space-x-3 border-b-2 border-b-border pb-2">
          <div>
            {status === "incoming" && (
              <h1 className="w-fit text-[0.65rem] font-bold rounded bg-orange-500/30 text-orange-500 px-2">
                INCOMING CALL
              </h1>
            )}
            {status === "active" && (
              <h1 className="w-fit text-[0.65rem] font-bold rounded bg-green-500/30 text-green-500 px-2">
                ACTIVE
              </h1>
            )}
            {status === "hold" && (
              <h1 className="w-fit text-[0.65rem] font-bold rounded bg-indigo-500/30 text-indigo-500 px-2">
                CALL ON HOLD
              </h1>
            )}
          </div>
          <div>
            {/* Timer */}
            <h1 className="w-fit text-[0.65rem] font-bold rounded bg-highlight text-text px-2">
              {formatTime(elapsedTime)}
            </h1>
          </div>
        </div>
        <div className="h-fit flex justify-between items-start space-x-3">
          <div>
            <h1 className="font-bold">{title}</h1>
          </div>
          <div>
            <Tooltip
              tooltip={status === "incoming" ? "Accept Call" : "Resume Call"}
              position="bottom"
            >
              <Button
                className={`w-fit h-fit whitespace-nowrap rounded-md ${status === "incoming"
                  ? "bg-green-500/30 hover:bg-green-500 border-2 border-green-500"
                  : "bg-indigo-500/30 hover:bg-indigo-500 border-2 border-indigo-500"
                  } duration-300 font-bold text-sm justify-center items-center flex px-4 py-1`}
                onClick={handleJoinCall}
                icon={status === "incoming" ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )} />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

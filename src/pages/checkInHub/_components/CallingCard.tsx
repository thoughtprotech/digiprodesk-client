/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Tooltip from "@/components/ui/ToolTip";
import { Phone, Play } from "lucide-react";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { toTitleCase } from "@/utils/stringFunctions";

export default function CallingCard({
  title,
  status,
  inCall,
  setInCall,
  setConfirmEndCall,
  joinCall,
  resumeCall,
  roomId
}: {
  title: string;
  status: string;
  inCall: {
    status: boolean;
    callId: string
  };
  setInCall: any;
  setConfirmEndCall: any;
  joinCall: (roomId: string) => void;
  resumeCall: (roomId: string) => void;
  roomId: string;
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
        callId: title,
        roomId: roomId
      });
    }

    if (status === "New") {
      setInCall({
        status: true,
        callId: title,
        roomId: roomId
      });
      joinCall(roomId);
    } else {
      setInCall({
        status: true,
        callId: title,
        roomId: roomId
      });
      resumeCall(roomId);
    }
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Commenced" />));
  }

  return (
    <div className="w-full h-full bg-background rounded-lg p-2 flex flex-col space-y-2 justify-between border-2 border-border">
      <div className="w-full flex flex-col gap-2 justify-between pb-1">
        <div className="w-full flex justify-between space-x-3 border-b-2 border-b-border pb-2">
          <div>
            {status === "New" && (
              <h1 className="w-fit text-[0.65rem] font-bold rounded text-orange-500">
                INCOMING CALL
              </h1>
            )}
            {status === "active" && (
              <h1 className="w-fit text-[0.65rem] font-bold rounded text-green-500">
                ACTIVE
              </h1>
            )}
            {status === "On Hold" && (
              <h1 className="w-fit text-[0.65rem] font-bold rounded text-indigo-500">
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
            <h1 className="font-bold">{toTitleCase(title || "")}</h1>
          </div>
          <div>
            <Tooltip
              tooltip={status === "New" ? "Accept Call" : "Resume Call"}
              position="bottom"
            >
              <Button
                className={`w-fit h-fit whitespace-nowrap rounded-md ${status === "New"
                  ? "bg-green-500/50 dark:bg-green-500/30 hover:bg-green-500 dark:hover:bg-green-500 border border-green-500"
                  : "bg-indigo-500/50 dark:bg-indigo-500/30 hover:bg-indigo-500 dark:hover:bg-indigo-500 border border-indigo-500"
                  } duration-300 font-bold text-sm justify-center items-center flex px-4 py-1`}
                onClick={handleJoinCall}
                icon={status === "New" ? (
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

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from "react";
import Button from "./Button";
import { CallQueue } from "@/utils/types";

interface CallRingProps {
  incomingCall: CallQueue;
  onClose: () => void;
  action?: () => void;
}

const CallRing: React.FC<CallRingProps> = ({ incomingCall, onClose, action }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/call-ringtone.mp3");
    audio.play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const FallbackImage = () => (
    <div className="w-16 h-16 bg-text flex items-center justify-center rounded-full">
      <h1 className="text-textAlt text-4xl font-bold">
        {incomingCall?.CallPlacedByLocation?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()}
      </h1>
    </div>
  );

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50 bg-black/30">
      <div className="w-fit max-w-2xl bg-foreground shadow-lg rounded-lg p-4 flex flex-col items-center gap-2">
        <div className="w-full flex justify-between items-center border-b pb-2 border-b-border">
          <div>
            <h1 className="text-center text-orange-500 uppercase font-bold">Incoming Call</h1>
          </div>
        </div>
        <div className="w-full flex flex-col justify-between gap-4 items-center">
          <div className="w-full flex items-center justify-between">
            <div className="w-3/5 flex flex-col items-start gap-2">
              <div className="w-16 h-16">
                {imgError ? (
                  <FallbackImage />
                ) : (
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/user/${incomingCall?.CallPlacedByUserName}/ProfilePic.png`}
                    alt="User Profile"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
              <div>
                <h1 className="text-center text-text text-2xl font-semibold">{incomingCall?.CallPlacedByLocation}</h1>
              </div>
            </div>
            <div className="w-2/5">
              <img
                src={`/images/incomingCall.gif`}
                alt="User Profile"
                onError={() => setImgError(true)}
                className="w-28 h-28 object-cover rounded-full"
              />
            </div>
          </div>
          <div className="w-full flex gap-2">
            <div className="w-44 flex gap-2">
              {action && (
                <Button
                  text="Connect"
                  color="green"
                  onClick={() => {
                    action();
                    onClose();
                  }}
                />
              )}
            </div>
            <div className="w-44 flex gap-2">
              <Button
                color="foreground"
                onClick={onClose}
                text="Minimize"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const useCallRing = () => {
  const [callRing, setCallRing] = useState<{ incomingCall: CallQueue; action?: () => void } | null>(null);

  const showCallRing = useCallback((incomingCall: CallQueue, action?: () => void) => {
    setCallRing({ incomingCall, action });
  }, []);

  const closeCallRing = () => setCallRing(null);

  return {
    CallRingComponent: callRing ? (
      <CallRing incomingCall={callRing.incomingCall} action={callRing.action} onClose={closeCallRing} />
    ) : null,
    showCallRing,
  };
};

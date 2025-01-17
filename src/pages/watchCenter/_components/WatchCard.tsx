/* eslint-disable @typescript-eslint/no-explicit-any */
import Tooltip from "@/components/ui/ToolTip";
import { PhoneOutgoing } from "lucide-react";
import { useRouter } from "next/router";

export default function Index({ title, src }: { title: string; src?: any }) {
  const router = useRouter();

  return (
    <div className="w-full h-56 flex flex-col space-y-4 bg-foreground rounded-lg group">
      <div className="w-full h-full bg-background flex items-center justify-center rounded-lg relative">
        {src ? (
          <video
            src={src}
            width={1000}
            height={1000}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div>
            <h1 className="font-bold text-xl text-text">No Video Feed</h1>
          </div>
        )}
        {/* Header */}
        <div className="w-full h-8 flex justify-between items-center absolute top-0 left-0 px-2 py-2 bg-black/30 rounded-t-md">
          <div>
            <h1 className="font-bold text-lg text-white">{title}</h1>
          </div>
          <div className="flex space-x-2 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Tooltip tooltip="Call Location" position="bottom">
              <div
                className="bg-green-500/50 hover:bg-green-500 border-2 border-green-500 duration-300 w-fit h-fit rounded-md py-1 px-3 flex items-center cursor-pointer"
                onClick={() => router.push("/checkInHub")}
              >
                <PhoneOutgoing className="w-4 h-4 font-bold text-text" />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

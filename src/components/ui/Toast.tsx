import { CheckCheck, CircleAlert, CircleX, Info } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Toast({ t, content, type }:
  {
    t: any;
    content: string;
    type: "success" | "error" | "warning" | "info";
  }

) {
  if (type === "success") {
    return (
      <div
        className={`bg-zinc-700/50 border-2 border-green-500 rounded-md ${t.visible ? 'animate-enter' : 'animate-leave'
          }`}
      >
        <div className="w-full flex items-center gap-2 bg-green-500/30 px-4 py-2">
          <CheckCheck className="w-6 h-6 text-green-500" />
          <h1 className="text-sm font-bold text-white">
            {content}
          </h1>
        </div>
      </div>
    )
  }
  if (type === "error") {
    return (
      <div
        className={`bg-zinc-700/50 border-2 border-red-500 rounded-md ${t.visible ? 'animate-enter' : 'animate-leave'
          }`}
      >
        <div className="w-full flex items-center gap-2 bg-red-500/30 px-4 py-2">
          <CircleX className="w-6 h-6 text-red-500" />
          <h1 className="text-sm font-bold text-white">
            {content}
          </h1>
        </div>
      </div>
    )
  }
  if (type === "warning") {
    return (
      <div
        className={`bg-zinc-700/50 border-2 border-yellow-500 rounded-md ${t.visible ? 'animate-enter' : 'animate-leave'
          }`}
      >
        <div className="w-full flex items-center gap-2 bg-yellow-500/30 px-4 py-2">
          <CircleAlert className="w-6 h-6 text-yellow-500" />
          <h1 className="text-sm font-bold text-white">
            {content}
          </h1>
        </div>
      </div>
    )
  }
  if (type === "info") {
    return (
      <div
        className={`bg-zinc-700/50 border-2 border-indigo-500 rounded-md ${t.visible ? 'animate-enter' : 'animate-leave'
          }`}
      >
        <div className="w-full flex items-center gap-2 bg-indigo-500/30 px-4 py-2">
          <Info className="w-6 h-6 text-indigo-500" />
          <h1 className="text-sm font-bold text-white">
            {content}
          </h1>
        </div>
      </div>
    )
  }
}
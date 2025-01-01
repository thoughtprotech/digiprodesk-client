/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Index() {
  const [inCall, setInCall] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col space-y-2">
      <div className="w-full h-16 flex items-center justify-between border-b-2 border-b-border relative z-50 bg-background px-2">
        <div>
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-28"
          />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="font-bold text-2xl">Welcome To Olive Indiranagar</h1>
        </div>
      </div>
      {inCall ? (
        <div className="w-full h-full relative bg-black">
          <div className="w-80 h-52 rounded-md bg-foreground absolute bottom-6 right-6 flex space-x-4 items-center p-4">

          </div>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center relative">
          <div className="rounded-lg p-4 flex flex-col justify-center items-center space-y-4 z-50 bg-background">
            <div className="w-full flex justify-center">
              <h1 className="font-bold text-2xl">Meet Your Virtual Receptionist</h1>
            </div>
            <Image
              src="/images/receptionist.png"
              alt="Receptionist"
              width={1000}
              height={1000}
              className="w-64"
            />
            <div className="w-full">
              <button className="w-full font-bold rounded-md bg-blue-500 px-4 py-2 flex items-center justify-center space-x-1"
                onClick={() => setInCall(true)}
              >Meet Virtual Receptionist</button>
            </div>
          </div>
          <Image
            src="/images/background.png"
            alt="Background"
            width={1000}
            height={1000}
            className="absolute top-0 left-0 bottom-0 right-0 w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
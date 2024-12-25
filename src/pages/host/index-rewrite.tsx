import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { useRouter } from "next/router";

export default function Home() {
  const [peerId, setPeerId] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const joinCall = (callId: string, from: string) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        const call = peerRef.current?.call(from, stream);
        call?.on("stream", (remoteStream: any) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });

        wsRef.current?.send(JSON.stringify({ type: "joinCall", from: peerId, callId }));
        setCurrentCallId(callId);
        setConnected(true);

        setActiveCalls((calls) =>
          calls.map((c) => ({
            ...c,
            active: c.callId === callId,
          }))
        );
      })
      .catch(console.error);
  };

  const pauseCall = (callId: string) => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => (track.enabled = false));
    }
    setActiveCalls((calls) =>
      calls.map((c) => (c.callId === callId ? { ...c, paused: true, active: false } : c))
    );
    setCurrentCallId(null);
    setConnected(false);
  };

  const resumeCall = (callId: string) => {
    const call = activeCalls.find((c) => c.callId === callId);
    if (!call) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }

        setCurrentCallId(callId);
        setConnected(true);

        setActiveCalls((calls) =>
          calls.map((c) => ({
            ...c,
            paused: false,
            active: c.callId === callId,
          }))
        );
      })
      .catch(console.error);
  };

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);

      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "");
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "register", peerId: id }));
      };

      ws.onmessage = (event: { data: string }) => {
        const data = JSON.parse(event.data);
        if (data.type === "activeCalls") {
          setActiveCalls(data.activeCalls);
        }
      };

      wsRef.current = ws;
    });

    peerRef.current = peer;

    return () => {
      peer.disconnect();
      peer.destroy();
      wsRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="w-full h-screen flex">
        <div className="w-3/4 h-full relative">
          {connected ? (
            <video ref={remoteVideoRef} className="w-full h-full bg-black object-cover" />
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <div className="border-2 border-dashed border-gray-600 rounded-md p-4">
                <h1 className="text-gray-500 font-bold">Not In A Call</h1>
              </div>
            </div>
          )}
        </div>
        <div className="w-1/4 h-full border-l-2 border-l-gray-600 flex flex-col space-y-4 p-4">
          <h1 className="text-lg font-bold">Active Calls</h1>
          <ul>
            {activeCalls.length > 0 ? (
              activeCalls.map((call) => (
                <li key={call.callId} className="flex justify-between items-center">
                  <div>
                    <h1>{call.from}</h1>
                    <p>Status: {call.active ? "Active" : call.paused ? "Paused" : "Pending"}</p>
                  </div>
                  <div className="space-x-2">
                    {!call.active && !call.paused && (
                      <button
                        onClick={() => joinCall(call.callId, call.from)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Join
                      </button>
                    )}
                    {call.active && (
                      <button
                        onClick={() => pauseCall(call.callId)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                      >
                        Pause
                      </button>
                    )}
                    {call.paused && (
                      <button
                        onClick={() => resumeCall(call.callId)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <div className="w-full border-2 border-dashed border-gray-600 rounded-md p-4">
                <h1 className="text-gray-500 font-bold">No Calls Pending</h1>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

import Button from "@/components/ui/Button";
import Image from "next/image";
import Peer, { MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Index() {
  const [userId] = useState<string>(`Guest-${Math.floor(Math.random() * 1000)}`);
  const [, setPeerId] = useState<string>('');
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const mediaConnectionRef = useRef<MediaConnection | null>(null); // Ref to store the current call
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [inCall, setInCall] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string>('notInCall');

  const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
    query: {
      userId
    },
    withCredentials: true,

  });

  const call = (remotePeerId: string) => {
    console.log("Calling peer with ID: ", remotePeerId);
    // Use modern getUserMedia method
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream: MediaStream) => {
        if (currentUserVideoRef.current) {
          currentUserVideoRef.current.srcObject = mediaStream;
          currentUserVideoRef.current.play();
        }

        const peerCall = peerInstance.current?.call(remotePeerId, mediaStream);
        if (peerCall) {
          mediaConnectionRef.current = peerCall; // Store the current call in the ref
          peerCall.on('stream', (remoteStream: MediaStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });
  };

  const initiateCall = () => {
    const roomId = `room-${Math.floor(Math.random() * 1000)}`;
    setCurrentRoomId(roomId);
    setInCall(true);
    setCallStatus('calling');
    socket.emit("initiate-call", JSON.stringify({ roomId }));
  };

  useEffect(() => {
    const peer = new Peer(userId);

    socket.on("call-joined", (data) => {
      console.log({ currentRoomId });
      console.log(data.roomId);
      if (data.roomId === currentRoomId) {
        console.log(data.to);
        call(data.to);
        setCallStatus('inProgress');
      }
    });

    socket.on("call-on-hold", (data) => {
      if (data.roomId === currentRoomId) {
        setCallStatus('onHold');
      }
    });

    socket.on("call-resumed", (data) => {
      if (data.roomId === currentRoomId) {
        console.log({ data });
        call(data.to);
        setCallStatus('inProgress');
      }
    });

    socket.on("call-ended", (data) => {
      if (data.roomId === currentRoomId) {
        console.log(data);

        // Close the active PeerJS call when the call-ended event is triggered
        if (mediaConnectionRef.current) {
          mediaConnectionRef.current.close();
          mediaConnectionRef.current = null;
        }
        // Close current video streams
        if (currentUserVideoRef.current) {
          currentUserVideoRef.current.srcObject = null;
        }

        setInCall(false);
        setCallStatus('notInCall');
      }
    });

    peer.on('open', (id: string) => {
      setPeerId(id);
    });

    peer.on('call', (call: MediaConnection) => {
      // Use modern getUserMedia method for answering the call
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((mediaStream: MediaStream) => {
          if (currentUserVideoRef.current) {
            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();
          }

          call.answer(mediaStream);
          call.on('stream', (remoteStream: MediaStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });

          // Store the incoming call in the ref
          mediaConnectionRef.current = call;
        })
        .catch((err) => {
          console.error("Error accessing media devices.", err);
        });
    });

    peerInstance.current = peer;

    return () => {
      peerInstance.current?.destroy();
    };
  }, [currentRoomId]);

  return (
    <div className="w-full h-screen bg-background flex flex-col text-white">
      <div className="w-full h-16 flex items-center justify-between border-b-2 border-b-border z-50 bg-background px-2 absolute top-0 left-0">
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
      {!inCall && callStatus === "notInCall" && (
        <div className="w-full h-full flex justify-center items-center relative">
          <div className="rounded-lg p-4 flex flex-col justify-center items-center space-y-4 z-50 bg-foreground">
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
            <Button color="indigo" onClick={initiateCall} text="Call Virtual Receptionist" />
          </div>
        </div>
      )}
      {inCall && callStatus === "inProgress" && (
        <div className="w-full h-full relative">
          <div className="flex flex-col items-center absolute bottom-5 right-5">
            <video ref={currentUserVideoRef} autoPlay muted className="rounded-lg shadow-lg w-64 h-48 object-cover" />
          </div>
          <div>
            <video ref={remoteVideoRef} autoPlay className="w-full h-screen rounded-lg shadow-lg object-cover" />
          </div>
        </div>
      )}
      {
        callStatus === 'calling' && (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-bold text-xl">Calling Virtual Receptionist...</h1>
          </div>
        )
      }
      {
        callStatus === 'onHold' && (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-bold text-xl">Call on hold</h1>
          </div>
        )
      }
    </div>
  )
}
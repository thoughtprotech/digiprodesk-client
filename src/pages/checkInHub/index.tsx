/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from "react";
import { FilePlus2, Mic, MicOff, PanelRightClose, PanelRightOpen, Pause, Phone, PhoneIncoming, PhoneOff, Trash, Video, VideoOff } from "lucide-react";
import Tooltip from "@/components/ui/ToolTip";
import Layout from "@/components/Layout";
import ScreenshotComponent from "@/components/ui/Screenshotcomponent";
import Image from "next/image";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import CallingCard from "./_components/CallingCard";
import ImageViewer from "@/components/ui/ImageViewer";
import Chip from "@/components/ui/Chip";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Peer, { MediaConnection } from "peerjs";
import { io } from "socket.io-client";
import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import { CallContext } from "@/context/CallContext";
import generateUUID from "@/utils/uuidGenerator";
import { CallListContext } from "@/context/CallListContext";
import { toTitleCase } from "@/utils/stringFunctions";

export default function Index() {
  const [inCall, setInCall] = useState<{
    status: boolean;
    callId: string;
    roomId: string;
  }>({
    status: false,
    callId: "",
    roomId: ""
  });
  const [filter, setFilter] = useState("all");
  const [isRightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [takeScreenshot, setTakeScreenshot] = useState(false);
  const [screenshotImage, setScreenshotImage] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [confirmEndCall, setConfirmEndCall] = useState<{
    status: boolean;
    callId: string;
    roomId: string;
  }>({
    status: false,
    callId: "",
    roomId: ""
  });

  const [userId, setUserId] = useState<string>();
  const [, setPeerId] = useState<string>('');
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoCallRef = useRef<MediaStreamTrack | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const { callList } = useContext(CallListContext);
  const currentRoomId = useRef<string>('');
  const mediaConnectionRef = useRef<MediaConnection | null>(null);
  const uploadedChunks = useRef<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { callId: guestCallId } = useContext(CallContext);

  const updateCallInfo = async (roomId: string, bookingId: string, notes: string, documents?: string[]) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const formData = new FormData();
      formData.append("CallID", roomId);
      formData.append("CallBookingID", bookingId);
      formData.append("CallNotes", notes);

      if (documents && documents.length > 0) {
        documents.forEach((base64String, index) => {
          // Extract the MIME type and base64 data
          const matches = base64String.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");

            // Convert the buffer to a Blob
            const blob = new Blob([buffer], { type: mimeType });
            const file = new File([blob], `document-${index + 1}.${mimeType.split('/')[1]}`);
            formData.append("CallDocument", file);
          }
        });
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/call`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData
      });

      if (response.ok) {
        return;
      } else {
        return toast.custom((t: any) => (<Toast t={t} type="error" content="Error Updating Call Info" />));
      }
    } catch {
      return toast.custom((t: any) => (<Toast t={t} type="error" content="Error Updating Call Info" />));
    }
  }

  const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
    query: {
      userId,
    },
    withCredentials: true,
  });


  useEffect(() => {
    console.log({ guestCallId });
    if (guestCallId && userId) {
      initiateCall(guestCallId);
    }
  }, [guestCallId, userId]);

  const initiateCall = (guestId: string) => {
    const roomId = generateUUID();
    currentRoomId.current = roomId;
    setInCall({
      status: true,
      callId: userId!,
      roomId: roomId
    });
    if (socket) {
      socket.emit("call-guest", JSON.stringify({ roomId, LocationID: 1, to: guestId }));
    }
  };

  const joinCall = (roomId: string) => {
    currentRoomId.current = roomId;
    socket.emit("join-call", JSON.stringify({ roomId }));
  }

  const endCall = (roomId: string) => {
    socket.emit("end-call", JSON.stringify({ roomId }));

    if (bookingId.length > 50) {
      return toast.custom((t: any) => (<Toast t={t} type="warning" content="Booking ID Is Too Long" />));
    }

    if (callNotes.length > 2000) {
      return toast.custom((t: any) => (<Toast t={t} type="warning" content="Call Notes Is Too Long" />));
    }

    if (screenshotImage && screenshotImage.length > 0) {
      updateCallInfo(roomId, bookingId, callNotes, screenshotImage);
    } else {
      updateCallInfo(roomId, bookingId, callNotes);
    }

    // Close the PeerJS call if it's active
    if (mediaConnectionRef.current) {
      mediaConnectionRef.current.close();
      mediaConnectionRef.current = null;
    }

    // Close current video streams
    if (currentUserVideoRef.current) {
      currentUserVideoRef.current.srcObject = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current); // Clear the interval
      recordingIntervalRef.current = null;
    }
  }

  const holdCall = (roomId: string) => {
    socket.emit("hold-call", JSON.stringify({ roomId }));

    // Close the PeerJS call if it's active
    if (mediaConnectionRef.current) {
      mediaConnectionRef.current.close();
      mediaConnectionRef.current = null;
    }

    // Close current video streams
    if (currentUserVideoRef.current) {
      currentUserVideoRef.current.srcObject = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current); // Clear the interval
      recordingIntervalRef.current = null;
    }
  }

  const resumeCall = (roomId: string) => {
    socket.emit("resume-call", JSON.stringify({ roomId }));
  }

  useEffect(() => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };
    setUserId(userName);
  }, []);

  useEffect(() => {
    try {
      if (userId && userId !== "") {
        const peer = new Peer(userId!, {
          config: {
            iceServers: [
              {
                urls: "turn:relay1.expressturn.com:80",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay1.expressturn.com:443",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay1.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay2.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay3.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay4.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay5.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay6.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay7.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay8.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay9.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay10.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
              {
                urls: "turn:relay11.expressturn.com:3478",
                username: "efE34XGFPG52SHEMJJ",
                credential: "sI43EOvU8Z3d0hFk"
              },
            ]
          }
        });

        peer.on('open', (id: string) => {
          setPeerId(id);
        });

        peer.on('call', (call: MediaConnection) => {
          console.log({ call });
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream: MediaStream) => {
              if (currentUserVideoRef.current) {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play();
              }

              videoCallRef.current = mediaStream.getVideoTracks()[0];

              call.answer(mediaStream);
              call.on('stream', (remoteStream: MediaStream) => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                  remoteVideoRef.current.play();
                }
              });

              mediaConnectionRef.current = call;

              const mimeType = 'video/mp4; codecs=avc1.64001E, mp4a.40.2';

              if (!MediaRecorder.isTypeSupported(mimeType)) {
                console.warn('VP8 not supported, falling back to default WebM settings');
              }

              // Recording Start
              const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

              // Create an array to hold the data chunks
              const chunkQueue: Blob[] = [];
              let isUploading = false;

              const uploadChunk = async () => {
                if (chunkQueue.length === 0 || isUploading) return;

                isUploading = true;
                const chunk = chunkQueue.shift(); // Remove the first chunk from the queue

                const formData = new FormData();
                formData.append("videoChunk", chunk!, "chunk.mp4");
                formData.append("sessionId", currentRoomId.current);
                formData.append("user", "host");

                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-chunk`, {
                    method: "POST",
                    body: formData,
                  });
                  const result = await response.json();
                  uploadedChunks.current.push(result.chunkPath); // Store uploaded chunk path
                } catch (error) {
                  console.error("Error uploading chunk:", error);
                } finally {
                  isUploading = false;
                  uploadChunk(); // Check for the next chunk in the queue
                }
              };

              mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  chunkQueue.push(event.data); // Add the chunk to the queue
                  uploadChunk(); // Start the upload process
                }
              };

              // Start recording, then stop every 2 seconds to prepare for the next chunk
              mediaRecorder.start();

              recordingIntervalRef.current = setInterval(() => {
                if (mediaRecorder.state === "recording") {
                  mediaRecorder.requestData();
                  mediaRecorder.stop();  // Stop to trigger ondataavailable event
                  setTimeout(() => {
                    mediaRecorder.start(); // Start again for the next chunk
                  }, 100);
                }
              }, 2000); // Send video chunks every 2 seconds

              mediaRecorderRef.current = mediaRecorder;
            })
            .catch((err) => {
              console.error("Error accessing media devices.", err);
            });
        });

        peerInstance.current = peer;

        return () => {
          peerInstance.current?.destroy();
        };

      }
    } catch (error) {
      console.error("Invalid or expired token", error);
    }
  }, [userId]);

  const handleToggleCamera = () => {
    console.log(mediaConnectionRef.current?.localStream.getVideoTracks());
    const videoTracks = mediaConnectionRef.current?.localStream.getVideoTracks();
    videoTracks![0].enabled = !videoTracks![0].enabled;
    setCameraOff(!cameraOff);
  };

  const handleToggleMic = () => {
    console.log(mediaConnectionRef.current?.localStream.getAudioTracks());
    const audioTracks = mediaConnectionRef.current?.localStream.getAudioTracks();
    audioTracks![0].enabled = !audioTracks![0].enabled;
    setMicMuted(!micMuted);
  }

  const handleFilterChange = (status: string) => {
    setFilter(status);
  };

  const filteredData = callList.filter((card) => {
    if (filter === "all") return true;
    return card.CallStatus === filter;
  });

  const handleScreenshot = (image: string) => {
    setScreenshotImage((prevImages) =>
      prevImages ? [...prevImages, image] : [image]
    );
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = screenshotImage!.filter((_, i) => i !== index);
    setScreenshotImage(updatedImages);
  };

  const cancelScreenshot = () => {
    if (screenshotImage!.length > 0) {
      setTakeScreenshot(false);
    } else {
      setTakeScreenshot(false);
    }
  }

  const handleCallEnd = async () => {
    if (mediaConnectionRef.current) {
      mediaConnectionRef.current.close();
      mediaConnectionRef.current = null;
    }
    if (currentUserVideoRef.current) {
      currentUserVideoRef.current.srcObject = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Stop recording
      mediaRecorderRef.current = null;
    }

    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setInCall({
      status: false,
      callId: "",
      roomId: ""
    });
    setMicMuted(false);
    setCameraOff(false);
    endCall(inCall.roomId);
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Ended" />));
  }

  const handleCallHold = () => {
    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setInCall({
      status: false,
      callId: "",
      roomId: ""
    });
    setMicMuted(false);
    setCameraOff(false); holdCall(inCall.roomId);
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Put On Hold" />));
  }

  const handleConfirmEndCall = (callId: string, roomId: string) => {
    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setConfirmEndCall({
      status: false,
      callId: "",
      roomId: ""
    });
    endCall(inCall.roomId);
    setInCall({
      status: true,
      callId,
      roomId
    });
    const call = callList.find((call) => call.CallID === roomId);
    if (call?.CallStatus === "New") {
      joinCall(roomId)
    } else {
      resumeCall(roomId);
    }
    toast.custom((t: any) => (<Toast t={t} type="info" content="Call Ended" />));
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Commenced" />));
  }

  const handleConfirmHoldCall = (callId: string, roomId: string) => {
    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setConfirmEndCall({
      status: false,
      callId: "",
      roomId: ""
    });
    holdCall(inCall.roomId);
    setInCall({
      status: true,
      callId,
      roomId
    });
    const call = callList.find((call) => call.CallID === roomId);
    if (call?.CallStatus === "New") {
      joinCall(roomId)
    } else {
      resumeCall(roomId);
    }
    toast.custom((t: any) => (<Toast t={t} type="info" content="Call Put On Hold" />));
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Commenced" />));
  }

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-lg'>CHECK IN HUB</h1>
        </div>
      </div>
    } header={
      <div className="flex gap-2">
        {
          !isRightPanelCollapsed ? (
            <Tooltip tooltip="Collapse Panel" position="bottom">
              <div className="w-fit h-fit rounded-md flex items-center justify-center cursor-pointer hover:bg-highlight p-1" onClick={() => setRightPanelCollapsed(true)}>
                <PanelRightClose className="w-5 h-5" />
              </div>
            </Tooltip>
          ) : (
            <Tooltip tooltip="Open Panel" position="bottom">
              <div className="w-fit h-fit rounded-md flex items-center justify-center cursor-pointer hover:bg-highlight p-1" onClick={() => setRightPanelCollapsed(false)}>
                <PanelRightOpen className="w-5 h-5" />
              </div>
            </Tooltip>
          )
        }
      </div>}
      menu={!inCall.status}
    >
      <div className="w-full h-full flex">
        {/* Left Panel */}
        <div className={`h-[90.5vh] ${isRightPanelCollapsed ? 'w-full pr-0' : 'w-2/3'} transition-all duration-300 ease-in-out`}>
          {inCall.status ? (
            <div className="w-full h-full bg-black rounded-md relative z-0">
              <div className="w-full h-full">
                <video
                  autoPlay
                  loop
                  className="w-full h-full object-cover rounded-md"
                  ref={remoteVideoRef}
                />
              </div>
              <div className="flex flex-col items-center absolute bottom-2 right-2">
                <video ref={currentUserVideoRef} autoPlay muted className="rounded-lg shadow-lg w-64 h-48 object-cover" />
              </div>

              {/* Screenshot Component */}
              {takeScreenshot && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent">
                  <ScreenshotComponent onScreenshotTaken={handleScreenshot} cancelScreenshot={cancelScreenshot} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-foreground border-2 border-border rounded-md mb-20 p-4 flex flex-col space-y-4 justify-center items-center">
              <div>
                <h1 className="font-bold text-2xl text-textAlt">No Ongoing Check Ins</h1>
              </div>
            </div>
          )}
        </div>
        {/* Right Panel */}
        <div className={`transition-all duration-300 ease-in-out ${isRightPanelCollapsed ? 'w-20' : 'w-1/3 pl-2'} h-[90.5vh]`}>
          {/* Summary Section */}
          {!isRightPanelCollapsed && (
            <div className="w-full h-full flex flex-col space-y-2 overflow-hidden">
              <div className="w-full flex space-x-4 p-2 rounded-md border-2 border-border bg-foreground">
                <div
                  className={`w-full h-fit bg-sky-500/30 hover:bg-sky-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "all" ? "border-sky-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("all")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-sky-500 pr-2">
                      <Phone className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{callList.filter(call => call.CallStatus === "On Hold" || call.CallStatus === "New").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-sky-500">CHECK INS</h1>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full h-fit bg-indigo-500/30 hover:bg-indigo-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "On Hold" ? "border-indigo-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("On Hold")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-indigo-500 pr-2">
                      <Pause className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{callList.filter(call => call.CallStatus === "On Hold").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-indigo-500">ON HOLD</h1>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full h-fit bg-orange-500/30 hover:bg-orange-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "New" ? "border-[#FF9300] dark:border-orange-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("New")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-orange-500 pr-2">
                      <PhoneIncoming className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{callList.filter(call => call.CallStatus === "New").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-orange-500">INCOMING</h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`w-full ${inCall.status ? "h-1/2" : "h-full"} overflow-y-auto border-2 border-border rounded-md p-2 bg-foreground`}>
                {/* Grid Section */}
                <div className={`w-full h-full pb-2 grid grid-cols-2 gap-2 auto-rows-min overflow-x-hidden`}>
                  {/* Show Incoming and On Hold Calls in 2 columns when filter is "all" */}
                  {filter === "all" && (
                    <>
                      {(() => {
                        const incomingCalls = callList.filter((card) => card.CallStatus === "New");
                        const holdCalls = callList.filter((card) => card.CallStatus === "On Hold");

                        const interleavedCalls: typeof callList = [];
                        const maxLength = Math.max(incomingCalls.length, holdCalls.length);

                        for (let i = 0; i < maxLength; i++) {
                          if (i < incomingCalls.length) interleavedCalls.push(incomingCalls[i]);
                          if (i < holdCalls.length) interleavedCalls.push(holdCalls[i]);
                        }

                        return interleavedCalls.length > 0 ? (
                          interleavedCalls.map((card, index) => (
                            <CallingCard
                              key={index}
                              title={card.CallPlacedByUserName || ""}
                              status={card.CallStatus || ""}
                              inCall={inCall}
                              setInCall={setInCall}
                              setConfirmEndCall={setConfirmEndCall}
                              joinCall={joinCall}
                              resumeCall={resumeCall}
                              roomId={card.CallID}
                            />
                          ))
                        ) : (
                          <div className="col-span-full w-full rounded-md border-2 border-dashed border-border p-4">
                            <h1 className="text-center text-xl text-textAlt font-bold">No Ongoing Check Ins</h1>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {filter !== "all" && (
                    filteredData.length > 0 ? (
                      filteredData.map((card, index) => (
                        <CallingCard
                          key={index}
                          title={card.CallPlacedByUserName || ""}
                          status={card.CallStatus || ""}
                          inCall={inCall}
                          setInCall={setInCall}
                          setConfirmEndCall={setConfirmEndCall}
                          joinCall={joinCall}
                          resumeCall={resumeCall}
                          roomId={card.CallID}
                        />
                      ))
                    ) : (
                      <div className="col-span-full w-full rounded-md border-2 border-dashed border-border p-4">
                        <h1 className="text-center text-xl text-textAlt font-bold">No Ongoing Check Ins</h1>
                      </div>
                    )
                  )}
                </div>
              </div>
              {inCall.status && (
                <div className="w-full h-full max-h-[50%] flex flex-col space-y-2 justify-between items-center border-2 border-border rounded-md p-2 relative z-50 bg-foreground dark:bg-background">
                  <div className="w-full h-full flex flex-col space-y-2 overflow-y-auto overflow-x-hidden">
                    <div className="w-full flex justify-between items-center sticky top-0 z-50">
                      <div className="flex flex-col">
                        <Chip text="CALL IN PROGRESS" className="border-green-500 text-green-500" />
                        <h1 className="font-bold text-lg">{toTitleCase(inCall?.callId || "")}</h1>
                      </div>
                      <div className="w-fit">
                        <input
                          type="text"
                          placeholder="Booking ID"
                          className="w-full px-2 py-1 rounded-md border-2 border-border bg-foreground outline-none text-text font-semibold placeholder:text-highlight placeholder:font-bold"
                          onChange={(e) => setBookingId(e.target.value)}
                          value={bookingId}
                          id="bookingId"
                        />
                      </div>
                    </div>
                    {/* Image Grid Container */}
                    {screenshotImage.length > 0 ? (
                      <div className="w-full h-full">
                        <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 justify-center items-start">
                          {/* Image Thumbnail */}
                          {screenshotImage.map((image, index) => (
                            <div key={index} className="w-fit max-w-full h-fit max-h-36 relative z-50">
                              <Button
                                className="bg-red-500/60 border border-red-500 hover:bg-red-500 duration-300 rounded-md px-1 p-1 absolute top-0 right-0" color="red" icon={
                                  <Tooltip tooltip="Delete Document" position="top">
                                    <Trash className="w-3 h-3 text-text" />
                                  </Tooltip>
                                } onClick={() => handleDeleteImage(index)} />
                              <div className="w-full h-full flex items-center justify-center object-contain">
                                <ImageViewer src={image}>
                                  <Image
                                    width={1000}
                                    height={1000}
                                    src={image}
                                    alt="Captured Document"
                                    className="max-h-24 object-contain rounded-md"
                                  />
                                </ImageViewer>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col space-y-4 justify-center items-center rounded-md border-2 border-dashed border-border">
                        <h1 className="font-bold text-xl text-highlight">No Document Snapshot</h1>
                      </div>
                    )
                    }
                  </div>
                  <div className="w-full h-fit flex flex-col items-center">
                    {/* Notes */}
                    <div className="w-full">
                      <textarea
                        placeholder="Notes"
                        className="w-full px-2 py-0.5 rounded-md border-2 border-border bg-foreground outline-none text-text font-semibold placeholder:text-highlight placeholder:font-bold"
                        style={{
                          height: "3.5rem",
                          resize: "none"
                        }}
                        onChange={(e) => setCallNotes(e.target.value)}
                        value={callNotes}
                        id="callNotes"
                      />
                    </div>
                    {/* Call Controls */}
                    <div className="w-full h-fit rounded-md flex space-x-2 items-center p-1">
                      <Button color="zinc" icon={<Tooltip tooltip="Add Document">
                        <FilePlus2 className="w-6 h-6" />
                      </Tooltip>} onClick={() => setTakeScreenshot(true)} />
                      <Button
                        className={micMuted ? "bg-orange-500/30 border border-orange-500 hover:bg-orange-500 duration-300 w-full rounded-md px-4 py-2 flex items-center justify-center space-x-1 cursor-pointer" : ""}
                        color={!micMuted ? "zinc" : null}
                        icon={<Tooltip tooltip={micMuted ? "Unmute Mic" : "Mute Mic"}>
                          {
                            !micMuted ?
                              <Mic className="w-6 h-6" />
                              :
                              <MicOff className="w-6 h-6" />
                          }
                        </Tooltip>} onClick={handleToggleMic} />
                      <Button
                        className={cameraOff ? "bg-orange-500/30 border border-orange-500 hover:bg-orange-500 duration-300 w-full rounded-md px-4 py-2 flex items-center justify-center space-x-1 cursor-pointer" : ""}
                        color={!cameraOff ? "zinc" : null}
                        icon={<Tooltip tooltip={cameraOff ? "Turn On Camera" : "Turn Off Camera"}>
                          {!cameraOff ?
                            <Video className="w-6 h-6" />
                            :
                            <VideoOff className="w-6 h-6" />
                          }
                        </Tooltip>} onClick={handleToggleCamera} />
                      <Button color="indigo" icon={<Tooltip tooltip="Hold Call">
                        <Pause className="w-6 h-6" />
                      </Tooltip>} onClick={handleCallHold} />
                      <Button color="red" icon={<Tooltip tooltip="End Call">
                        <PhoneOff className="w-6 h-6" />
                      </Tooltip>} onClick={handleCallEnd} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {isRightPanelCollapsed && (
            <div className="w-full h-full flex flex-col space-y-4 justify-start items-center px-2">
              <div className="w-full h-fit flex flex-col space-y-2 border-b-2 border-b-border pb-2">
                <Tooltip tooltip="All Calls" position="left">
                  <div className="w-full h-fit bg-sky-500/30 hover:bg-sky-500/50 duration-300 p-2 rounded-md flex space-x-1 justify-center items-center cursor-pointer" onClick={() => {
                    setRightPanelCollapsed(false);
                    handleFilterChange("all");
                  }}>
                    <Phone className="w-5 h-5 text-sky-500" />
                    <h1 className="font-bold text-xl">{callList.filter(call => call.CallStatus === "On Hold" || call.CallStatus === "New").length}</h1>
                  </div>
                </Tooltip>
                <Tooltip tooltip="On Hold" position="left">
                  <div className="w-full h-fit bg-indigo-500/30 hover:bg-indigo-500/50 duration-300 p-2 rounded-md flex space-x-2 justify-center items-center cursor-pointer" onClick={() => {
                    setRightPanelCollapsed(false);
                    handleFilterChange("On Hold");
                  }}>
                    <Pause className="w-5 h-5 text-indigo-500" />
                    <h1 className="font-bold text-xl">{callList.filter(call => call.CallStatus === "On Hold").length}</h1>
                  </div>
                </Tooltip>
                <Tooltip tooltip="Incoming" position="left">
                  <div className="w-full h-fit bg-orange-500/30 hover:bg-orange-500/50 duration-300 p-2 rounded-md flex space-x-2 justify-center items-center cursor-pointer" onClick={() => {
                    setRightPanelCollapsed(false);
                    handleFilterChange("incoming");
                  }}>
                    <PhoneIncoming className="w-5 h-5 text-orange-500" />
                    <h1 className="font-bold text-xl">{callList.filter(call => call.CallStatus === "New").length}</h1>
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
          {
            confirmEndCall.status && (
              <Modal title="You Are Still In A Call" onClose={() => setConfirmEndCall({
                status: false,
                callId: "",
                roomId: ""
              })}>
                <div className="w-full h-full flex flex-col gap-4 justify-center">
                  <div>
                    <h1 className="font-medium">Would you like to end or place the call on hold?</h1>
                  </div>
                  <div className="w-full flex justify-between gap-2 border-t-2 border-t-border pt-4">
                    <Button text="Hold Call" color="indigo" icon={<PhoneOff className="w-6 h-6" />} onClick={() => handleConfirmHoldCall(confirmEndCall.callId, confirmEndCall.roomId)} />
                    <Button text="End Call" color="red" icon={<PhoneOff className="w-6 h-6" />} onClick={() => handleConfirmEndCall(confirmEndCall.callId, confirmEndCall.roomId)} />
                  </div>
                </div>
              </Modal>
            )
          }
        </div>
      </div>
      {/* {CallRingComponent} */}
    </Layout>
  );
}

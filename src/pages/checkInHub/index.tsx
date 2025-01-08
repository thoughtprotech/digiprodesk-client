/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { FilePlus2, Headset, Mic, MicOff, PanelRightClose, PanelRightOpen, Pause, Phone, PhoneIncoming, PhoneOff, Trash, Video, VideoOff } from "lucide-react";
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
import { useRouter } from "next/router";
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

  const [userId] = useState<string>(`Host-${Math.floor(Math.random() * 1000)}`);
  const [, setPeerId] = useState<string>('');
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoCallRef = useRef<MediaStreamTrack | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const [callList, setCallList] = useState<{
    from: string,
    roomId: string,
    status: string,
    to: string | null
  }[]>([]);
  const currentRoomId = useRef<string>('');
  const mediaConnectionRef = useRef<MediaConnection | null>(null);
  const uploadedChunks = useRef<string[]>([]); // Store uploaded chunk paths
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize the audio element
    audioRef.current = new Audio('/sounds/call-ringtone.wav');
    audioRef.current.volume = 0.9; // Set volume as needed

    // Cleanup on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const router = useRouter();

  const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
    query: {
      userId,
    },
    withCredentials: true,
  });

  const joinCall = (roomId: string) => {
    currentRoomId.current = roomId;
    socket.emit("join-call", JSON.stringify({ roomId }));
  }

  const endCall = (roomId: string) => {
    socket.emit("end-call", JSON.stringify({ roomId }));

    // Close the PeerJS call if it's active
    if (mediaConnectionRef.current) {
      mediaConnectionRef.current.close();
      mediaConnectionRef.current = null;
    }

    // Close current video streams
    if (currentUserVideoRef.current) {
      currentUserVideoRef.current.srcObject = null;
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
  }

  const resumeCall = (roomId: string) => {
    socket.emit("resume-call", JSON.stringify({ roomId }));
  }

  useEffect(() => {
    const cookies = parseCookies();

    const { userToken } = cookies;

    if (!userToken) {
      router.push("/");
    } else if (userToken !== "host") {
      router.push("/guest");
    } else {
      const peer = new Peer(userId);

      socket.emit("get-call-list");
      socket.on("call-list-update", (data) => {
        console.log(data);

        // Identify new "pending" calls
        const newPendingCalls = data.filter(
          (call: {
            from: string; roomId: string; status: string; to: string | null;
          }) =>
            call.status === "pending" &&
            !callList.some((existingCall) => existingCall.roomId === call.roomId)
        );

        // Log or handle the new pending calls if needed
        console.log("New pending calls:", newPendingCalls);

        if (newPendingCalls.length > 0) {
          // Handle new pending calls here, e.g., show a notification
          if (audioRef.current) {
            audioRef.current.play().catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
          newPendingCalls.map((call: { from: string; roomId: string; status: string; to: string | null; }) => {
            toast.custom((t: any) => (
              <div className={`w-fit h-fit bg-background border-2 border-orange-500 rounded-md absolute top-[3.6rem] ${t.visible ? 'animate-enter' : 'animate-leave'
                }`}>
                <div className="w-full p-2 bg-orange-700/40 flex items-center gap-2">
                  <PhoneIncoming className="w-5 h-5 text-orange-500" />
                  <h1 className="font-bold">
                    Incoming Call From {toTitleCase(call.from)}</h1>
                </div>
              </div>
            ), {
              position: "top-left",
              duration: 10000
            });
          })
        }

        // Update the call list state
        setCallList(data);
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

            videoCallRef.current = mediaStream.getVideoTracks()[0];

            call.answer(mediaStream);
            call.on('stream', (remoteStream: MediaStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play();
              }
            });

            mediaConnectionRef.current = call;
            // Recording Start
            const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp9' });

            // Create an array to hold the data chunks
            let recordedChunks: Blob[] = [];

            mediaRecorder.ondataavailable = async (event) => {
              if (event.data.size > 0) {
                recordedChunks.push(event.data);
              }
            };

            mediaRecorder.onstop = async () => {
              // Once the recording is stopped, create a new blob and send it
              const blob = new Blob(recordedChunks, { type: 'video/webm' });

              const formData = new FormData();
              formData.append("videoChunk", blob, "chunk.webm");
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
                // Reset recorded chunks after sending
                recordedChunks = [];
              }
            };

            // Start recording, then stop every 2 seconds to prepare for next chunk
            mediaRecorder.start();

            setInterval(() => {
              if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();  // Stop to trigger onstop event
                mediaRecorder.start(); // Start again for next chunk
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
  }, []);

  useEffect(() => {
    // If callList gets updated with new calls, console log only those new calls

  }, [callList])

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
    return card.status === filter;
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
    if (bookingId === "") {
      document.getElementById("bookingId")?.focus();
      return toast.custom((t: any) => (<Toast t={t} type="warning" content="Booking ID Required" />));
    }

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

    // try {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/merge-chunks`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ sessionId: currentRoomId.current, user: "host" }),
    //   });
    //   const result = await response.json();
    //   console.log("Merged video path:", result.mergedVideoPath); // Handle the merged video path as needed
    // } catch (error) {
    //   console.error("Error merging video:", error);
    // }

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
    if (bookingId === "") {
      document.getElementById("bookingId")?.focus();
      return toast.custom((t: any) => (<Toast t={t} type="warning" content="Booking ID Required" />));
    }

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
    const call = callList.find((call) => call.roomId === roomId);
    if (call?.status === "pending") {
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
    const call = callList.find((call) => call.roomId === roomId);
    if (call?.status === "pending") {
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
        <div>
          <Headset />
        </div>
        <div>
          <h1 className='font-bold'>CHECK-IN HUB</h1>
        </div>
        <div>
          <h1 className='font-bold text-2xl border-l pl-2 border-l-border'>OLIVE HEAD OFFICE</h1>
        </div>
      </div>
    } header={
      <div>
        {
          !isRightPanelCollapsed ? (
            <Tooltip tooltip="Close Panel" position="bottom">
              <div className="w-fit h-fit rounded-md flex items-center justify-center cursor-pointer" onClick={() => setRightPanelCollapsed(true)}>
                <PanelRightClose className="w-6 h-6" />
              </div>
            </Tooltip>
          ) : (
            <Tooltip tooltip="Open Panel" position="bottom">
              <div className="w-fit h-fit rounded-md flex items-center justify-center cursor-pointer" onClick={() => setRightPanelCollapsed(false)}>
                <PanelRightOpen className="w-6 h-6" />
              </div>
            </Tooltip>
          )
        }
      </div>}>
      <div className="w-full h-full flex">
        {/* Left Panel */}
        <div className={`h-[90.5vh] ${isRightPanelCollapsed ? 'w-full pr-0' : 'w-2/3'} transition-all duration-300 ease-in-out`}>
          {inCall.status ? (
            <div className="w-full h-full bg-black rounded-md relative z-0">
              {/* TODO: Implement Video Feed Below */}
              <div className="w-full h-full">
                <video
                  autoPlay
                  loop
                  className="w-full h-full object-cover rounded-md"
                  ref={remoteVideoRef}
                />
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
                <h1 className="font-bold text-2xl text-textAlt">No Ongoing Call</h1>
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
                      <h1 className="font-bold text-xl">{callList.filter(call => call.status === "onHold" || call.status === "pending").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-sky-500">CALLS</h1>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full h-fit bg-indigo-500/30 hover:bg-indigo-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "onHold" ? "border-indigo-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("onHold")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-indigo-500 pr-2">
                      <Pause className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{callList.filter(call => call.status === "onHold").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-indigo-500">ON HOLD</h1>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full h-fit bg-orange-500/30 hover:bg-orange-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "pending" ? "border-[#FF9300] dark:border-orange-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("pending")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-orange-500 pr-2">
                      <PhoneIncoming className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{callList.filter(call => call.status === "incoming").length}</h1>
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
                        const incomingCalls = callList.filter((card) => card.status === "pending");
                        const holdCalls = callList.filter((card) => card.status === "onHold");

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
                              title={card.from}
                              status={card.status}
                              inCall={inCall}
                              setInCall={setInCall}
                              setConfirmEndCall={setConfirmEndCall}
                              joinCall={joinCall}
                              resumeCall={resumeCall}
                              roomId={card.roomId}
                            />
                          ))
                        ) : (
                          <div className="col-span-full w-full rounded-md border-2 border-dashed border-border p-4">
                            <h1 className="text-center text-xl text-textAlt font-bold">No Calls In Progress</h1>
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
                          title={card.from}
                          status={card.status}
                          inCall={inCall}
                          setInCall={setInCall}
                          setConfirmEndCall={setConfirmEndCall}
                          joinCall={joinCall}
                          resumeCall={resumeCall}
                          roomId={card.roomId}
                        />
                      ))
                    ) : (
                      <div className="col-span-full w-full rounded-md border-2 border-dashed border-border p-4">
                        <h1 className="text-center text-xl text-textAlt font-bold">No Calls In Progress</h1>
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
                        <h1 className="font-bold text-lg">{toTitleCase(inCall.callId || "")}</h1>
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
                  <div className="w-full h-fit bg-green-500/30 hover:bg-green-500/50 duration-300 p-2 rounded-md flex space-x-1 justify-center items-center cursor-pointer" onClick={() => {
                    setRightPanelCollapsed(false);
                    handleFilterChange("all");
                  }}>
                    <Phone className="w-5 h-5 text-green-500" />
                    <h1 className="font-bold text-xl">12</h1>
                  </div>
                </Tooltip>
                <Tooltip tooltip="On Hold" position="left">
                  <div className="w-full h-fit bg-indigo-500/30 hover:bg-indigo-500/50 duration-300 p-2 rounded-md flex space-x-2 justify-center items-center cursor-pointer" onClick={() => {
                    setRightPanelCollapsed(false);
                    handleFilterChange("onHold");
                  }}>
                    <Pause className="w-5 h-5 text-indigo-500" />
                    <h1 className="font-bold text-xl">6</h1>
                  </div>
                </Tooltip>
                <Tooltip tooltip="Incoming" position="left">
                  <div className="w-full h-fit bg-orange-500/30 hover:bg-orange-500/50 duration-300 p-2 rounded-md flex space-x-2 justify-center items-center cursor-pointer" onClick={() => {
                    setRightPanelCollapsed(false);
                    handleFilterChange("incoming");
                  }}>
                    <PhoneIncoming className="w-5 h-5 text-orange-500" />
                    <h1 className="font-bold text-xl">6</h1>
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
    </Layout>
  );
}

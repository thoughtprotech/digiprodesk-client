/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import {
  CircleDot,
  Fullscreen,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  PhoneOutgoing,
  RefreshCcw,
  User as UserIcon,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { parseCookies } from "nookies";
import { Call, Location, User } from "@/utils/types";
import SearchInput from "@/components/ui/Search";
import { CallContext } from "@/context/CallContext";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import {
  AudioTrack,
  LiveKitRoom,
  TrackToggle,
  useTracks,
  VideoTrack,
  TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useSocket } from "@/context/SocketContext";
import { io } from "socket.io-client";
import generateUUID from "@/utils/uuidGenerator";
import jwt from "jsonwebtoken";
import logOut from "@/utils/logOut";
import Tooltip from "@/components/ui/ToolTip";

export default function Index() {
  const [userLocationListData, setUserLocationListData] = useState<Location[]>(
    []
  );
  const [filteredUserLocationData, setFilteredUserLocationData] = useState<
    Location[]
  >([]);
  const [userList, setUserList] = useState<User[]>([]);

  const { setCallId: setGuestCallId } = useContext(CallContext);

  const router = useRouter();

  const fetchUserLocationList = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList/property`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        setUserLocationListData(data);
        setFilteredUserLocationData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserList = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        setUserList(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filterUserLocationList = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const searchValue = event.target.value;
    const filteredUserList = userLocationListData.filter((loc) =>
      loc.LocationName.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUserLocationData(filteredUserList);
  };

  const handleCallGuest = (locationId: number) => {
    const guestId = userList.find(
      (user) => user.LocationID === locationId
    )?.UserName;
    if (!guestId) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Location Not Mapped To This User" type="error" />
      ));
    } else {
      setGuestCallId(guestId);
      router.push("/checkInHub");
    }
  };

  useEffect(() => {
    fetchUserLocationList();
    fetchUserList();
  }, []);

  return (
    <Layout
      headerTitle={
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-bold text-lg">WATCH HUB</h1>
          </div>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col gap-2 bg-background px-2">
        <div className="w-full flex justify-between items-center gap-2 border-b border-b-border pb-2">
          <div className="w-64 flex gap-1">
            <SearchInput
              placeholder="Locations"
              onChange={filterUserLocationList}
            />
          </div>
        </div>
        <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch">
          {filteredUserLocationData.map((location, index) => (
            // <VideoViewer
            //   key={index}
            //   title={location.LocationName}
            //   src={location?.LocationVideoFeed || ""}
            //   component={
            //     <Button
            //       text="Call"
            //       color="green"
            //       icon={<PhoneOutgoing className="w-5 h-5" />}
            //       onClick={handleCallGuest.bind(null, location.LocationID!)}
            //     />
            //   }
            // >
            //   <WatchCard
            //     title={location.LocationName}
            //     src={location?.LocationVideoFeed}
            //     onClick={handleCallGuest.bind(null, location.LocationID!)}
            //   />
            // </VideoViewer>
            <div
              key={location.LocationID}
              className="relative bg-black rounded overflow-hidden"
            >
              <PropertyFeed
                roomName={location.LocationID?.toString()!}
                label={location.LocationName!}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function PropertyFeed({
  roomName,
  label,
}: {
  roomName: string;
  label: string;
}) {
  const [wsUrl, setWsUrl] = useState<string>();
  const [token, setToken] = useState<string>();

  const [isRecording, setIsRecording] = useState(false);
  const [egressId, setEgressId] = useState(false);
  const [user, setUser] = useState<User>();
  const router = useRouter();

  const fetchUserDetails = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          setUser(data);
        });
      } else if (response.status === 401) {
        logOut(router);
      } else {
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching User Details" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching User Details" />
      ));
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        `/api/livekit/token?identity=${user?.UserName}&room=${roomName}`
    )
      .then((r) => r.json())
      .then(({ wsUrl, token }) => {
        setWsUrl(wsUrl);
        setToken(token);
      })
      .catch(console.error);
  }, [roomName, user]);

  if (!wsUrl || !token) return null;

  const toggleRecording = async (callId: any) => {
    if (!isRecording) {
      try {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, "-"); // e.g., "2025-05-10T14-30-15-123Z"
        const fileName = `${callId}`;
        const response = await fetch(
          process.env.NEXT_PUBLIC_STARTRECORDING_API!,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              room: roomName,
              fileName: fileName,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          setIsRecording(true);
          setEgressId(data.egressId);
        } else {
          console.error("Failed to start recording:", data.error);
        }
      } catch (error) {
        console.error("Error starting recording:", error);
      }
    } else {
      await fetch(process.env.NEXT_PUBLIC_STOPRECORDING_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ egressId }),
      });

      setIsRecording(false);
    }
  };

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connectOptions={{
        autoSubscribe: true,
      }}
      video={true}
      audio={true}
    >
      <div className="relative w-full h-fit">
        <VideoGrid
          roomName={roomName}
          label={label}
          toggleRecording={toggleRecording}
          isRecording={isRecording}
        />
        <div className="absolute top-3 left-2 bg-black bg-opacity-50 items-center text-white text-sm font-medium px-2 py-1 rounded flex gap-2">
          {label}
          <Mic className="w-5 h-5" />
        </div>
      </div>
    </LiveKitRoom>
  );
}

function VideoGrid({
  roomName,
  toggleRecording,
  isRecording,
  label,
}: {
  roomName: string;
  toggleRecording: any;
  isRecording: boolean;
  label: string;
}) {
  const tracks = useTracks();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { socket } = useSocket();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isRemoteMuted, setIsRemoteMuted] = useState<boolean>(false);
  const [currentCallID, setCurrentCallID] = useState<string>("");
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const modalAudioRef = useRef<HTMLAudioElement>(null);
  const [showPersonIcon, setShowPersonIcon] = useState(false);
  const personIconTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<User>();
  const router = useRouter();

  useEffect(() => {
    if (isFullscreen) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ""; // Most browsers ignore this but it's required
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
          e.preventDefault();
          console.log("Refresh blocked");
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isFullscreen]);

  const fetchUserDetails = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          setUser(data);
        });
      } else if (response.status === 401) {
        logOut(router);
      } else {
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching User Details" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching User Details" />
      ));
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (!user) return;
    socketRef.current = socket;

    socketRef.current?.on("participant-muted-request", (data) => {
      if (data.locationID === roomName) {
        setIsRemoteMuted(data.isMuted);
      }
    });

    socketRef.current?.on("person-detected-request", (data) => {
      if (data.locationID === roomName) {
        if (data.detected) {
          setShowPersonIcon(true);

          // Clear old timer and restart 30s timer
          if (personIconTimerRef.current) {
            clearTimeout(personIconTimerRef.current);
          }

          personIconTimerRef.current = setTimeout(() => {
            setShowPersonIcon(false);
          }, 30000);
        } else {
          setShowPersonIcon(false); // Optional: hide icon early if person left
          if (personIconTimerRef.current) {
            clearTimeout(personIconTimerRef.current);
            personIconTimerRef.current = null;
          }
        }
      }
    });

    socketRef.current?.on("call-list-update", (data) => {
      data.map((call: Call) => {
        if (
          call.AssignedToUserName === user.UserName &&
          call.CallStatus === "New" &&
          call.CallPlacedByLocationID?.toString() === roomName
        ) {
          setShowModal(true);
          setIncomingCall(call);
        }
      });
    });

    socketRef.current?.on("call-missed", (data) => {
      if (
        data.CallAssignedTo === user.UserName &&
        data.CallStatus === "Missed"
      ) {
        setShowModal(false);
        setIncomingCall(null);
      }
    });
  }, [socket, user]);

  const attendCall = () => {
    setShowModal(false);
    setIsFullscreen(true);
    setIsRemoteMuted(false);
    setCurrentCallID(incomingCall?.CallID!);
    socketRef.current?.emit(
      "join-call",
      JSON.stringify({ roomId: incomingCall?.CallID })
    );
    setIncomingCall(null);
  };

  const handleRefresh = (data: any) => {
    socketRef.current?.emit(
      "location-refresh",
      JSON.stringify({ locationID: data })
    );
  };

  const handleStartCall = async (data: any) => {
    if (user) {
      const uuid = generateUUID();
      setCurrentCallID(uuid);
      socketRef.current?.emit(
        "start-call",
        JSON.stringify({ locationID: data, callId: uuid })
      );
      setIsFullscreen(true);
      setIsRemoteMuted(false);
    }
  };

  const handleEndCall = async (data: any) => {
    if (isRecording) {
      toggleRecording();
    }
    setCurrentCallID("");
    socketRef.current?.emit(
      "call-end",
      JSON.stringify({ locationID: data, callId: currentCallID })
    );
    setIsFullscreen(false);
  };

  const remoteVideoTracks = tracks.filter(
    (t) =>
      t.publication.kind === "video" &&
      t.publication.isSubscribed &&
      !t.participant.isLocal &&
      t.participant.identity.includes("guest")
  );

  const localVideoTrack = tracks.find(
    (t) =>
      t.publication.kind === "video" &&
      t.publication.isSubscribed &&
      t.participant.isLocal &&
      t.publication.source === Track.Source.Camera
  );

  const remoteAudioTracks = tracks.filter(
    (t) =>
      t.publication.kind === "audio" &&
      t.publication.isSubscribed &&
      !t.participant.isLocal
  );

  const sendMuteRequest = (roomName: string) => {
    socketRef.current?.emit(
      "mute-participant",
      JSON.stringify({ locationID: roomName, isMuted: !isRemoteMuted })
    );
    setIsRemoteMuted((prev) => !prev);
  };
  const renderAudioTracks = () =>
    remoteAudioTracks.map((trackRef: TrackReferenceOrPlaceholder) => (
      <AudioTrack key={trackRef.publication.trackSid} trackRef={trackRef} />
    ));

  useEffect(() => {
    const audioEl = modalAudioRef.current;
    if (!audioEl) return;

    if (showModal) {
      // rewind and play
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {
        /* handle autoplay-blocked if needed */
      });
    } else {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  }, [showModal]);

  return (
    <>
      <div
        className={`relative w-full h-fit ${isFullscreen ? "hidden" : "block"}`}
      >
        {remoteVideoTracks.map((trackRef: any) => (
          <VideoTrack
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            className="inset-0 w-full h-full object-cover"
          />
        ))}
        {showPersonIcon && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-white bg-black/60 px-2 py-0.5 rounded z-10">
            <UserIcon className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-medium">Person Detected</span>
          </div>
        )}
        {/* Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Tooltip tooltip="Call" position="left">
            <div
              className="hover:bg-green-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
              onClick={() => handleStartCall(roomName)}
            >
              <PhoneOutgoing className="text-green-500" />
            </div>
          </Tooltip>
          <Tooltip tooltip="Fullscreen" position="left">
            <div className="hover:bg-gray-500/30 px-2 py-1 rounded-md cursor-pointer duration-300">
              <Fullscreen className="" />
            </div>
          </Tooltip>
          {/* <Tooltip tooltip="Record" position="left">
            <div className="hover:bg-orange-500/30 px-2 py-1 rounded-md cursor-pointer duration-300">
              <CircleDot className="text-orange-500" />
            </div>
          </Tooltip> */}
          <Tooltip tooltip="Refresh" position="left">
            <div
              className="hover:bg-blue-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
              onClick={() => handleRefresh(roomName)}
            >
              <RefreshCcw className="text-blue-500" />
            </div>
          </Tooltip>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center gap-5">
          <div className="relative w-3/4 h-fit max-h-screen flex justify-center">
            {remoteVideoTracks.map((trackRef: any) => (
              <VideoTrack
                key={trackRef.publication.trackSid}
                trackRef={trackRef}
                className="w-full h-full object-contain rounded-md"
              />
            ))}

            {renderAudioTracks()}
            <div className="absolute top-0 left-0 w-full flex bg-black/70 justify-start">
              <div className="w-full max-w-2xl flex items-center gap-5 px-4 py-1 rounded-md">
                <div>
                  <h1 className="font-bold text-2xl">{label}</h1>
                </div>
                <div className="flex items-center gap-5">
                  <div
                    onClick={() => {
                      sendMuteRequest(roomName);
                    }}
                    className="cursor-pointer rounded-md px-6 py-1 bg-highlight"
                  >
                    {isRemoteMuted ? <MicOff /> : <Mic />}
                  </div>
                  {/* <div className="cursor-pointer rounded-md px-6 py-2 bg-highlight">
                    <Video />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="w-fit max-w-md p-4 rounded-md flex flex-col items-center gap-4">
            <div className="w-full flex items-center gap-2 justify-between">
              <div
                // onClick={() => handleEndCall(roomName)}
                className="bg-highlight bg-opacity-50 text-white text-sm font-medium px-6 py-2 rounded"
              >
                <TrackToggle
                  source={Track.Source.Microphone}
                  onDeviceError={(error) => {
                    toast.custom(() => (
                      <div className="bg-red-500 text-white px-4 py-2 rounded">
                        Microphone error: {error?.message || "Unknown error"}
                      </div>
                    ));
                  }}
                  style={{ color: "white", scale: 1.5 }}
                  className="w-7 h-7 flex items-center justify-center"
                />
              </div>
              <div
                // onClick={() => handleEndCall(roomName)}
                className="bg-highlight bg-opacity-50 text-white text-sm font-medium px-6 py-2 rounded flex item-center justify-center"
              >
                <TrackToggle
                  source={Track.Source.Camera}
                  style={{ color: "white", scale: 1.7 }}
                  // onClick={() => setAudioMuted((prev) => !prev)}
                  className="w-7 h-7 flex items-center justify-center"
                />
                {/* <Video className="w-7 h-7" /> */}
              </div>
              <button
                onClick={() => toggleRecording(currentCallID)}
                className={`${
                  isRecording ? "bg-orange-500" : "bg-highlight"
                } bg-opacity-50 text-white text-sm font-medium px-6 py-2 rounded`}
              >
                <CircleDot className="w-7 h-7" />
              </button>
              <button
                onClick={() => handleEndCall(roomName)}
                className="bg-red-500 bg-opacity-50 text-white text-sm font-medium px-6 py-2 rounded"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
            {/* local preview in bottom-right */}
            {localVideoTrack && (
              <div className="bottom-4 right-4 max-w-96 aspect-video rounded-md overflow-hidden">
                <VideoTrack
                  trackRef={localVideoTrack}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
      <audio
        ref={modalAudioRef}
        src="/sounds/call-ringtone.mp3" // point to your audio file
        preload="auto"
        style={{ display: "none" }}
      />
      {showModal && (
        <div className="fixed inset-0 top-0 bottom-0 right-0 left-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="w-fit max-w-2xl bg-foreground shadow-lg rounded-lg p-4 flex flex-col gap-5 items-center">
            <div className="w-full border-b border-b-border pb-2">
              <h1 className="text-center text-orange-500 uppercase font-bold">
                Incoming Call
              </h1>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-full">
                <img
                  src={`/images/incomingCall.gif`}
                  alt="User Profile"
                  className="w-28 h-28 object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="font-bold text-3xl whitespace-nowrap">
                  {incomingCall?.CallPlacedByLocationName}
                </h1>
              </div>
            </div>
            <div className="w-full">
              <button
                className="w-full px-4 py-2 flex justify-center rounded-md bg-green-500/50"
                onClick={() => attendCall()}
              >
                <PhoneCall />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

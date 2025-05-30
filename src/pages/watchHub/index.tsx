/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-asserted-optional-chain */
import Layout from "@/components/Layout";
import {
  CircleDot,
  FilterXIcon,
  MapPin,
  Maximize,
  Mic,
  MicOff,
  Minimize,
  Pause,
  Phone,
  PhoneCall,
  PhoneCallIcon,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  Play,
  RefreshCcw,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseCookies } from "nookies";
import { Call, Location, User } from "@/utils/types";
import SearchInput from "@/components/ui/Search";
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
import {
  useLocalParticipant,
  ConnectionQualityIndicator,
} from "@livekit/components-react";
import { useRoomContext } from "@livekit/components-react";

export default function Index() {
  const [userLocationListData, setUserLocationListData] = useState<Location[]>(
    []
  );
  const [filteredUserLocationData, setFilteredUserLocationData] = useState<
    Location[]
  >([]);

  const [inCall, setInCall] = useState<boolean>(false);
  const [, setCallList] = useState<Call[]>();
  const { socket } = useSocket();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [locationsOnline, setLocationsOnline] = useState<number>(0);
  const [filters, setFilters] = useState<{
    onHold: string[];
    missed: string[];
    guests: string[];
  }>({
    onHold: [],
    missed: [],
    guests: [],
  });
  const [filter, setFilter] = useState<{
    status: boolean;
    type: "missed" | "onHold" | "guestCount" | "none";
  }>({
    status: false,
    type: "none",
  });

  const filterLocations = async (type: "missed" | "onHold" | "guestCount") => {
    switch (type) {
      case "missed":
        setFilteredUserLocationData((prev) =>
          prev.filter((loc) =>
            filters.missed.includes(loc.LocationID?.toString()!)
          )
        );
        setFilter({
          status: true,
          type: "missed",
        });
        break;
      case "onHold":
        setFilteredUserLocationData((prev) =>
          prev.filter((loc) =>
            filters.onHold.includes(loc.LocationID?.toString()!)
          )
        );
        setFilter({
          status: true,
          type: "onHold",
        });
        break;
      case "guestCount":
        setFilteredUserLocationData((prev) =>
          prev.filter((loc) =>
            filters.guests.includes(loc.LocationID?.toString()!)
          )
        );
        setFilter({
          status: true,
          type: "guestCount",
        });
        break;
    }
  };

  const clearFilter = () => {
    setFilteredUserLocationData(userLocationListData);
    setFilter({
      status: false,
      type: "none",
    });
  };

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

  const filterUserLocationList = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const searchValue = event.target.value;
    const filteredUserList = userLocationListData.filter((loc) =>
      loc.LocationName.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUserLocationData(filteredUserList);
  };

  useEffect(() => {
    fetchUserLocationList();
  }, []);

  useEffect(() => {
    console.log({ filteredUserLocationData });
  }, [filteredUserLocationData]);

  useEffect(() => {
    getCallList();
  }, [socket, socketRef.current]);

  useEffect(() => {
    if (socket) {
      socketRef.current = socket;
    }
  }, [socket]);

  useEffect(() => {
    console.log({ filters });
  }, [filters]);

  const getCallList = () => {
    socketRef.current?.emit("get-calls");
  };

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
      <div className="w-full flex-1 flex flex-col gap-2 px-2">
        <div className="w-full flex justify-between items-center gap-2 border-b border-b-border pb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <SearchInput
                placeholder="Locations"
                onChange={filterUserLocationList}
              />
            </div>
            <div
              className={`w-fit h-fit bg-purple-500/30 hover:bg-purple-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer`}
            >
              <div className="flex space-x-2 items-center">
                <div className="border-r-2 border-r-purple-500 pr-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-xl">{locationsOnline}</h1>
                  <h1 className="w-fit text-[0.65rem] font-bold text-purple-500">
                    Location(s) Online
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="relative">
              <div
                className={`w-full h-fit bg-orange-500/30 hover:bg-orange-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer relative`}
                onClick={() => filterLocations("guestCount")}
              >
                <div className="flex space-x-2 items-center">
                  <div className="border-r-2 border-r-orange-500 pr-2">
                    <Phone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-xl">{guestCount}</h1>
                    <h1 className="w-fit text-[0.65rem] font-bold text-orange-500">
                      Guest(s) Detected
                    </h1>
                  </div>
                </div>
              </div>
              {filter.status && filter.type === "guestCount" && (
                <div
                  className="absolute -top-1 -right-1 cursor-pointer"
                  onClick={clearFilter}
                >
                  <XCircle className="w-4 h-4 text-orange-500" />
                </div>
              )}
            </div>
            <div className="relative">
              <div
                className={`w-full h-fit bg-indigo-500/30 hover:bg-indigo-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer`}
                onClick={() => filterLocations("onHold")}
              >
                <div className="flex space-x-2 items-center">
                  <div className="border-r-2 border-r-indigo-500 pr-2">
                    <PhoneIncoming className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-xl">
                      {filters.onHold.length}
                    </h1>
                    <h1 className="w-fit text-[0.65rem] font-bold text-indigo-500">
                      Calls On Hold
                    </h1>
                  </div>
                </div>
              </div>
              {filter && filter.type === "onHold" && (
                <div
                  className="absolute -top-1 -right-1 cursor-pointer"
                  onClick={clearFilter}
                >
                  <XCircle className="w-4 h-4 text-indigo-500" />
                </div>
              )}
            </div>
            <div className="relative">
              <div
                className={`w-full h-fit bg-red-500/30 hover:bg-red-700/40 duration-300 rounded-md p-2 py-0.5 cursor-pointer`}
                onClick={() => filterLocations("missed")}
              >
                <div className="flex space-x-2 items-center">
                  <div className="border-r-2 border-r-red-500 pr-2">
                    <PhoneCallIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-xl">
                      {filters.missed.length}
                    </h1>
                    <h1 className="w-fit text-[0.65rem] font-bold text-red-500">
                      Missed Calls
                    </h1>
                  </div>
                </div>
              </div>
              {filter && filter.type === "missed" && (
                <div
                  className="absolute -top-1 -right-1 cursor-pointer"
                  onClick={clearFilter}
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredUserLocationData.map((location) => (
            <div
              key={location.LocationID}
              className="relative bg-black rounded overflow-hidden aspect-video"
            >
              <PropertyFeed
                roomName={location.LocationID?.toString()!}
                label={location.LocationName!}
                inCall={inCall}
                setInCall={setInCall}
                setCallList={setCallList}
                setGuestCount={setGuestCount}
                setLocationsOnline={setLocationsOnline}
                setFilters={setFilters}
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
  inCall,
  setInCall,
  setCallList,
  setGuestCount,
  setLocationsOnline,
  setFilters,
}: {
  roomName: string;
  label: string;
  inCall: boolean;
  setInCall: any;
  setCallList: any;
  setGuestCount: any;
  setLocationsOnline: any;
  setFilters: any;
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

  if (!wsUrl || !token)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading...
      </div>
    );

  const toggleRecording = async (callId: any) => {
    if (!isRecording) {
      try {
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
          inCall={inCall}
          setInCall={setInCall}
          setCallList={setCallList}
          setGuestCount={setGuestCount}
          setLocationsOnline={setLocationsOnline}
          setFilters={setFilters}
        />
      </div>
    </LiveKitRoom>
  );
}

function VideoGrid({
  roomName,
  toggleRecording,
  isRecording,
  label,
  inCall,
  setInCall,
  setCallList,
  setGuestCount,
  setLocationsOnline,
  setFilters,
}: {
  roomName: string;
  toggleRecording: any;
  isRecording: boolean;
  label: string;
  inCall: boolean;
  setInCall: any;
  setCallList: any;
  setGuestCount: any;
  setLocationsOnline: any;
  setFilters: any;
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
  const [isSelfMuted, setIsSelfMuted] = useState<boolean>(true);
  const [isSelfDisabled, setIsSelfDisabled] = useState<boolean>(false);
  const [isSelfCamera, setIsSelfCamera] = useState<boolean>(false);
  const router = useRouter();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [status, setStatus] = useState<"none" | "missed" | "onHold" | "inCall">(
    "none"
  );

  useEffect(() => {
    if (!room) return;

    // Wait until fully connected
    const handleConnected = () => {
      room.localParticipant.setMicrophoneEnabled(false);
      console.log("Mic muted after connection");
    };

    room.on("connected", handleConnected);

    return () => {
      room.off("connected", handleConnected);
    };
  }, [room]);

  useEffect(() => {
    setGuestCount((prev: number) => {
      if (showPersonIcon) {
        return prev + 1;
      } else {
        return Math.max(prev - 1, 0); // Prevent negative guestCount
      }
    });
  }, [showPersonIcon]);

  useEffect(() => {
    if (showPersonIcon) {
      setFilters((prev: { guests: never[] }) => {
        const guests: any = prev?.guests || [];
        const newId = roomName;

        // Only add if it's not already in the array
        if (!guests.includes(newId)) {
          return {
            ...prev,
            guests: [...guests, newId],
          };
        }
        // No change needed
        return prev;
      });
    } else {
      setFilters((prev: any) => ({
        ...prev,
        guests: prev?.guests.filter((p: string) => p !== roomName),
      }));
    }
  }, [showPersonIcon]);

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
      setIsSelfMuted(true);
    }
  }, [localParticipant]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      const { type, payload } = event.data;
      if (type === "CALL_STARTED") {
        const shouldMute = payload.roomName !== roomName;
        setIsSelfMuted(shouldMute);
        setIsSelfDisabled(shouldMute);
        localParticipant.setMicrophoneEnabled(!shouldMute);
      } else if (type === "CALL_ENDED") {
        setIsSelfDisabled(false);
        setIsSelfMuted(true);
        localParticipant.setMicrophoneEnabled(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [roomName]);

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
    getCallList();
  }, [user]);

  const getCallList = () => {
    socketRef.current?.emit("get-call-list");
  };

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
      setCallList(data);
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
        console.log({ data });
        setShowModal(false);
        setIncomingCall(null);
        setStatus("missed");
        setFilters((prev: { missed: never[] }) => {
          const missed: any = prev?.missed || [];
          const newId = data.CallPlacedByLocationID.toString()!;

          // Only add if it's not already in the array
          if (!missed.includes(newId)) {
            return {
              ...prev,
              missed: [...missed, newId],
            };
          }
          // No change needed
          return prev;
        });

        socketRef.current?.emit("get-calls");
      }
    });
  }, [socket, user]);

  const attendCall = () => {
    setShowModal(false);
    if (isRecording) {
      toggleRecording();
    }
    setStatus("inCall");
    setFilters((prev: any) => ({
      ...prev,
      missed: prev?.missed.filter((p: string) => p !== roomName),
    }));

    setIsRemoteMuted(false);
    setCurrentCallID(incomingCall?.CallID!);
    setInCall(true);
    socketRef.current?.emit(
      "join-call",
      JSON.stringify({ roomId: incomingCall?.CallID })
    );
    setIncomingCall(null);
    window.postMessage(
      {
        type: "CALL_STARTED",
        payload: {
          roomName: roomName, // or call ID
        },
      },
      "*" // Consider restricting to origin: window.origin
    );
  };

  const holdCall = () => {
    if (isRecording) {
      toggleRecording();
    }
    setStatus("onHold");
    setFilters((prev: { onHold: never[] }) => {
      const onHold: any = prev?.onHold || [];
      const newId = roomName;

      // Only add if it's not already in the array
      if (!onHold.includes(newId)) {
        return {
          ...prev,
          onHold: [...onHold, newId],
        };
      }
      // No change needed
      return prev;
    });

    if (inCall) {
      setInCall(false);
    }
    socketRef.current?.emit(
      "hold-call",
      JSON.stringify({ roomId: currentCallID })
    );
    window.postMessage(
      {
        type: "CALL_ON_HOLD",
        payload: {
          roomName: roomName, // or call ID
        },
      },
      "*" // Consider restricting to origin: window.origin
    );
  };

  const holdIncomingCall = () => {
    if (isRecording) {
      toggleRecording();
    }
    setStatus("onHold");
    setFilters((prev: { onHold: never[] }) => {
      const onHold: any = prev?.onHold || [];
      const newId = roomName;

      // Only add if it's not already in the array
      if (!onHold.includes(newId)) {
        return {
          ...prev,
          onHold: [...onHold, newId],
        };
      }
      // No change needed
      return prev;
    });

    if (inCall) {
      setInCall(false);
    }
    socketRef.current?.emit(
      "hold-call",
      JSON.stringify({ roomId: incomingCall?.CallID })
    );
    window.postMessage(
      {
        type: "CALL_ON_HOLD",
        payload: {
          roomName: roomName, // or call ID
        },
      },
      "*" // Consider restricting to origin: window.origin
    );
  };

  const resumeCall = async (data: any) => {
    if (!inCall) {
      console.log({ currentCallID });
      console.log(incomingCall?.CallID);
      if (user) {
        if (isRecording) {
          toggleRecording();
        }
        setStatus("inCall");
        console.log({ roomName });
        setFilters((prev: any) => ({
          ...prev,
          onHold: prev?.onHold.filter((p: string) => p !== roomName),
        }));

        setCurrentCallID(currentCallID || incomingCall?.CallID!);
        setInCall(true);
        socketRef.current?.emit(
          "resume-call",
          JSON.stringify({
            locationID: data,
            callId: currentCallID || incomingCall?.CallID!,
          })
        );
        // setIsFullscreen(true);
        setIsRemoteMuted(false);
        window.postMessage(
          {
            type: "CALL_STARTED",
            payload: {
              roomName: roomName, // or call ID
            },
          },
          "*" // Consider restricting to origin: window.origin
        );
      }
    } else {
      toast.custom((t: any) => (
        <Toast t={t} content="End Current Call" type="warning" />
      ));
    }
  };

  const handleRefresh = (data: any) => {
    socketRef.current?.emit(
      "location-refresh",
      JSON.stringify({ locationID: data })
    );
  };

  const handleStartCall = async (data: any) => {
    if (!inCall) {
      console.log({ currentCallID });
      if (user) {
        if (isRecording) {
          toggleRecording();
        }
        setStatus("inCall");
        setFilters((prev: any) => ({
          ...prev,
          missed: prev?.missed.filter((p: string) => p !== roomName),
        }));

        const uuid = generateUUID();
        setCurrentCallID(uuid);
        setInCall(true);
        socketRef.current?.emit(
          "start-call",
          JSON.stringify({ locationID: data, callId: uuid })
        );
        // setIsFullscreen(true);
        setIsRemoteMuted(false);
        window.postMessage(
          {
            type: "CALL_STARTED",
            payload: {
              roomName: roomName, // or call ID
            },
          },
          "*" // Consider restricting to origin: window.origin
        );
      }
    } else {
      toast.custom((t: any) => (
        <Toast t={t} content="End Current Call" type="warning" />
      ));
    }
  };

  const handleEndCall = async (data: any) => {
    if (isRecording) {
      toggleRecording();
    }
    setInCall(false);
    setStatus("none");
    setCurrentCallID("");
    socketRef.current?.emit(
      "call-end",
      JSON.stringify({ locationID: data, callId: currentCallID })
    );
    window.postMessage(
      {
        type: "CALL_ENDED",
        payload: {
          roomName: roomName, // or call ID
        },
      },
      "*" // Consider restricting to origin: window.origin
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
      <AudioTrack
        key={trackRef.publication.trackSid}
        trackRef={trackRef}
        muted={isRemoteMuted}
      />
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

  useEffect(() => {
    if (remoteVideoTracks.length === 0) {
      setLocationsOnline((prev: number) => Math.max(prev - 1, 0)); // prevent negative count
    } else {
      setLocationsOnline((prev: number) => prev + 1);
    }
  }, [remoteVideoTracks.length]);

  if (remoteVideoTracks.length === 0) {
    return (
      <div className="w-full h-full flex aspect-video items-center justify-center relative">
        <div className="text-xs font-semibold truncate text-ellipsis absolute top-2 left-2">
          {label}
        </div>
        <div className="text-xl text-gray-500 font-semibold truncate text-ellipsis">
          <h1>Location Offline</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative w-full h-full flex justify-center items-center aspect-video ${
          isFullscreen ? "hidden" : "block"
        }`}
      >
        {remoteVideoTracks.map((trackRef: any) => (
          <VideoTrack
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            className="inset-0 w-full h-full object-cover"
          />
        ))}
        {renderAudioTracks()}
        <div className="absolute top-[2px] left-[2px] bg-black bg-opacity-50 items-center text-white text-sm font-medium pl-2 rounded flex">
          <div className="text-xs font-semibold truncate text-ellipsis">
            {label}
          </div>
          <div className="flex flex-row-reverse items-center">
            <Tooltip
              tooltip={isRemoteMuted ? "Unmute" : "Mute"}
              position="bottom"
            >
              <div
                className="hover:bg-blue-500/30 rounded-md cursor-pointer duration-300 px-1 py-1"
                onClick={() => sendMuteRequest(roomName)}
              >
                {isRemoteMuted ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </div>
            </Tooltip>
            {currentCallID.length === 0 && (
              <Tooltip tooltip="Refresh" position="bottom">
                <div
                  className="hover:bg-blue-500/30 rounded-md cursor-pointer duration-300 px-1 py-1"
                  onClick={() => handleRefresh(roomName)}
                >
                  <RefreshCcw className="text-cyan-400 w-4 h-4" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        {/* Controls */}
        <div className="absolute top-[2px] right-[2px] flex bg-black bg-opacity-50 rounded-md">
          {status === "inCall" && (
            <div className="flex">
              <Tooltip
                tooltip={isSelfCamera ? "Camera On" : "Camera Off"}
                position="bottom"
              >
                <div className="hover:bg-gray-500/30 p-1 rounded-md cursor-pointer duration-300">
                  <TrackToggle
                    source={Track.Source.Camera}
                    style={{ color: "white", scale: 0.9 }}
                    className="flex items-center justify-center w-4 h-4"
                    onClick={() => setIsSelfCamera(!isSelfCamera)}
                  />
                </div>
              </Tooltip>
            </div>
          )}
          {status === "inCall" && !isRecording && (
            <Tooltip tooltip="Record" position="bottom">
              <div
                className={`hover:bg-orange-500/30 ${
                  isRecording && "bg-orange-500/300"
                } px-2 py-1 rounded-md cursor-pointer duration-300`}
                onClick={() => {
                  if (!isRecording) {
                    toggleRecording(currentCallID);
                  }
                }}
              >
                <CircleDot className="text-orange-500 w-4 h-4" />
              </div>
            </Tooltip>
          )}
          {status === "inCall" && (
            <Tooltip tooltip="Hold Call" position="bottom">
              <div
                className={`px-2 py-1 rounded-md duration-300 ${
                  isSelfDisabled
                    ? "bg-indigo-500/10 cursor-not-allowed pointer-events-none"
                    : "hover:bg-indigo-500/30 cursor-pointer"
                }`}
                onClick={() => holdCall()}
              >
                <Pause className="text-indigo-500 w-4 h-4" />
              </div>
            </Tooltip>
          )}
          {status === "onHold" && (
            <Tooltip tooltip="Resume Call" position="bottom">
              <div
                className={`px-2 py-1 rounded-md duration-300 ${
                  isSelfDisabled
                    ? "bg-blue-500/10 cursor-not-allowed pointer-events-none"
                    : "hover:bg-blue-500/30 cursor-pointer"
                }`}
                onClick={() => resumeCall(roomName)}
              >
                <Play className="text-blue-500 w-4 h-4" />
              </div>
            </Tooltip>
          )}
          <Tooltip
            tooltip={status === "none" ? "Call" : "End Call"}
            position="bottom"
          >
            {status === "none" || status === "missed" ? (
              <div
                className={`px-2 py-1 rounded-md duration-300 ${
                  isSelfDisabled
                    ? "bg-green-500/10 cursor-not-allowed pointer-events-none"
                    : "hover:bg-green-500/30 cursor-pointer"
                }`}
                onClick={() => handleStartCall(roomName)}
              >
                <PhoneOutgoing className="text-green-500 w-4 h-4" />
              </div>
            ) : (
              <div
                className="hover:bg-red-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
                onClick={() => handleEndCall(roomName)}
              >
                <PhoneOff className="text-red-500 w-4 h-4" />
              </div>
            )}
          </Tooltip>
          <Tooltip tooltip={isSelfMuted ? "Unmute" : "Mute"} position="bottom">
            <div
              className={`p-1 rounded-md duration-300 ${
                isSelfDisabled
                  ? "bg-gray-400/30 cursor-not-allowed pointer-events-none"
                  : "hover:bg-gray-500/30 cursor-pointer"
              }`}
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
                style={{ color: "white", scale: 0.9 }}
                className="flex items-center justify-center w-4 h-4"
                onClick={() => setIsSelfMuted(!isSelfMuted)}
              />
            </div>
          </Tooltip>
          <Tooltip tooltip="Fullscreen" position="bottom">
            <div
              className={`px-2 py-1 rounded-md duration-300 ${
                isSelfDisabled
                  ? "bg-gray-400/20 cursor-not-allowed pointer-events-none"
                  : "hover:bg-gray-500/30 cursor-pointer"
              }`}
              onClick={() => {
                if (inCall) {
                  if (currentCallID.length !== 0) {
                    setIsFullscreen(true);
                  } else {
                    toast.custom((t: any) => (
                      <Toast t={t} content="End Current Call" type="warning" />
                    ));
                  }
                } else {
                  setIsFullscreen(true);
                }
              }}
            >
              <Maximize className="w-4 h-4" />
            </div>
          </Tooltip>

          <Tooltip tooltip="Signal" position="bottom">
            <div className="hover:bg-gray-500/30 px-2 py-1 rounded-md cursor-pointer duration-300">
              {remoteVideoTracks.map((trackRef: any) => (
                <ConnectionQualityIndicator
                  participant={trackRef.participant}
                  key={trackRef.participant}
                />
              ))}
            </div>
          </Tooltip>
        </div>
        {showPersonIcon && (
          <div className="absolute bottom-[2px] right-[2px] flex items-center gap-1 text-white bg-black bg-opacity-50 rounded-md z-10 p-1 px-2">
            <UserIcon className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold">Guest</span>
          </div>
        )}
        {status === "inCall" && (
          <div className="absolute bottom-[2px] left-[2px] bg-black bg-opacity-50 items-center text-white text-sm font-medium px-2 p-1 rounded flex">
            <h1 className="text-xs font-semibold">Call In Progress</h1>
          </div>
        )}
        {status === "missed" && (
          <div className="absolute bottom-[2px] left-[2px] bg-red-500 bg-opacity-50 items-center text-white text-sm font-medium px-2 p-1 rounded flex">
            <h1 className="text-xs font-semibold">Missed Call</h1>
          </div>
        )}
        {status === "onHold" && (
          <div className="absolute bottom-[2px] left-[2px] bg-blue-500 bg-opacity-50 items-center text-white text-sm font-medium px-2 p-1 rounded flex">
            <h1 className="text-xs font-semibold">On Hold</h1>
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[80] flex items-center justify-center gap-5">
          <div className="w-full h-fit max-h-screen flex justify-center items-end">
            <div className="relative w-3/4 flex justify-center">
              {remoteVideoTracks.map((trackRef: any) => (
                <VideoTrack
                  key={trackRef.publication.trackSid}
                  trackRef={trackRef}
                  className="w-full h-full object-contain rounded-md"
                />
              ))}

              {renderAudioTracks()}
              <div className="absolute top-2 left-2 w-fit rounded-md flex items-center bg-black bg-opacity-50 justify-start">
                <div className="w-full max-w-2xl flex items-center gap-5 px-4 py-1 rounded-md">
                  <div>
                    <h1 className="font-bold text-2xl">{label}</h1>
                  </div>
                  <div className="flex items-center gap-5">
                    <Tooltip
                      tooltip={isRemoteMuted ? "Unmute" : "Mute"}
                      position="bottom"
                    >
                      <div
                        className="hover:bg-blue-500/30 rounded-md cursor-pointer duration-300 px-1 py-1"
                        onClick={() => {
                          sendMuteRequest(roomName);
                        }}
                      >
                        {isRemoteMuted ? <MicOff /> : <Mic />}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
              {/* Controls */}
              <div className="absolute top-2 right-2 flex bg-black bg-opacity-50 rounded-md px-2 py-1">
                <div className="w-full flex items-center gap-2 justify-between">
                  {status === "inCall" && (
                    <>
                      <Tooltip
                        tooltip={isSelfCamera ? "Camera On" : "Camera Off"}
                        position="bottom"
                      >
                        <div
                          className="hover:bg-gray-500/30 p-2 rounded-md cursor-pointer duration-300"
                          // onClick={() => handleEndCall(roomName)}
                        >
                          <TrackToggle
                            source={Track.Source.Camera}
                            style={{ color: "white", scale: 1.4 }}
                            // onClick={() => setAudioMuted((prev) => !prev)}
                            className="flex items-center justify-center"
                            onClick={() => {
                              setIsSelfCamera(!isSelfCamera);
                            }}
                          />
                          {/* <Video className="w-7 h-7" /> */}
                        </div>
                      </Tooltip>
                      <Tooltip tooltip="Record" position="bottom">
                        <button
                          className={`hover:bg-orange-500/30 px-2 py-1 rounded-md cursor-pointer duration-300 ${
                            isRecording && "bg-orange-500/30"
                          }`}
                          onClick={() => toggleRecording(currentCallID)}
                        >
                          <CircleDot className="text-orange-500" />
                        </button>
                      </Tooltip>
                      {status === "inCall" && (
                        <Tooltip tooltip="Hold Call" position="bottom">
                          <button
                            className="hover:bg-indigo-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
                            onClick={() => {
                              setIsFullscreen(false);
                              holdCall();
                            }}
                          >
                            <Pause className="text-indigo-500" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip tooltip="End Call" position="bottom">
                        <button
                          className="hover:bg-red-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
                          onClick={() => handleEndCall(roomName)}
                        >
                          <PhoneOff className="text-red-500" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                  {status === "none" && (
                    <Tooltip tooltip="Call" position="bottom">
                      <button
                        className="hover:bg-green-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
                        onClick={() => handleStartCall(roomName)}
                      >
                        <PhoneOutgoing className="text-green-500 w-6 h-6" />
                      </button>
                    </Tooltip>
                  )}
                  {status === "onHold" && (
                    <Tooltip tooltip="Resume Call" position="bottom">
                      <button
                        className="hover:bg-indigo-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
                        onClick={() => resumeCall(roomName)}
                      >
                        <Play className="text-indigo-500 w-6 h-6" />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip tooltip="Minimize" position="bottom">
                    <button
                      className="hover:bg-gray-500/30 px-2 py-1 rounded-md cursor-pointer duration-300"
                      onClick={() => setIsFullscreen(false)}
                    >
                      <Minimize className="w-6 h-6" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
            {status === "inCall" && (
              <div className="w-full h-full max-w-md aspect-video px-4 rounded-md flex flex-col items-center justify-end gap-4">
                {/* local preview in bottom-right */}
                {localVideoTrack && (
                  <div className="bottom-4 right-4 w-full h-full max-w-96 aspect-video rounded-md overflow-hidden bg-black">
                    {!isSelfCamera ? (
                      <VideoTrack
                        trackRef={localVideoTrack}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <h1 className="font-bold text-gray-400">Camera Off</h1>
                      </div>
                    )}
                  </div>
                )}
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
            <div className="flex items-center gap-2">
              <div className="w-full">
                <button
                  className="w-full px-4 py-2 flex justify-center rounded-md bg-green-500/50 whitespace-nowrap gap-2 font-bold"
                  onClick={() => attendCall()}
                >
                  <PhoneCall />
                  Accept Call
                </button>
              </div>
              <div className="w-full">
                <button
                  className="w-full px-4 py-2 flex justify-center rounded-md bg-indigo-500/50 whitespace-nowrap gap-2 font-bold"
                  onClick={() => {
                    setShowModal(false);
                    holdIncomingCall();
                  }}
                >
                  <Pause />
                  Hold Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

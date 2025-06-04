/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-asserted-optional-chain */
import Layout from "@/components/Layout";
import {
  Disc,
  MapPin,
  Maximize,
  Mic,
  MicOff,
  Minimize,
  Pause,
  Phone,
  PhoneCallIcon,
  PhoneIncoming,
  PhoneOff,
  Play,
  UserIcon,
  Video,
  VideoOff,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseCookies } from "nookies";
import { Location } from "@/utils/types";
import SearchInput from "@/components/ui/Search";
import jwt from "jsonwebtoken";
import { useSocket } from "@/context/SocketContext";
import { io } from "socket.io-client";
import { Participant, Room, Track } from "livekit-client";
import {
  RoomAudioRenderer,
  RoomContext,
  useRoomContext,
  useTracks,
  TrackReferenceOrPlaceholder,
  ConnectionQualityIndicator,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Tooltip from "@/components/ui/ToolTip";
import GuestTile from "../../components/GuestTile";
import generateUUID from "@/utils/uuidGenerator";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";

export default function Index() {
  const [userLocationListData, setUserLocationListData] = useState<Location[]>(
    []
  );
  const [filteredUserLocationData, setFilteredUserLocationData] = useState<
    Location[]
  >([]);

  const { socket } = useSocket();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [guestCount, setGuestCount] = useState<string[]>([]);
  const [locationsOnline, setLocationsOnline] = useState<string[]>([]);
  const [onHoldCount, setOnHoldCount] = useState<string[]>([]);
  const [missedCallCount, setMissedCallCount] = useState<string[]>([]);
  const [filters] = useState<{
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

  useEffect(() => {
    console.log({ onHoldCount });
  }, [onHoldCount]);

  const [localStatus, setLocalStatus] = useState<"notInCall" | "inCall">(
    "notInCall"
  );
  const [userId, setUserId] = useState<string>("");
  const [currentLocalCallID, setCurrentLocalCallID] = useState<string>("");
  const room = "quickstart-room";

  const [roomInstance] = useState(
    () =>
      new Room({
        // Optimize video quality for each participant's screen
        adaptiveStream: true,
        // Enable automatic audio/video quality optimization
        dynacast: true,
      })
  );

  useEffect(() => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };
    setUserId(userName);
  }, []);

  useEffect(() => {
    if (userId.length === 0) return;
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch(`/api/token?room=${room}&username=${userId}`);
        const data = await resp.json();
        if (!mounted) return;
        if (data.token) {
          await roomInstance.connect(
            process.env.NEXT_PUBLIC_LIVEKIT_URL!,
            data.token
          );
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance, userId]);

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
    if (socketRef.current) {
      socketRef.current.on("call-ended", (data) => {
        console.log("CALL END", { data });
        const { callId } = data;
        console.log(
          `MY CALL? ${{ callId, currentLocalCallID }}`,
          callId === currentLocalCallID
        );
        if (callId === currentLocalCallID) {
          console.log("ENDING CALL", { callId });
          roomInstance.localParticipant.setCameraEnabled(false);
          roomInstance.localParticipant.setMicrophoneEnabled(false);
          setLocalStatus("notInCall");
          setCurrentLocalCallID("");
        }
      });
    }
  }, [socket, currentLocalCallID]);

  const getCallList = () => {
    socketRef.current?.emit("get-calls");
  };

  const toggleLocalCamera = () => {
    roomInstance.localParticipant.setCameraEnabled(
      !roomInstance.localParticipant.isCameraEnabled
    );
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
                  <h1 className="font-bold text-xl">
                    {locationsOnline.length}
                  </h1>
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
                    <h1 className="font-bold text-xl">{guestCount.length}</h1>
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
                    <h1 className="font-bold text-xl">{onHoldCount.length}</h1>
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
                      {missedCallCount?.length}
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
        <div className="w-full pb-4 gap-2">
          <RoomContext.Provider value={roomInstance}>
            <div
              className="p-2"
              data-lk-theme="default"
              style={{ height: "100dvh" }}
            >
              {/* Your custom component with basic video conferencing functionality. */}
              <MyVideoConference
                name={userId}
                roomInstance={roomInstance}
                filteredUserLocationData={filteredUserLocationData}
                toggleLocalCamera={toggleLocalCamera}
                localStatus={localStatus}
                setLocalStatus={setLocalStatus}
                setGuestCount={setGuestCount}
                setLocationsOnline={setLocationsOnline}
                setOnHoldCount={setOnHoldCount}
                setMissedCallCount={setMissedCallCount}
                setCurrentLocalCallID={setCurrentLocalCallID}
              />
              {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
              <RoomAudioRenderer />
            </div>
          </RoomContext.Provider>
        </div>
      </div>
    </Layout>
  );
}

function MyVideoConference({
  name,
  roomInstance,
  filteredUserLocationData,
  toggleLocalCamera,
  localStatus,
  setLocalStatus,
  setGuestCount,
  setLocationsOnline,
  setOnHoldCount,
  setMissedCallCount,
  setCurrentLocalCallID,
}: {
  name: string;
  roomInstance: any;
  filteredUserLocationData: Location[];
  toggleLocalCamera: () => void;
  localStatus: "notInCall" | "inCall";
  setLocalStatus: any;
  setGuestCount: any;
  setLocationsOnline: any;
  setOnHoldCount: any;
  setMissedCallCount: any;
  setCurrentLocalCallID: any;
}) {
  const room = useRoomContext();
  const localSid = room.localParticipant.sid;

  // onlySubscribed: true so we only get what we're explicitly allowed to see
  const allTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // filter out any track from the local participant
  const remoteTracks: TrackReferenceOrPlaceholder[] = allTracks.filter((t) => {
    const isNotLocal = t.participant.sid !== localSid;
    const hasLocation = filteredUserLocationData.some(
      (loc) => String(loc.LocationID) === t.participant.identity
    );
    return isNotLocal && hasLocation;
  });

  useEffect(() => {
    filteredUserLocationData.map((loc) => {
      remoteTracks.filter(
        (t) =>
          t?.participant?.identity?.toString() === loc?.LocationID?.toString()
      );
    });
  }, [filteredUserLocationData, remoteTracks]);

  useEffect(() => {
    // 1) Build a Set of all LocationID strings from filteredUserLocationData
    const validIDs = new Set(
      filteredUserLocationData.map((loc) => loc?.LocationID?.toString())
    );

    // 2) From remoteTracks, pick only those identities whose .identity is in validIDs
    const identities = remoteTracks
      .map((t) => t.participant.identity.toString())
      .filter((id) => validIDs.has(id));

    // 3) Only update state if identities is different from locationsOnline
    setLocationsOnline((prev: string[]) => {
      // If length differs, we definitely changed
      if (prev.length !== identities.length) {
        return identities;
      }
      // If same length, check each element (in this example we assume sorted order or
      // that order must match. If you don’t care about order, you could sort both arrays
      // or compare by Set membership instead.)
      for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== identities[i]) {
          return identities;
        }
      }
      // no difference → return prev so React skips an update
      return prev;
    });
  }, [remoteTracks]);

  return (
    <div className="w-full h-full grid grid-cols-4 gap-2">
      {remoteTracks.map((track, index) => (
        <div
          className="rounded-md aspect-video w-full h-fit relative"
          key={index}
        >
          {/* Render each participant tile manually */}
          <GuestTile trackRef={track} />
          <ParticipantActions
            track={track}
            remoteTracks={remoteTracks}
            participant={track.participant}
            name={name}
            roomInstance={roomInstance}
            toggleLocalCamera={toggleLocalCamera}
            localStatus={localStatus}
            setLocalStatus={setLocalStatus}
            filteredUserLocationData={filteredUserLocationData}
            setGuestCount={setGuestCount}
            setOnHoldCount={setOnHoldCount}
            setMissedCallCount={setMissedCallCount}
            setCurrentLocalCallID={setCurrentLocalCallID}
          />
        </div>
      ))}
    </div>
  );
}

function ParticipantActions({
  track,
  remoteTracks,
  participant,
  name,
  roomInstance,
  toggleLocalCamera,
  localStatus,
  setLocalStatus,
  filteredUserLocationData,
  setGuestCount,
  setOnHoldCount,
  setMissedCallCount,
  setCurrentLocalCallID,
}: {
  track: TrackReferenceOrPlaceholder;
  remoteTracks: TrackReferenceOrPlaceholder[];
  participant: Participant;
  name: string;
  roomInstance: any;
  toggleLocalCamera: () => void;
  localStatus: "notInCall" | "inCall";
  setLocalStatus: any;
  filteredUserLocationData: Location[];
  setGuestCount: any;
  setOnHoldCount: any;
  setMissedCallCount: any;
  setCurrentLocalCallID: any;
}) {
  const { socket } = useSocket();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const room = useRoomContext();
  const [callStatus, setCallStatus] = useState<
    "notInCall" | "inCall" | "onHold" | "missed"
  >("notInCall");
  const [currentCallID, setCurrentCallID] = useState<string>("");
  const [pendingCall, setPendingCall] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [localMicEnabled, setLocalMicEnabled] = useState<boolean>(false);
  const [locationDetails, setLocationDetails] = useState<Location>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [egressId, setEgressId] = useState("");
  const [showPersonIcon, setShowPersonIcon] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const fileName = `${currentCallID}`;
        const response = await fetch(
          process.env.NEXT_PUBLIC_STARTRECORDING_API!,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              room: "quickstart-room",
              fileName: fileName,
              callId: currentCallID,
            }),
          }
        );
        const data = await response.json();
        console.log({ data });
        if (data.egressId.length > 0) {
          setIsRecording(true);
          setEgressId(data.egressId);
        } else {
          console.error("Failed to start recording:", data.error);
          toast.custom((t: any) => {
            return <Toast t={t} content="Error Recording Call" type="error" />;
          });
        }
      } catch (error) {
        console.error("Error starting recording:", error);
        toast.custom((t: any) => {
          return <Toast t={t} content="Error Recording Call" type="error" />;
        });
      }
    } else {
      await fetch(process.env.NEXT_PUBLIC_STOPRECORDING_API!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ egressId, callId: currentCallID }),
      });

      setIsRecording(false);
      setEgressId("");
    }
  };

  useEffect(() => {
    filteredUserLocationData.map((loc) => {
      if (loc.LocationID?.toString() === participant.identity.toString()) {
        setLocationDetails(loc);
      }
    });
  }, [filteredUserLocationData, remoteTracks]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const toggleMic = async () => {
    if (socketRef.current) {
      socketRef.current?.emit(
        "toggle-guest-mic",
        JSON.stringify({ guestId: participant.identity })
      );
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const callHeartBeat = async () => {
    if (socketRef.current) {
      console.log("SENDING CALL HEARTBEAT");
      socketRef.current?.emit(
        "call-heartbeat",
        JSON.stringify({
          callId: currentCallID,
          userId: "receptionist",
        })
      );
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const attendCall = async () => {
    if (localStatus === "inCall") {
      return toast.custom((t: any) => {
        return <Toast t={t} content="End Current Call" type="warning" />;
      });
    }
    if (socketRef.current) {
      roomInstance.localParticipant.setCameraEnabled(true);
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setCallStatus("inCall");
      setLocalStatus("inCall");
      setCurrentCallID(pendingCall.CallID);
      setCurrentLocalCallID(pendingCall.CallID);
      setLocalMicEnabled(true);
      setMissedCallCount((prev: string[]) =>
        prev.filter((p) => p.toString() !== participant?.identity?.toString())
      );
      setTimeout(() => {
        socketRef.current?.emit(
          "join-call",
          JSON.stringify({
            roomId: pendingCall.CallID,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const callGuest = async () => {
    if (localStatus === "inCall") {
      return toast.custom((t: any) => {
        return <Toast t={t} content="End Current Call" type="warning" />;
      });
    }
    if (socketRef.current) {
      roomInstance.localParticipant.setCameraEnabled(true);
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setCallStatus("inCall");
      setLocalStatus("inCall");
      setMissedCallCount((prev: string[]) =>
        prev.filter((p) => p.toString() !== participant?.identity?.toString())
      );
      const callId = generateUUID();
      setCurrentCallID(callId);
      setCurrentLocalCallID(callId);
      setLocalMicEnabled(true);
      setTimeout(() => {
        socketRef.current?.emit(
          "start-call",
          JSON.stringify({
            locationID: participant.identity,
            hostId: name,
            callId,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const holdCall = async () => {
    if (socketRef.current) {
      if (isRecording) {
        toggleRecording();
      }
      roomInstance.localParticipant.setCameraEnabled(true);
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setCallStatus("onHold");
      setLocalStatus("notInCall");
      setLocalMicEnabled(false);
      setOnHoldCount((prev: string[]) => {
        if (!prev.includes(participant?.identity?.toString())) {
          return [...prev, participant?.identity?.toString()];
        }
        return prev;
      });
      setTimeout(() => {
        socketRef.current?.emit(
          "hold-call",
          JSON.stringify({
            roomId: currentCallID,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const holdIncomingCall = async () => {
    if (socketRef.current) {
      roomInstance.localParticipant.setCameraEnabled(true);
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setCallStatus("onHold");
      setLocalStatus("notInCall");
      setLocalMicEnabled(false);
      setMissedCallCount((prev: string[]) =>
        prev.filter((p) => p.toString() !== participant?.identity?.toString())
      );
      setOnHoldCount((prev: string[]) => {
        if (!prev.includes(pendingCall?.CallPlacedByLocationID?.toString())) {
          return [...prev, pendingCall?.CallPlacedByLocationID?.toString()];
        }
        return prev;
      });
      setTimeout(() => {
        socketRef.current?.emit(
          "hold-call",
          JSON.stringify({
            roomId: pendingCall.CallID,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const resumeCall = async () => {
    if (localStatus === "inCall") {
      return toast.custom((t: any) => {
        return <Toast t={t} content="End Current Call" type="warning" />;
      });
    }
    if (socketRef.current) {
      roomInstance.localParticipant.setCameraEnabled(true);
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setCallStatus("inCall");
      setLocalStatus("inCall");
      setLocalMicEnabled(true);
      const callId =
        currentCallID.length > 0 ? currentCallID : pendingCall.CallID;
      setOnHoldCount((prev: string[]) => {
        if (prev.includes(participant?.identity?.toString())) {
          return prev.filter((p) => p !== participant?.identity?.toString());
        }
        return prev;
      });
      if (currentCallID.length === 0) {
        setCurrentCallID(pendingCall.CallID);
        setCurrentLocalCallID(pendingCall.CallID);
        setPendingCall(null);
      }
      setTimeout(() => {
        socketRef.current?.emit(
          "resume-call",
          JSON.stringify({
            locationID: participant.identity,
            callId,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const endGuestCall = async () => {
    if (socketRef.current) {
      if (isRecording) {
        toggleRecording();
      }
      roomInstance.localParticipant.setCameraEnabled(false);
      roomInstance.localParticipant.setMicrophoneEnabled(false);
      setCallStatus("notInCall");
      setLocalStatus("notInCall");
      setCurrentCallID("");
      setCurrentLocalCallID("");
      setLocalMicEnabled(false);
      const callId =
        currentCallID.length > 0 ? currentCallID : pendingCall.CallID;
      setOnHoldCount((prev: string[]) => {
        if (prev.includes(participant?.identity?.toString())) {
          return prev.filter((p) => p !== participant?.identity?.toString());
        }
        return prev;
      });
      if (currentCallID.length === 0) {
        setPendingCall(null);
      }
      setTimeout(() => {
        socketRef.current?.emit(
          "call-end",
          JSON.stringify({
            locationID: participant.identity,
            hostId: name,
            callId: callId,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const unmuteHostForGuest = async () => {
    if (socketRef.current) {
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setLocalMicEnabled(true);
      setTimeout(() => {
        socketRef.current?.emit(
          "unmute-host",
          JSON.stringify({
            guestId: participant.identity,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const muteHostForGuest = async () => {
    if (socketRef.current) {
      roomInstance.localParticipant.setMicrophoneEnabled(false);
      setLocalMicEnabled(false);
      setTimeout(() => {
        socketRef.current?.emit(
          "mute-host",
          JSON.stringify({
            guestId: participant.identity,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const toggleLocalMute = () => {
    roomInstance.localParticipant.setMicrophoneEnabled(
      !roomInstance.localParticipant.isMicrophoneEnabled
    );
    setLocalMicEnabled(!roomInstance.localParticipant.isMicrophoneEnabled);
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("call-list-update", (data) => {
        data.map((call: any) => {
          if (
            call?.AssignedToUserName?.toString() === name &&
            call?.CallStatus === "New" &&
            call?.CallPlacedByLocationID?.toString() ===
              participant?.identity?.toString()
          ) {
            setPendingCall(call);
            setShowModal(true);
          }
        });
      });

      socketRef.current.on("call-missed", (data) => {
        console.log("CALL MISSED", { data });
        if (
          data?.CallAssignedTo === name &&
          data?.CallPlacedByLocationID?.toString() === participant?.identity &&
          data?.CallStatus === "Missed"
        ) {
          setMissedCallCount((prev: string[]) => {
            if (!prev.includes(data?.CallPlacedByLocationID?.toString())) {
              return [...prev, data?.CallPlacedByLocationID?.toString()];
            }
            return prev;
          });
          setPendingCall(null);
          setShowModal(false);
          setCallStatus("missed");
        }
      });

      socketRef.current?.on("guest-detected-request", (data) => {
        const id = data?.locationID?.toString();
        if (id === participant?.identity?.toString()) {
          setGuestCount((prev: string[]) => {
            // If it's already in the array, return prev unchanged.
            if (prev.includes(id)) {
              return prev;
            }
            // Otherwise, append it
            return [...prev, id];
          });
          setShowPersonIcon(true);
        }
      });

      socketRef.current?.on("guest-not-detected-request", (data) => {
        const id = data?.locationID?.toString();
        if (id === participant?.identity?.toString()) {
          setGuestCount((prev: string[]) => prev.filter((item) => item !== id));
          setShowPersonIcon(false);
        }
      });

      socketRef.current.on("call-ended", (data) => {
        console.log("CALL END", { data });
        const { callId } = data;
        console.log(
          `MY CALL? ${{ callId, currentCallID }}`,
          callId === currentCallID
        );
        if (callId === currentCallID) {
          if (isRecording) {
            toggleRecording();
          }
          roomInstance.localParticipant.setCameraEnabled(false);
          roomInstance.localParticipant.setMicrophoneEnabled(false);
          setCallStatus("notInCall");
          setLocalStatus("notInCall");
          setCurrentCallID("");
          setCurrentLocalCallID("");
          setLocalMicEnabled(false);
        }
      });
    }
  }, [socket, currentCallID]);

  useEffect(() => {
    const audio = new Audio("/sounds/call-ringtone.mp3");
    audio.load(); // optional but explicit
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (showModal) {
      audioRef.current?.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [showModal]);

  const heartbeatIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval whenever currentCallID changes
    if (heartbeatIntervalRef.current !== null) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (currentCallID.length > 0) {
      // Use window.setInterval so TS knows it’s the browser version (returns number)
      heartbeatIntervalRef.current = window.setInterval(() => {
        callHeartBeat();
      }, 30000);
    }

    // Cleanup on unmount or before next effect run
    return () => {
      if (heartbeatIntervalRef.current !== null) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [currentCallID]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (participant.isMicrophoneEnabled) {
        toggleMic();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div>
      {/* Info */}
      <div className="absolute top-[2px] left-[2px] rounded-md bg-black/50">
        <div className="flex items-center">
          <div className="pl-2 py-1">
            <h1 className="font-bold text-xs">
              {locationDetails?.LocationName}
            </h1>
          </div>
          <Tooltip
            tooltip={participant.isMicrophoneEnabled ? "Mute" : "Unmute"}
            position="bottom"
          >
            <button
              className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
              onClick={toggleMic}
            >
              {participant.isMicrophoneEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
      {/* Controls */}
      <div className="absolute top-[2px] right-[2px] rounded-md bg-black/50">
        {(callStatus === "notInCall" || callStatus === "onHold") && (
          <Tooltip
            tooltip={localMicEnabled ? "Mute" : "Unmute"}
            position="bottom"
          >
            <button
              className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
              onClick={() => {
                if (localMicEnabled) {
                  muteHostForGuest();
                } else {
                  unmuteHostForGuest();
                }
              }}
            >
              {localMicEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        )}
        {callStatus === "inCall" && (
          <>
            <Tooltip
              tooltip={localMicEnabled ? "Mute" : "Unmute"}
              position="bottom"
            >
              <button
                className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                onClick={toggleLocalMute}
              >
                {localMicEnabled ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </button>
            </Tooltip>
            <Tooltip
              tooltip={room.localParticipant.isCameraEnabled ? "Off" : "On"}
              position="bottom"
            >
              <button
                className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                onClick={toggleLocalCamera}
              >
                {room.localParticipant.isCameraEnabled ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
              </button>
            </Tooltip>
            <Tooltip
              tooltip={isRecording ? "Stop Recording" : "Start Recording"}
              position="bottom"
            >
              <button
                className={`px-2 py-1 rounded-md cursor-pointer hover:bg-orange-500/50 ${
                  isRecording && "bg-orange-500/50"
                } duration-300`}
                onClick={() => toggleRecording()}
              >
                <Disc className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip tooltip={"Hold Call"} position="bottom">
              <button
                className="px-2 py-1 rounded-md cursor-pointer hover:bg-cyan-500/30 duration-300"
                onClick={holdCall}
              >
                <Pause className="text-cyan-500 w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )}
        {callStatus === "onHold" && (
          <Tooltip tooltip={"Resume Call"} position="bottom">
            <button
              className="px-2 py-1 rounded-md cursor-pointer hover:bg-blue-500/30 duration-300"
              onClick={resumeCall}
            >
              <Play className="text-blue-500 w-4 h-4" />
            </button>
          </Tooltip>
        )}
        <Tooltip
          tooltip={callStatus === "notInCall" ? "Call" : "End Call"}
          position="bottom"
        >
          {callStatus === "notInCall" || callStatus === "missed" ? (
            <button
              className="px-2 py-1 rounded-md cursor-pointer hover:bg-green-500/30 duration-300"
              onClick={callGuest}
            >
              <Phone className="text-green-500 w-4 h-4" />
            </button>
          ) : (
            <button
              className="px-2 py-1 rounded-md cursor-pointer hover:bg-red-500/30 duration-300"
              onClick={endGuestCall}
            >
              <PhoneOff className="text-red-500 w-4 h-4" />
            </button>
          )}
        </Tooltip>
        <Tooltip tooltip="Full Screen" position="bottom">
          <button
            className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
            onClick={() => {
              setIsFullScreen(true);
            }}
          >
            <Maximize className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      {callStatus === "inCall" && (
        <div className="absolute bottom-[2px] left-[2px] rounded-md bg-black/60 px-2 py-1">
          <h1 className="text-xs font-bold">In Progress</h1>
        </div>
      )}
      {callStatus === "onHold" && (
        <div className="absolute bottom-[2px] left-[2px] rounded-md bg-indigo-500/60 px-2 py-1">
          <h1 className="text-xs font-bold">On Hold</h1>
        </div>
      )}
      {callStatus === "missed" && (
        <div className="absolute bottom-[2px] left-[2px] rounded-md bg-red-500/60 px-2 py-1">
          <h1 className="text-xs font-bold">Missed</h1>
        </div>
      )}
      {showPersonIcon && (
        <div className="absolute bottom-[2px] right-8 flex items-center gap-1 text-white bg-black bg-opacity-50 rounded-md z-10 p-1 px-2">
          <UserIcon className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold">Guest</span>
        </div>
      )}
      <div className="absolute bottom-[2px] right-[2px] bg-black/50 rounded-md flex items-center justify-center">
        {remoteTracks
          .filter(
            (t) =>
              t.participant.identity.toString() ===
              locationDetails?.LocationID?.toString()
          )
          .map((trackRef: any) => (
            <ConnectionQualityIndicator
              participant={trackRef.participant}
              key={trackRef.participant}
              className="scale-75"
            />
          ))}
      </div>
      {showModal &&
        pendingCall?.CallPlacedByLocationID?.toString() ===
          participant?.identity?.toString() && (
          <div className="fixed inset-0 top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-md bg-foreground p-4 flex flex-col gap-5">
              <div>
                <h1 className="text-orange-500 font-bold">Incoming Call</h1>
              </div>
              <div className="flex gap-2 items-center">
                <div>
                  <img
                    src={`/images/incomingCall.gif`}
                    alt="User Profile"
                    // onError={() => setImgError(true)}
                    className="w-28 h-28 object-cover rounded-full"
                  />
                </div>
                <div>
                  <h1 className="font-bold text-2xl whitespace-nowrap">
                    {pendingCall?.CallPlacedByLocationName}
                  </h1>
                </div>
              </div>
              <div className="w-full flex items-center gap-2 whitespace-nowrap">
                <button
                  className="w-full px-2 py-1 bg-green-500/50 border border-green-500 rounded-md flex items-center justify-center gap-2"
                  onClick={() => {
                    setPendingCall(null);
                    setShowModal(false);
                    attendCall();
                  }}
                >
                  <PhoneCallIcon className="text-green-500" />
                  <h1 className="font-bold">Accept Call</h1>
                </button>
                <button
                  className="w-full px-2 py-1 bg-indigo-500/50 border border-indigo-500 rounded-md flex items-center justify-center gap-2"
                  onClick={() => {
                    holdIncomingCall();
                    setShowModal(false);
                  }}
                >
                  <Pause className="text-indigo-500" />
                  <h1 className="font-bold">Hold Call</h1>
                </button>
              </div>
            </div>
          </div>
        )}
      {isFullScreen && (
        <div className="fixed inset-0 top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center z-50">
          <div className="flex w-full items-end justify-center gap-2 p-4">
            <div className="w-3/4 relative">
              <GuestTile trackRef={track} />
              {/* Info */}
              <div className="absolute top-2 left-2 rounded-md bg-black/50">
                <div className="flex items-center">
                  <div className="pl-2 py-1">
                    <h1 className="font-bold text-xs">
                      {locationDetails?.LocationName}
                    </h1>
                  </div>
                  <Tooltip
                    tooltip={
                      participant.isMicrophoneEnabled ? "Mute" : "Unmute"
                    }
                    position="bottom"
                  >
                    <button
                      className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                      onClick={toggleMic}
                    >
                      {participant.isMicrophoneEnabled ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
              {/* Controls */}
              <div className="absolute top-2 right-2 rounded-md bg-black/50">
                {(callStatus === "notInCall" || callStatus === "onHold") && (
                  <Tooltip
                    tooltip={localMicEnabled ? "Mute" : "Unmute"}
                    position="bottom"
                  >
                    <button
                      className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                      onClick={() => {
                        if (localMicEnabled) {
                          muteHostForGuest();
                        } else {
                          unmuteHostForGuest();
                        }
                      }}
                    >
                      {localMicEnabled ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </button>
                  </Tooltip>
                )}
                {callStatus === "inCall" && (
                  <>
                    <Tooltip
                      tooltip={localMicEnabled ? "Mute" : "Unmute"}
                      position="bottom"
                    >
                      <button
                        className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                        onClick={toggleLocalMute}
                      >
                        {localMicEnabled ? (
                          <Mic className="w-4 h-4" />
                        ) : (
                          <MicOff className="w-4 h-4" />
                        )}
                      </button>
                    </Tooltip>
                    <Tooltip
                      tooltip={
                        room.localParticipant.isCameraEnabled ? "Off" : "On"
                      }
                      position="bottom"
                    >
                      <button
                        className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                        onClick={toggleLocalCamera}
                      >
                        {room.localParticipant.isCameraEnabled ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <VideoOff className="w-4 h-4" />
                        )}
                      </button>
                    </Tooltip>
                    <Tooltip
                      tooltip={
                        isRecording ? "Stop Recording" : "Start Recording"
                      }
                      position="bottom"
                    >
                      <button
                        className={`px-2 py-1 rounded-md cursor-pointer hover:bg-orange-500/50 ${
                          isRecording && "bg-orange/500"
                        } duration-300`}
                        onClick={() => toggleRecording()}
                      >
                        <Disc className="w-4 h-4" />
                      </button>
                    </Tooltip>

                    <Tooltip tooltip={"Hold Call"} position="bottom">
                      <button
                        className="px-2 py-1 rounded-md cursor-pointer hover:bg-cyan-500/30 duration-300"
                        onClick={holdCall}
                      >
                        <Pause className="text-cyan-500 w-4 h-4" />
                      </button>
                    </Tooltip>
                  </>
                )}
                {callStatus === "onHold" && (
                  <Tooltip tooltip={"Resume Call"} position="bottom">
                    <button
                      className="px-2 py-1 rounded-md cursor-pointer hover:bg-blue-500/30 duration-300"
                      onClick={resumeCall}
                    >
                      <Play className="text-blue-500 w-4 h-4" />
                    </button>
                  </Tooltip>
                )}
                <Tooltip
                  tooltip={callStatus === "notInCall" ? "Call" : "End Call"}
                  position="bottom"
                >
                  {callStatus === "notInCall" || callStatus === "missed" ? (
                    <button
                      className="px-2 py-1 rounded-md cursor-pointer hover:bg-green-500/30 duration-300"
                      onClick={callGuest}
                    >
                      <Phone className="text-green-500 w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className="px-2 py-1 rounded-md cursor-pointer hover:bg-red-500/30 duration-300"
                      onClick={endGuestCall}
                    >
                      <PhoneOff className="text-red-500 w-4 h-4" />
                    </button>
                  )}
                </Tooltip>
                <Tooltip tooltip="Minimize" position="bottom">
                  <button
                    className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                    onClick={() => {
                      setIsFullScreen(false);
                    }}
                  >
                    <Minimize className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-asserted-optional-chain */
import Layout from "@/components/Layout";
import {
  MapPin,
  Mic,
  MicOff,
  Phone,
  PhoneCallIcon,
  PhoneIncoming,
  PhoneOff,
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
} from "@livekit/components-react";
import "@livekit/components-styles";
import Tooltip from "@/components/ui/ToolTip";
import GuestTile from "./_components/GuestTile";
import generateUUID from "@/utils/uuidGenerator";

export default function Index() {
  const [userLocationListData, setUserLocationListData] = useState<Location[]>(
    []
  );
  const [filteredUserLocationData, setFilteredUserLocationData] = useState<
    Location[]
  >([]);

  const { socket } = useSocket();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [guestCount] = useState<number>(0);
  const [locationsOnline] = useState<number>(0);
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

  const [userId, setUserId] = useState<string>("");
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
        console.log({ data });
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
    console.log({ filters });
  }, [filters]);

  const getCallList = () => {
    socketRef.current?.emit("get-calls");
  };

  const toggleLocalMute = () => {
    roomInstance.localParticipant.setMicrophoneEnabled(
      !roomInstance.localParticipant.isMicrophoneEnabled
    );
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
                toggleLocalMute={toggleLocalMute}
                toggleLocalCamera={toggleLocalCamera}
              />
              {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
              <RoomAudioRenderer muted={true} />
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
  toggleLocalMute,
  toggleLocalCamera,
}: {
  name: string;
  roomInstance: any;
  filteredUserLocationData: Location[];
  toggleLocalMute: () => void;
  toggleLocalCamera: () => void;
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

  const [locationDetails, setLocationDetails] = useState<Location>();

  useEffect(() => {
    for (const t of allTracks) {
      const found = filteredUserLocationData.find(
        (loc) => String(loc.LocationID) === t.participant.identity
      );
      if (found) {
        setLocationDetails(found);
        return; // stop after first match
      }
    }
  }, [allTracks, filteredUserLocationData]);

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
            participant={track.participant}
            name={name}
            roomInstance={roomInstance}
            locationDetails={locationDetails!}
            toggleLocalMute={toggleLocalMute}
            toggleLocalCamera={toggleLocalCamera}
          />
        </div>
      ))}
    </div>
  );
}

function ParticipantActions({
  participant,
  name,
  roomInstance,
  locationDetails,
  toggleLocalMute,
  toggleLocalCamera,
}: {
  participant: Participant;
  name: string;
  roomInstance: any;
  locationDetails: Location;
  toggleLocalMute: () => void;
  toggleLocalCamera: () => void;
}) {
  const { socket } = useSocket();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const room = useRoomContext();
  const [callStatus, setCallStatus] = useState<
    "notInCall" | "inCall" | "onHold" | "missed"
  >("notInCall");
  const [currentCallID, setCurrentCallID] = useState<string>("");

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const toggleMic = async () => {
    console.log("Toggling Mic");
    if (socketRef.current) {
      console.log("Socket There", socketRef.current);
      socketRef.current?.emit(
        "toggle-guest-mic",
        JSON.stringify({ guestId: participant.identity })
      );
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  const callGuest = async () => {
    console.log("Toggling Mic");
    if (socketRef.current) {
      console.log("Socket There", socketRef.current);
      roomInstance.localParticipant.setCameraEnabled(true);
      roomInstance.localParticipant.setMicrophoneEnabled(true);
      setCallStatus("inCall");
      const callId = generateUUID();
      setCurrentCallID(callId);
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

  const endGuestCall = async () => {
    console.log("Toggling Mic");
    if (socketRef.current) {
      console.log("Socket There", socketRef.current);
      roomInstance.localParticipant.setCameraEnabled(false);
      roomInstance.localParticipant.setMicrophoneEnabled(false);
      setCallStatus("notInCall");
      setTimeout(() => {
        socketRef.current?.emit(
          "call-end",
          JSON.stringify({
            locationID: participant.identity,
            hostId: name,
            callId: currentCallID,
          })
        );
      }, 1000);
    } else {
      console.log("Socket Not There", socketRef.current);
    }
  };

  return (
    <div>
      <div className="absolute top-[2px] left-[2px] rounded-md bg-black/50">
        <div className="flex items-center">
          <div className="px-2 py-1">
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
      <div className="absolute top-[2px] right-[2px] rounded-md bg-black/50">
        {callStatus === "inCall" && (
          <>
            <Tooltip
              tooltip={
                room.localParticipant.isMicrophoneEnabled ? "Mute" : "Unmute"
              }
              position="bottom"
            >
              <button
                className="px-2 py-1 rounded-md cursor-pointer hover:bg-white/30 duration-300"
                onClick={toggleLocalMute}
              >
                {room.localParticipant.isMicrophoneEnabled ? (
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
          </>
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
    </div>
  );
}

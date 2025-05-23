/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import WatchCard from "./_components/WatchCard";
import VideoViewer from "@/components/ui/videoViewer";
import Button from "@/components/ui/Button";
import {
  Circle,
  CircleDot,
  Maximize,
  Mic,
  MicOff,
  Minimize,
  PhoneOff,
  PhoneOutgoing,
  Video,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { parseCookies } from "nookies";
import { Location, User } from "@/utils/types";
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
      console.log(guestId);
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

  useEffect(() => {
    fetch(`/api/token?identity=receptionist&room=${roomName}`)
      .then((r) => r.json())
      .then(({ wsUrl, token }) => {
        setWsUrl(wsUrl);
        setToken(token);
      })
      .catch(console.error);
  }, [roomName]);

  if (!wsUrl || !token) return null;

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, "-"); // e.g., "2025-05-10T14-30-15-123Z"
        const fileName = `${roomName}-recording-${timestamp}`;
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
          console.log("Recording started:", data);
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
        dynacast: true,
        bandwidthProfile: {
          video: {
            mode: "presentation",
            maxTracks: 1,
            trackSwitchOffMode: "predicted",
          },
        },
      }}
      video={true}
      audio={true}
      publishDefaults={{
        simulcast: true,
        videoEncoding: {
          maxBitrate: 2500_000,
          maxFramerate: 30,
        },
        resolution: { width: 1280, height: 720 },
      }}
    >
      <div className="relative w-full h-fit">
        <VideoGrid
          roomName={roomName}
          label={label}
          toggleRecording={toggleRecording}
          isRecording={isRecording}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm font-medium px-2 py-1 rounded flex gap-2">
          {label}{" "}
          {/* <TrackToggle
            source={Track.Source.Microphone}
            style={{ color: "white" }}
          /> */}
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
            style={{ marginTop: "4px" }}
          ></button>
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

  useEffect(() => {
    socketRef.current = socket;

    socketRef.current?.on("participant-muted-request", (data) => {
      if (data.locationID === roomName) {
        setIsRemoteMuted(data.isMuted);
      } else {
        console.log("participant-muted-request - NOT MINE");
      }
    });
  }, [socket]);

  const handleStartCall = async (data: any) => {
    socketRef.current?.emit("start-call", JSON.stringify({ locationID: data }));
    setIsFullscreen(true);
    console.log(data);
  };

  const handleEndCall = async (data: any) => {
    if (isRecording) {
      toggleRecording();
    }
    socketRef.current?.emit("call-end", JSON.stringify({ locationID: data }));
    setIsFullscreen(false);
    console.log(data);
  };

  const remoteVideoTracks = tracks.filter(
    (t) =>
      t.publication.kind === "video" &&
      t.publication.isSubscribed &&
      !t.participant.isLocal
  );

  const remoteAudioTracks = tracks.filter(
    (t) =>
      t.publication.kind === "audio" &&
      t.publication.isSubscribed &&
      !t.participant.isLocal
  );

  const sendMuteRequest = (roomName:string) => {
    socketRef.current?.emit("mute-participant", JSON.stringify({ locationID: roomName, isMuted: !isRemoteMuted }));
    setIsRemoteMuted((prev) => !prev);
  }
  const renderAudioTracks = () =>
    remoteAudioTracks.map((trackRef: TrackReferenceOrPlaceholder) => (
      <AudioTrack
        key={trackRef.publication.trackSid}
        trackRef={trackRef}        
      />
    ));

  return (
    <>
      <div
        className={`relative w-full h-fit bg-red-500 ${
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
        {/* {renderAudioTracks()} */}
        <button
          onClick={() => handleStartCall(roomName)}
          className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 bg-opacity-70 text-white px-4 py-1 rounded hover:bg-opacity-70 transition"
        >
          <PhoneOutgoing className="w-6 h-6" />
        </button>
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
            <div className="absolute top-0 left-0 w-full flex bg-black/40 justify-start">
              <div className="w-full max-w-2xl flex items-center gap-5 p-4 rounded-md">
                <div>
                  <h1 className="font-bold text-4xl">{label}</h1>
                </div>
                <div className="flex items-center gap-5">

                  <div onClick={() =>  {
                    sendMuteRequest(roomName)
                  }} className="cursor-pointer rounded-md px-6 py-2 bg-highlight">
                    {isRemoteMuted ? <MicOff  /> : <Mic  />}
                  </div>
                  {/* <div className="cursor-pointer rounded-md px-6 py-2 bg-highlight">
                    <Video />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="w-fit max-w-md p-4 rounded-md flex flex-col items-center gap-4">
            <button
              // onClick={() => handleEndCall(roomName)}
              className="bg-highlight bg-opacity-50 text-white text-sm font-medium px-6 py-2 rounded"
            >
              <TrackToggle
                source={Track.Source.Microphone}

                
                onDeviceError={(error) => {
                  console.error("Microphone device error:", error);

                  toast.custom(() => (
                    <div className="bg-red-500 text-white px-4 py-2 rounded">
                      Microphone error: {error?.message || "Unknown error"}
                    </div>
                  ));
                }}
                style={{ color: "white", scale: 1.5 }}
                className="w-7 h-7 flex items-center justify-center"
              />
            </button>
            <button
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
            </button>
            <button
              onClick={() => toggleRecording()}
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
        </div>
      )}
    </>
  );
}

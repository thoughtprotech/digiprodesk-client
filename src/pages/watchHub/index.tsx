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
  PhoneOutgoing,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
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
  const [audioMuted, setAudioMuted] = useState(false);
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
      connectOptions={{ autoSubscribe: true }}
      video={true}
      audio={true}
      publishDefaults={{ simulcast: true }}
      onConnected={() => {
        console.log("Receptionist connected and can publish tracks.");
      }}
    >
      <div className="relative w-full h-96">
        <VideoGrid audioMuted={audioMuted} />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm font-medium px-2 py-1 rounded">
          {label}{" "}
          <button
            style={{ color: "white", marginTop: "4px" }}
            onClick={() => setAudioMuted((prev) => !prev)}
            aria-label={audioMuted ? "Unmute" : "Mute"}
          >
            {audioMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
            style={{ marginTop: "4px" }}
          >
            {isRecording ? (
              <CircleDot size={15} color="#dc2626" /> // Red when recording
            ) : (
              <Circle size={15} color="#9ca3af" /> // Gray when idle
            )}
          </button>
        </div>
      </div>

      <TrackToggle
        source={Track.Source.Microphone}
        style={{ color: "white" }}
      />
      <TrackToggle source={Track.Source.Camera} style={{ color: "white" }} />
    </LiveKitRoom>
  );
}

function VideoGrid({ audioMuted }: { audioMuted: boolean }) {
  const tracks = useTracks();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const renderAudioTracks = () =>
    remoteAudioTracks.map((trackRef: TrackReferenceOrPlaceholder) => (
      <AudioTrack
        key={trackRef.publication.trackSid}
        trackRef={trackRef}
        muted={audioMuted}
      />
    ));

  return (
    <>
      <div
        className={`relative w-full h-full ${
          isFullscreen ? "hidden" : "block"
        }`}
      >
        {remoteVideoTracks.map((trackRef: any) => (
          <VideoTrack
            key={trackRef.publication.trackSid}
            trackRef={trackRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ))}
        {renderAudioTracks()}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 text-white text-sm font-medium px-3 py-1 rounded hover:bg-opacity-70 transition"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-screen-lg max-h-screen">
            {remoteVideoTracks.map((trackRef: any) => (
              <VideoTrack
                key={trackRef.publication.trackSid}
                trackRef={trackRef}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ))}
            {renderAudioTracks()}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm font-medium px-2 py-1 rounded"
            >
              <Minimize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

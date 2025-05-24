/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Disc,
  LogOut,
  Mic,
  MicOff,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import Peer, { MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Tooltip from "@/components/ui/ToolTip";
import { Location, User } from "@/utils/types";
import generateUUID from "@/utils/uuidGenerator";
import WithRole from "@/components/WithRole";
import ElapsedTime from "@/components/ui/ElapsedTime";
import logOut from "@/utils/logOut";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import { useSocket } from "@/context/SocketContext";
import { io } from "socket.io-client";
import { TrackToggle } from "@livekit/components-react";

export default function Index() {
  const [, setUserId] = useState<string>("");
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaConnectionRef = useRef<MediaConnection | null>(null); // Ref to store the current call
  const [inCall, setInCall] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<
    | "notInCall"
    | "calling"
    | "inProgress"
    | "onHold"
    | "transferred"
    | "missed"
    | "hostUnavailabe"
  >("notInCall");
  const [volume, setVolume] = useState<number>(1); // Volume range: 0 to 1
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [location, setLocation] = useState<Location>();
  const [user, setUser] = useState<User>();
  const passwordRef = useRef<HTMLInputElement>(null);
  const callRingTone = useRef<HTMLAudioElement | null>(null);
  const ringTone = useRef<HTMLAudioElement | null>(null);
  const [advertisementStatus, setAdvertisementStatus] = useState<
    "image" | "video"
  >("image");
  const callStatusRef = useRef(callStatus);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (socketRef.current && location) {
      socketRef.current.on("call-started", (data) => {
        console.log({ data });
        if (data?.toString() === location?.LocationID?.toString()) {
          console.log("CALL STARTED");
          console.log("Location ID", location?.LocationID?.toString());
          console.log({ data });
          setInCall(true);
          setCallStatus("inProgress");
        } else {
          console.log("CALL STARTED ERROR");
          console.log(data === location?.LocationID);
          console.log("Location ID", location?.LocationID?.toString());
          console.log("NOT MINE", data);
        }
      });

      socketRef.current.on("call-end-guest", (data) => {
        console.log(data);
        if (data === location?.LocationID?.toString()) {
          console.log("Location ID", location?.LocationID?.toString());
          console.log({ data });
          setInCall(false);
          setCallStatus("notInCall");
        } else {
          console.log("NOT MINE");
        }
      });

      socketRef.current.on("mute-participant-request", (data) => {
        if (data.locationID === location?.LocationID?.toString()) {
          const audioTrack = localAudioTrackRef.current;
          if (audioTrack) {
            if (!data.isMuted) {
              audioTrack.enable();
            } else {
              audioTrack.disable();
            }
            setIsMuted(data.isMuted);
          }
        } else {
          console.log("NOT MINE");
        }
      });
    }
  }, [socketRef.current, location]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    ringTone.current = new Audio("/sounds/guestRingTone.mp3");
  }, []);

  useEffect(() => {
    callRingTone.current = new Audio("/sounds/guest-call-ringtone.mp3");
  }, []);

  const [confirmLogoutModal, setConfirmLogoutModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    password: "",
  });

  const router = useRouter();

  useEffect(() => {
    if (confirmLogoutModal) {
      passwordRef.current?.focus();
    }
  }, [confirmLogoutModal]);

  const initiateCall = () => {
    if (socketRef.current) {
      const callId = generateUUID();
      socketRef.current.emit(
        "initiate-call",
        JSON.stringify({
          roomId: callId,
          LocationID: location?.LocationID,
        })
      );
      setInCall(true);
      setCallStatus("calling");
    }
  };

  const handleLogOut = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log({ formData });

    const cookies = parseCookies();
    const { userToken } = cookies;

    const decoded = jwt.decode(userToken) as { userName: string };
    const { userName } = decoded;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verifyUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ userName, password: formData.password }),
        }
      );

      if (response.status === 200) {
        logOut(router);
        return toast.custom((t: any) => (
          <Toast content="Logged Out Successfully" type="success" t={t} />
        ));
      } else {
        return toast.custom((t: any) => (
          <Toast content="Invalid Credentials!" type="error" t={t} />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast content="Something Went Wrong" type="error" t={t} />
      ));
    }
  };

  const handleOpenConfirmLogoutModal = () => {
    setConfirmLogoutModal(true);
  };

  const handleCloseConfirmLogoutModal = () => {
    setConfirmLogoutModal(false);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    if (currentUserVideoRef.current) {
      const currentVideo = currentUserVideoRef.current;
      currentVideo.volume = newVolume; // Set local video volume
    }

    if (remoteVideoRef.current) {
      const remoteVideo = remoteVideoRef.current;
      remoteVideo.volume = newVolume; // Set remote video volume
    }
  };

  const fetchLocationData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList`,
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
        console.log({ data });
        setLocation(data[0]);
      } else {
        return toast.custom((t: any) => (
          <Toast content="Error fetching location data" type="error" t={t} />
        ));
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      return toast.custom((t: any) => (
        <Toast content="Something Went Wrong" type="error" t={t} />
      ));
    }
  };

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
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      if (!userToken) {
        router.push("/"); // Redirect if token doesn't exist
      } else {
        const decoded = jwt.decode(userToken) as {
          userName: string;
          exp: number;
        };
        console.log({ decoded });

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decoded.exp < currentTime) {
          toast.custom((t: any) => (
            <Toast t={t} type="error" content="Token has expired" />
          ));
          console.error("Token has expired");
          logOut(router); // Log out if token has expired
        } else {
          const { userName } = decoded;
          setUserId(userName); // Set userId from token if valid
          fetchLocationData();
          fetchUserDetails();
        }
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      router.push("/"); // Redirect to login on error
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setAdvertisementStatus("video");
    }, 30000);
  }, []);

  // Livekit
  const guestVideoRef = useRef<HTMLDivElement>(null);
  const receptionistVideoRef = useRef<HTMLDivElement>(null);
  const receptionistVideoActive = useRef(false);

  const lkRoomRef = useRef<Room | null>(null);
  const localAudioTrackRef = useRef<Track | null>(null);

  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");

  useEffect(() => {
    if (!location) return;

    const connectToRoom = async () => {
      setStatus("connecting");

      try {
        const res = await fetch(
          `/api/token?identity=guest-${location.LocationID?.toString()}&room=${location.LocationID?.toString()}`
        );
        const { wsUrl, token } = await res.json();

        const lkRoom = new Room({
          adaptiveStream: true, // Optional, allows dynamic track resolution based on visibility
        });

        lkRoom.on("participantConnected", handleRemoteParticipant);
        lkRoom.on("trackPublished", handleTrackPublished);

        await lkRoom.connect(wsUrl, token);

        const videoTrack = await createLocalVideoTrack({
          resolution: VideoPresets.h720.resolution,
        });
        const audioTrack = await createLocalAudioTrack();

        await lkRoom.localParticipant.publishTrack(videoTrack, {
          simulcast: true,
          videoEncoding: {
            maxBitrate: 2_000_000, // 2 Mbps
            maxFramerate: 30,
          },
        });
        await lkRoom.localParticipant.publishTrack(audioTrack, {
          simulcast: true,
        });

        localAudioTrackRef.current = audioTrack;

        lkRoomRef.current = lkRoom;

        if (guestVideoRef.current) {
          const videoElement = videoTrack.attach();
          videoElement.className = "w-full h-full object-cover rounded-md";
          videoElement.muted = true;
          guestVideoRef.current.innerHTML = "";
          guestVideoRef.current.appendChild(videoElement);
        }

        // Set fallback initially
        clearReceptionistVideo();

        setStatus("connected");

        // Handle already connected participants
        lkRoom.remoteParticipants.forEach((p: any) => {
          handleRemoteParticipant(p);
        });

        function handleRemoteParticipant(p: RemoteParticipant) {
          if (!p.identity.startsWith("receptionist")) return;

          p.on("trackSubscribed", (track) => {
            if (track.kind === Track.Kind.Video) {
              renderReceptionistVideo(track as RemoteVideoTrack);
            } else if (track.kind === Track.Kind.Audio) {
              // Attach remote audio track
              const audioEl = track.attach();
              audioEl.autoplay = true;
              audioEl.controls = false;
              audioEl.muted = true;
              audioEl.style.display = "none"; // Hide the audio element
              document.body.appendChild(audioEl);
            }
          });

          p.on("trackUnsubscribed", (track: any) => {
            if (track.kind === Track.Kind.Video) {
              clearReceptionistVideo();
            } else if (track.kind === Track.Kind.Audio) {
              track.detach().forEach((el: any) => el.remove());
            }
          });

          // Render already subscribed tracks
          p.trackPublications.forEach((pub: any) => {
            if (
              pub.kind === Track.Kind.Video &&
              pub.isSubscribed &&
              pub.track
            ) {
              renderReceptionistVideo(pub.track as RemoteVideoTrack);
            } else if (
              pub.kind === Track.Kind.Audio &&
              pub.isSubscribed &&
              pub.track &&
              callStatusRef.current === "inProgress"
            ) {
              const audioEl = pub.track.attach();
              audioEl.autoplay = true;
              audioEl.controls = false;
              audioEl.muted = false;
              audioEl.style.display = "none";
              document.body.appendChild(audioEl);
            }
          });
        }

        function handleTrackPublished(
          pub: RemoteTrackPublication,
          participant: RemoteParticipant
        ) {
          if (
            participant.identity.startsWith("receptionist") &&
            pub.kind === Track.Kind.Video &&
            pub.isSubscribed
          ) {
            const track = pub.track as RemoteVideoTrack;
            renderReceptionistVideo(track);
          }
        }

        function renderReceptionistVideo(track: RemoteVideoTrack) {
          receptionistVideoActive.current = true;

          if (receptionistVideoRef.current) {
            receptionistVideoRef.current.innerHTML = "";
            const el = track.attach();
            el.className = "w-full h-full object-cover rounded-md";
            receptionistVideoRef.current.appendChild(el);
          }
        }

        function clearReceptionistVideo() {
          receptionistVideoActive.current = false;

          if (receptionistVideoRef.current) {
            receptionistVideoRef.current.innerHTML = `
              <div class="text-white text-center mt-12 text-lg">Virtual Receptionist</div>
            `;
          }
        }
      } catch (err) {
        console.error("Guest connect error:", err);
        setStatus("error");
      }
    };

    connectToRoom();

    return () => {
      // Optionally: add disconnect logic
    };
  }, [location, callStatus]);

  const handleToggleMute = () => {
    const audioTrack = localAudioTrackRef.current;
    if (audioTrack) {
      if (isMuted) {
        audioTrack.enable();
      } else {
        audioTrack.disable();
      }
      setIsMuted(!isMuted);

      socketRef.current?.emit(
        "participant-muted",
        JSON.stringify({
          locationID: location?.LocationID?.toString(),
          isMuted: !isMuted,
        })
      );
    }
  };

  return (
    <WithRole>
      <div className="w-full h-screen bg-background flex flex-col text-white">
        <div className="w-full h-16 flex items-center justify-between border-b-2 border-b-border z-50 bg-background px-2 absolute top-0 left-0">
          <div>
            {location?.LocationLogo ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${location?.LocationLogo}`}
                alt="Logo"
                width={1000}
                height={1000}
                className="w-28"
              />
            ) : (
              <h1 className="font-extrabold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                ORION.
              </h1>
            )}
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="font-bold text-[36px]">
              Welcome To {location?.LocationName}
            </h1>
          </div>
        </div>
        {!inCall && callStatus === "notInCall" && (
          <div className="w-full h-full flex relative">
            {/* Video Section (75% of the width) */}
            <div className="w-3/4 h-full pt-20 bg-zinc-900 flex flex-col items-center justify-center p-4 space-y-6">
              {advertisementStatus === "video" ? (
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${location?.LocationAdvertisementVideo}`}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover rounded-md border border-border"
                />
              ) : (
                location?.LocationImage && (
                  <img
                    src={
                      location?.LocationImage && location?.LocationImage !== ""
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${location?.LocationImage}`
                        : "/images/background.png"
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )
              )}
            </div>

            {/* Receptionist Section (25% of the width) */}
            <div className="w-1/4 h-full pt-20 bg-zinc-900 flex flex-col items-center justify-center p-4 space-y-6">
              {/* <h1 className="font-bold text-2xl text-white">Receptionist</h1> */}
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-4 bg-foreground border border-zinc-600 hover:bg-highlight duration-300 rounded-md p-4 cursor-pointer"
                onClick={initiateCall}
              >
                <img
                  src={
                    location?.LocationReceptionistPhoto &&
                    location?.LocationReceptionistPhoto !== ""
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${location?.LocationReceptionistPhoto}`
                      : "/images/receptionist.png"
                  }
                  alt="Receptionist"
                  className="w-28 rounded-full"
                />
                <h1 className="text-xl font-bold text-white whitespace-nowrap">
                  Meet Virtual Receptionist
                </h1>
              </div>
            </div>
          </div>
        )}
        {inCall && callStatus === "inProgress" && (
          <div className="w-full h-screen relative flex items-center justify-center overflow-hidden self-center">
            {/* Host Vieo */}
            <div className="w-3/4 h-full flex items-center justify-center absolute">
              <div
                className="w-full aspect-video rounded-md overflow-hidden shadow-md flex items-center justify-center"
                ref={receptionistVideoRef}
              >
                <div className="text-white text-center text-xl font-bold">
                  Waiting for receptionist...
                </div>
              </div>
              {/* Guest Video */}
              <div
                className="absolute bottom-28 -right-10 w-full max-w-md aspect-video bg-black rounded-md overflow-hidden shadow-md scale-75"
                ref={guestVideoRef}
              />
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2 rounded-md flex items-center gap-5">
              <button
                onClick={handleToggleMute}
                className="bg-highlight bg-opacity-50 text-white text-sm font-medium px-4 py-1 rounded"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              {/* <button
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
                className="w-6 h-6 flex items-center justify-center"
              /> 
            </button> */}
              <div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        )}
        {callStatus === "calling" && (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-bold text-xl">
              Calling Virtual Receptionist...
            </h1>
          </div>
        )}
        {callStatus === "missed" && (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-bold text-xl">
              Looks like the call wasn&apos;t picked up, please try again after
              sometime
            </h1>
          </div>
        )}
        {callStatus === "onHold" && (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-bold text-xl">
              Call On Hold, Thank you for your patience. We&apos;ll be with you
              shortly.
            </h1>
          </div>
        )}
        {callStatus === "transferred" && (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="font-bold text-xl">
              Your Call Is Being Transferred, Thank you for your patience.
              We&apos;ll be with you shortly.
            </h1>
          </div>
        )}
        {callStatus === "hostUnavailabe" && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center  justify-center space-y-5">
              <h1 className="font-bold text-xl">
                Looks like our virtual assistant is taking a short break. Please
                check back in a little while!
              </h1>
            </div>
          </div>
        )}
        <div className="absolute top-4 right-2 z-50 flex gap-3 items-center">
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 flex items-center justify-center bg-gray-300 rounded-full">
              {user?.UserPhoto === "" && (
                <h1 className="text-textAlt font-bold">
                  {user?.DisplayName?.split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </h1>
              )}
              {user?.UserPhoto !== "" && (
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user?.UserPhoto}`}
                  alt={user?.DisplayName?.split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                  className="w-full h-full object-cover rounded-full flex items-center justify-center"
                />
              )}
            </div>
            <div>
              <h1 className="font-bold text-xs">{user?.DisplayName}</h1>
            </div>
          </div>
          <div>
            <LogOut
              className="cursor-pointer w-5 h-5"
              color="red"
              onClick={handleOpenConfirmLogoutModal}
            />
          </div>
        </div>
        {confirmLogoutModal && (
          <Modal
            onClose={handleCloseConfirmLogoutModal}
            title="Confirm Log Out"
          >
            <div className="flex flex-col gap-2 p-2">
              <div>
                <h1 className="font-bold">Password</h1>
              </div>
              <form className="flex flex-col gap-2" onSubmit={handleLogOut}>
                <div>
                  <Input
                    ref={passwordRef}
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button text="Log Out" color="foreground" type="submit" />
                  <Button
                    text="Cancel"
                    color="foreground"
                    type="button"
                    onClick={handleCloseConfirmLogoutModal}
                  />
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </WithRole>
  );
}

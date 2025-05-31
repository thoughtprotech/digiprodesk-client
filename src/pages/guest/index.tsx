/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useEffect, useRef, useState } from "react";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Location, User } from "@/utils/types";
import generateUUID from "@/utils/uuidGenerator";
import WithRole from "@/components/WithRole";
import logOut from "@/utils/logOut";
import { LocalVideoTrack, Room, Track } from "livekit-client";
import { useSocket } from "@/context/SocketContext";
import { io } from "socket.io-client";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import {
  RoomAudioRenderer,
  RoomContext,
  useRoomContext,
  useTracks,
  TrackReferenceOrPlaceholder,
  TrackToggle,
  usePersistentUserChoices,
} from "@livekit/components-react";
import "@livekit/components-styles";
import GuestTile from "../../components/GuestTile";

export default function Index() {
  const [, setUserId] = useState<string>("");
  // const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  // const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
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
  // const [, setVolume] = useState<number>(1); // Volume range: 0 to 1
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

  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null); // loaded model
  // const [detectionStarted, setDetectionStarted] = useState(false); // run once
  // const hasNotifiedRef = useRef(false); // to track if notification has been sent
  const [currentCallID, setCurrentCallID] = useState<string>("");

  useEffect(() => {
    socketRef.current = socket;
    cocoSsd
      .load()
      .then((model: any) => {
        modelRef.current = model;
      })
      .catch(console.error);
  }, [socket]);

  useEffect(() => {
    if (socketRef.current && location) {
      socketRef.current.on("host-unavailable", (data) => {
        console.log("HOST NOT AVAILABLE", data);
        if (data.CallID === currentCallID) {
          setInCall(false);
          setCallStatus("hostUnavailabe");
          setTimeout(() => {
            setCallStatus("notInCall");
          }, 10000);
        }
      });

      socketRef.current.on("call-missed", (data) => {
        console.log("HOST NOT AVAILABLE", data);
        if (data.CallID === currentCallID) {
          setInCall(false);
          setCallStatus("missed");
          setTimeout(() => {
            setCallStatus("notInCall");
          }, 10000);
        }
      });

      socketRef.current.on("location-refresh-request", (data) => {
        if (data.locationID === location?.LocationID?.toString()) {
          console.log("Reloading page due to location refresh...");
          window.location.reload();
        }
      });

      socketRef.current.on("call-on-hold", (data) => {
        console.log({ data });
        console.log("INCOMING LOC ID", data.CallPlacedByLocationID);
        console.log("LOC ID", location?.LocationID?.toString());
        if (
          data.CallPlacedByLocationID?.toString() ===
          location?.LocationID?.toString()
        ) {
          roomInstance.remoteParticipants.forEach((participant) => {
            console.log("Participant:", participant.identity);
            if (participant.identity === data.CallAssignedTo) {
              participant.trackPublications.forEach((publication) => {
                publication.setSubscribed(false);
              });
              roomInstance.localParticipant.setMicrophoneEnabled(false);
              setInCall(false);
              setCallStatus("notInCall");
            }
          });
          setCallStatus("onHold");
        }
      });
    }
  }, [socketRef.current, location, currentCallID]);

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
    if (socketRef.current && location) {
      const callId = generateUUID();
      setCurrentCallID(callId);
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

  // const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newVolume = parseFloat(event.target.value);
  //   setVolume(newVolume);

  //   if (currentUserVideoRef.current) {
  //     const currentVideo = currentUserVideoRef.current;
  //     currentVideo.volume = newVolume; // Set local video volume
  //   }

  //   if (remoteVideoRef.current) {
  //     const remoteVideo = remoteVideoRef.current;
  //     remoteVideo.volume = newVolume; // Set remote video volume
  //   }
  // };

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
  // const receptionistVideoRef = useRef<HTMLDivElement>(null);
  // const receptionistVideoActive = useRef(false);
  const room = "quickstart-room";

  const [, setMicEnabled] = useState<boolean>(false);
  const [, setCameraEnabled] = useState<boolean>(true);

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  // “detected” flag so we don’t flood the console with repeated logs
  const [detected, setDetected] = useState(false);

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
    if (!location) return;
    let mounted = true;
    let detectionInterval: number | undefined;
    let model: cocoSsd.ObjectDetection;

    // 1) Load coco-ssd ONCE on mount
    const loadModel = async () => {
      model = await cocoSsd.load();
    };
    loadModel();
    (async () => {
      try {
        const resp = await fetch(
          `/api/token?room=${room}&username=${location.LocationID}`
        );
        const data = await resp.json();
        console.log({ data });
        if (!mounted) return;
        if (data.token) {
          await roomInstance.connect(
            process.env.NEXT_PUBLIC_LIVEKIT_URL!,
            data.token,
            {
              autoSubscribe: false,
            }
          );
          await roomInstance.localParticipant.setCameraEnabled(true);
          await roomInstance.localParticipant.setMicrophoneEnabled(false);
        }
        setTimeout(() => {
          attachLocalVideoTrackIfReady(model);
        }, 1000);

        function attachLocalVideoTrackIfReady(
          modelInstance: cocoSsd.ObjectDetection
        ) {
          if (
            !mounted ||
            !roomInstance.localParticipant ||
            !hiddenVideoRef.current
          ) {
            return;
          }

          // LiveKit v2: use getTrackPublications() to find our LocalVideoTrack
          const publications =
            roomInstance.localParticipant.getTrackPublications();

          let localVidTrack: LocalVideoTrack | undefined = undefined;
          for (const pub of publications.values()) {
            const track = pub.track;
            if (
              track &&
              track.kind === Track.Kind.Video &&
              track.source === Track.Source.Camera
            ) {
              localVidTrack = track as LocalVideoTrack;
              break;
            }
          }
          if (!localVidTrack) {
            console.warn("No local camera track found yet.");
            return;
          }

          // Build a MediaStream from the LocalVideoTrack
          const mediaStream = new MediaStream([localVidTrack.mediaStreamTrack]);
          const videoEl = hiddenVideoRef.current;
          videoEl.srcObject = mediaStream;
          videoEl.play().catch(() => {
            // play() might be blocked until user interaction; we can ignore.
          });

          // 4) Start a 1-second polling loop to run model.detect(...)
          detectionInterval = window.setInterval(async () => {
            if (!modelInstance || !hiddenVideoRef.current) return;
            const predictions = await modelInstance.detect(
              hiddenVideoRef.current
            );

            const foundPerson = predictions.some((p) => p.class === "person");
            if (foundPerson && !detected) {
              console.log("Person detected", location?.LocationID);
              setDetected(true);
              socketRef.current?.emit(
                "guest-detected",
                JSON.stringify({ locationID: location?.LocationID?.toString() })
              );
              // After 5 seconds, clear the flag so we can log again
              setTimeout(() => {
                setDetected(false);
              }, 5000);
            } else {
              socketRef.current?.emit(
                "guest-not-detected",
                JSON.stringify({ locationID: location?.LocationID?.toString() })
              );
              console.log("No Person Detected");
            }
          }, 3000);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      roomInstance.disconnect();
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [location]);

  const toggleLocalMute = async ({
    source,
    state,
  }: {
    source: "mic" | "camera";
    state: boolean;
  }) => {
    if (source === "mic") {
      console.log("Toggling Mic!", state);
      setMicEnabled(state);
      await roomInstance.localParticipant.setMicrophoneEnabled(state);
    } else {
      setCameraEnabled(state);
      await roomInstance.localParticipant.setCameraEnabled(state);
    }
  };

  useEffect(() => {
    if (socketRef.current && location) {
      socketRef.current.on("toggle-mic", (data) => {
        const { guestId } = data;
        console.log({ guestId });
        if (guestId === location?.LocationID?.toString()) {
          toggleLocalMute({
            source: "mic",
            state: !roomInstance.localParticipant.isMicrophoneEnabled,
          });
        }
      });

      socketRef.current.on("call-started", (data) => {
        const { guestId, hostId } = data;
        console.log({ guestId, hostId });

        if (guestId?.toString() === location?.LocationID?.toString()) {
          roomInstance.remoteParticipants.forEach((participant) => {
            if (participant.identity === hostId) {
              participant.trackPublications.forEach((publication) => {
                publication.setSubscribed(true);
              });
              roomInstance.localParticipant.setMicrophoneEnabled(true);
              setInCall(true);
              setCallStatus("inProgress");
              console.log("CALL STARTED");
            }
          });
        }
      });

      socketRef.current.on("host-unmute", (data) => {
        const { guestId, hostId } = data;

        if (guestId?.toString() === location?.LocationID?.toString()) {
          roomInstance.remoteParticipants.forEach((participant) => {
            if (participant.identity === hostId) {
              participant.audioTrackPublications.forEach((publication) => {
                console.log("HOST UNMUTUED", hostId);
                publication.setSubscribed(true);
                roomInstance.localParticipant.setMicrophoneEnabled(true);
              });
            }
          });
        }
      });

      socketRef.current.on("host-mute", (data) => {
        const { guestId, hostId } = data;

        if (guestId?.toString() === location?.LocationID?.toString()) {
          roomInstance.remoteParticipants.forEach((participant) => {
            if (participant.identity === hostId) {
              participant.audioTrackPublications.forEach((publication) => {
                console.log("HOST MUTED", hostId);
                publication.setSubscribed(false);
                roomInstance.localParticipant.setMicrophoneEnabled(false);
              });
            }
          });
        }
      });

      socketRef.current.on("call-end-guest", (data) => {
        const { guestId, hostId } = data;
        if (guestId === location?.LocationID?.toString()) {
          roomInstance.remoteParticipants.forEach((participant) => {
            console.log("Participant:", participant.identity);
            if (participant.identity === hostId) {
              participant.trackPublications.forEach((publication) => {
                publication.setSubscribed(false);
              });
              roomInstance.localParticipant.setMicrophoneEnabled(false);
              setInCall(false);
              setCallStatus("notInCall");
            }
          });
        }
      });
    }
  }, [socket, location]);

  const { saveAudioInputEnabled } = usePersistentUserChoices({
    preventSave: false,
  });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled]
  );

  return (
    <WithRole>
      {/* Hidden video for COCO-SSD */}
      <video
        ref={hiddenVideoRef}
        style={{ display: "none" }}
        muted
        playsInline
      />
      <RoomContext.Provider value={roomInstance}>
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
              <RoomAudioRenderer />
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
                        location?.LocationImage &&
                        location?.LocationImage !== ""
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
                  <div
                    style={{ display: "none" }}
                    className="absolute bottom-28 -right-10 w-full max-w-md aspect-video bg-black rounded-md overflow-hidden shadow-md scale-75"
                    ref={guestVideoRef}
                  />
                </div>
              </div>
            </div>
          )}
          {inCall && callStatus === "inProgress" && (
            <div
              className="relative w-full h-screen overflow-hidden flex justify-center items-center"
              data-lk-theme="default"
              style={{ height: "100dvh" }}
            >
              {/* Your custom component with basic video conferencing functionality. */}
              <MyVideoConference />
              {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
              <RoomAudioRenderer />
              {/* Controls for the user to start/stop audio, video, and screen share tracks */}
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="scale-150">
                  <TrackToggle
                    source={Track.Source.Microphone}
                    showIcon={true}
                    onChange={microphoneOnChange}
                  ></TrackToggle>
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
              <h1 className="font-bold text-xl text-center">
                Looks like the call wasn&apos;t picked up, please try again
                after sometime
              </h1>
            </div>
          )}
          {callStatus === "onHold" && (
            <div className="w-full h-full flex items-center justify-center">
              <h1 className="font-bold text-xl">
                Call On Hold, Thank you for your patience. We&apos;ll be with
                you shortly.
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
                  Looks like our virtual assistant is taking a short break.
                  Please check back in a little while!
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
      </RoomContext.Provider>
    </WithRole>
  );
}

function MyVideoConference() {
  const room = useRoomContext();
  const localSid = room.localParticipant.sid;

  // onlySubscribed: true so we only get what we're explicitly allowed to see
  const allTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true }
  );

  console.log({ allTracks });

  // filter out any track from the local participant
  const remoteTracks: TrackReferenceOrPlaceholder[] = allTracks.filter(
    (t) => t.participant.sid !== localSid && t.publication?.isSubscribed
  );

  remoteTracks.map((track) =>
    console.log("IS SUBSCRIBED?", track.publication?.isSubscribed)
  );

  const localTrack: TrackReferenceOrPlaceholder[] = allTracks.filter(
    (t) => t.participant.sid === localSid
  );

  return (
    <div className="w-3/4 h-fit aspect-video relative">
      {remoteTracks.map((track, idx) => (
        <div key={track.track?.sid ?? idx} className="aspect-video w-full">
          <GuestTile trackRef={track} />
        </div>
      ))}
      <div className="absolute bottom-2 left-2 aspect-video max-w-96 w-full h-fit">
        {localTrack[0] && <GuestTile trackRef={localTrack[0]} />}
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import MockCardData from "../../../mock/watchListMock.json";
import { FilePlus2, Headset, MicOff, PanelRightClose, PanelRightOpen, Pause, Phone, PhoneIncoming, PhoneOff, Trash, VideoOff } from "lucide-react";
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



export default function Index() {
  const [inCall, setInCall] = useState<{
    status: boolean;
    callId: string;
  }>({
    status: false,
    callId: ""
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
  }>({
    status: false,
    callId: ""
  });

  const handleFilterChange = (status: string) => {
    setFilter(status);
  };

  const filteredData = MockCardData.filter((card) => {
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

  const handleCallEnd = () => {
    if (bookingId === "") {
      document.getElementById("bookingId")?.focus();
      return toast.custom((t: any) => (<Toast t={t} type="warning" content="Booking ID Required" />));
    }

    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setInCall({
      status: false,
      callId: ""
    });
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Ended" />));
  }

  const handleCallHold = () => {
    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setInCall({
      status: false,
      callId: ""
    });

    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Put On Hold" />));
  }

  const handleConfirmEndCall = (callId: string) => {
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
      callId: ""
    });
    setInCall({
      status: true,
      callId
    });
    toast.custom((t: any) => (<Toast t={t} type="info" content="Call Ended" />));
    return toast.custom((t: any) => (<Toast t={t} type="info" content="Call Commenced" />));
  }

  const handleConfirmHoldCall = (callId: string) => {
    setScreenshotImage([]);
    setTakeScreenshot(false);
    setBookingId("");
    setCallNotes("");
    setConfirmEndCall({
      status: false,
      callId: ""
    });
    setInCall({
      status: true,
      callId
    });
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
          <h1 className='font-bold text-2xl'>CHECK-IN HUB</h1>
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
                  src="/videos/placeholder.mp4"
                />
              </div>

              {/* Screenshot Component */}
              {takeScreenshot && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent">
                  <ScreenshotComponent onScreenshotTaken={handleScreenshot} cancelScreenshot={cancelScreenshot} />
                </div>
              )}
              {/* Toolbar */}

            </div>
          ) : (
            <div className="w-full h-full bg-foreground border-2 border-border rounded-md mb-20 p-4 flex flex-col space-y-4 justify-center items-center">
              <div>
                <h1 className="font-bold text-2xl text-textAlt">Not In Call</h1>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className={`transition-all duration-300 ease-in-out ${isRightPanelCollapsed ? 'w-20' : 'w-1/3 pl-2'} h-[90.5vh]`}>
          {/* Summary Section */}
          {!isRightPanelCollapsed && (
            <div className="w-full h-full flex flex-col space-y-2 overflow-hidden">
              <div className="w-full flex space-x-4">
                <div
                  className={`w-full h-fit bg-sky-500/30 hover:bg-sky-500/50 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "all" ? "border-sky-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("all")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-sky-500 pr-2">
                      <Phone className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{MockCardData.filter(call => call.status === "hold" || call.status === "incoming").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-sky-500">CALLS</h1>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full h-fit bg-indigo-500/30 hover:bg-indigo-500/50 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "hold" ? "border-indigo-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("hold")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-indigo-500 pr-2">
                      <Pause className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{MockCardData.filter(call => call.status === "hold").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-indigo-500">ON HOLD</h1>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full h-fit bg-orange-500/30 hover:bg-orange-500/50 duration-300 rounded-md p-2 py-0.5 cursor-pointer border-2 ${filter === "incoming" ? "border-orange-500" : "border-transparent"}`}
                  onClick={() => handleFilterChange("incoming")}
                >
                  <div className="flex space-x-2 items-center">
                    <div className="border-r-2 border-r-orange-500 pr-2">
                      <PhoneIncoming className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-xl">{MockCardData.filter(call => call.status === "incoming").length}</h1>
                      <h1 className="w-fit text-[0.65rem] font-bold text-orange-500">INCOMING</h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`w-full ${inCall.status ? "h-1/2" : "h-full"} overflow-y-auto border-2 border-border rounded-md p-2`}>
                {/* Grid Section */}
                <div className={`w-full h-full pb-2 grid grid-cols-2 gap-2 auto-rows-min overflow-x-hidden`}>
                  {/* Show Incoming and On Hold Calls in 2 columns when filter is "all" */}
                  {filter === "all" && (
                    <>
                      {(() => {
                        const incomingCalls = MockCardData.filter((card) => card.status === "incoming");
                        const holdCalls = MockCardData.filter((card) => card.status === "hold");

                        const interleavedCalls: typeof MockCardData = [];
                        const maxLength = Math.max(incomingCalls.length, holdCalls.length);

                        for (let i = 0; i < maxLength; i++) {
                          if (i < incomingCalls.length) interleavedCalls.push(incomingCalls[i]);
                          if (i < holdCalls.length) interleavedCalls.push(holdCalls[i]);
                        }

                        return interleavedCalls.length > 0 ? (
                          interleavedCalls.map((card, index) => (
                            <CallingCard
                              key={index}
                              title={card.title}
                              status={card.status}
                              inCall={inCall}
                              setInCall={setInCall}
                              setConfirmEndCall={setConfirmEndCall}
                            />
                          ))
                        ) : (
                          <div className="col-span-full w-full rounded-md border-2 border-dashed border-border p-4">
                            <h1 className="text-center text-xl text-textAlt font-bold">No Calls Available</h1>
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
                          title={card.title}
                          status={card.status}
                          inCall={inCall}
                          setInCall={setInCall}
                          setConfirmEndCall={setConfirmEndCall}
                        />
                      ))
                    ) : (
                      <div className="w-full rounded-md border-2 border-dashed border-border p-4">
                        <h1 className="text-center text-xl text-textAlt font-bold">No Calls Available</h1>
                      </div>
                    )
                  )}
                </div>
              </div>
              {inCall.status && (
                <div className="w-full h-full max-h-[50%] flex flex-col space-y-2 justify-between items-center border-2 border-border rounded-md p-2 relative z-50">
                  <div className="w-full h-full flex flex-col space-y-2 overflow-y-auto overflow-x-hidden">
                    <div className="w-full flex justify-between items-center pb-1 sticky top-0 z-50 bg-background border-b-2 border-border">
                      <div className="flex flex-col">
                        <Chip text="CALL IN PROGRESS" className="bg-green-500/30 border-green-500 text-green-500 px-2" />
                        <h1 className="font-bold text-lg">{inCall.callId}</h1>
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
                                className="bg-red-500/60 border-2 border-red-500 hover:bg-red-500 duration-300 rounded-md px-1 p-1 absolute top-0 right-0" color="red" icon={
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
                        <h1 className="font-bold text-xl text-highlight">No Document Captured</h1>
                      </div>
                    )
                    }
                  </div>
                  <div className="w-full h-fit flex flex-col items-center border-t-2 border-t-border pt-2">
                    {/* Notes */}
                    <div className="w-full">
                      <textarea
                        placeholder="Notes (Optional)"
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
                        className={micMuted ? "bg-orange-500/30 border-2 border-orange-500 hover:bg-orange-500 duration-300 w-full rounded-md px-4 py-2 flex items-center justify-center space-x-1 cursor-pointer" : "w-full rounded-md bg-zinc-500/30 border-2 border-zinc-500 px-4 py-2 flex items-center justify-center space-x-1 hover:bg-zinc-500 duration-300 cursor-pointer"}
                        icon={<Tooltip tooltip={micMuted ? "Unmute Mic" : "Mute Mic"}>
                          <MicOff className="w-6 h-6" />
                        </Tooltip>} onClick={() => setMicMuted(!micMuted)} />
                      <Button
                        className={cameraOff ? "bg-orange-500/30 border-2 border-orange-500 hover:bg-orange-500 duration-300 w-full rounded-md px-4 py-2 flex items-center justify-center space-x-1 cursor-pointer" : "w-full rounded-md bg-zinc-500/30 border-2 border-zinc-500 px-4 py-2 flex items-center justify-center space-x-1 hover:bg-zinc-500 duration-300 cursor-pointer"}
                        icon={<Tooltip tooltip={cameraOff ? "Turn On Camera" : "Turn Off Camera"}>
                          <VideoOff className="w-6 h-6" />
                        </Tooltip>} onClick={() => setCameraOff(!cameraOff)} />
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
                    handleFilterChange("hold");
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
                callId: ""
              })}>
                <div className="w-full h-full flex flex-col gap-4 justify-center">
                  <div>
                    <h1 className="font-medium">Would you like to end or place the call on hold?</h1>
                  </div>
                  <div className="w-full flex justify-between gap-2 border-t-2 border-t-border pt-4">
                    <Button text="Hold Call" color="indigo" icon={<PhoneOff className="w-6 h-6" />} onClick={() => handleConfirmHoldCall(confirmEndCall.callId)} />
                    <Button text="End Call" color="red" icon={<PhoneOff className="w-6 h-6" />} onClick={() => handleConfirmEndCall(confirmEndCall.callId)} />
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

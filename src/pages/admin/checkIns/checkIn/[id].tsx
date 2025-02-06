/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from '@/components/Layout'
import { ArrowLeft, Calendar, Clock, FilePlus2, Ticket, Timer, Trash } from 'lucide-react';
import CallCard from '../_components/CallCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ImageViewer from '@/components/ui/ImageViewer';
import Tooltip from '@/components/ui/ToolTip';
import { parseCookies } from 'nookies';
import toast from 'react-hot-toast';
import Toast from '@/components/ui/Toast';
import { Call, CallLog, Location } from '@/utils/types';
import SearchInput from '@/components/ui/Search';
import Modal from '@/components/ui/Modal';

const callMapping: {
  [key: string]: {
    text: string;
    bg: string;
    color: string;
  };
} = {
  Start: {
    text: "Call Accepted",
    bg: "bg-green-500/30",
    color: "text-green-500"
  },
  Initiated: {
    text: "Call Initiated",
    bg: "bg-orange-500/30",
    color: "text-orange-500"
  },
  "On Hold": {
    text: "Call On Hold",
    bg: "bg-indigo-500/30",
    color: "text-indigo-500"
  },
  Resume: {
    text: "Call Resumed",
    bg: "bg-sky-500/30",
    color: "text-sky-500"
  },
  End: {
    text: "Call Ended",
    bg: "bg-red-500/30",
    color: "text-red-500"
  }
}

export function TimelineCard({ timestamp, status }: {
  timestamp: string | Date;
  status: string;
}) {
  return (
    <div className='w-full flex flex-col gap-1'>
      <div className='w-full flex flex-col gap-1'>
        <div className={`w-full flex items-center justify-between gap-2 ${callMapping[status].bg} p-1 px-2 rounded-md`}>
          <div>
            <h1 className='font-bold text-text text-xs'>{callMapping[status].text}</h1>
          </div>
          <div>
            <h1 className={`text-[0.6rem] ${callMapping[status].color} font-bold whitespace-nowrap`}>{
              new Date(timestamp).toLocaleTimeString()
            }</h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Index() {
  const [callList, setCallList] = useState<Call[]>([]);
  const [filteredCallList, setFilteredCallList] = useState<Call[]>([]);
  const [callLog, setCallLog] = useState<CallLog[]>();
  const [location, setLocation] = useState<Location>();
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [uploadDocumentModal, setUploadDocumentModal] = useState<boolean>(false);
  const [documentList, setDocumentList] = useState<string[]>([]);
  const [confirmCallChangeModal, setConfirmCallChangeModal] = useState<{
    status: boolean;
    call: Call | null;
  }>({
    status: false,
    call: null
  });
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    if (currentCall?.CallID) {
      const newVideoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${currentCall.CallID}.mp4`;
      setVideoUrl(newVideoUrl);
      setVideoError(false);
    }
  }, [currentCall?.CallID]);


  const router = useRouter();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const filteredData = callList.filter(data => data.CallBookingID?.includes(event.target.value) || data.CallID?.includes(event.target.value));
    setFilteredCallList(filteredData);
  }

  const handleCallChangePopUp = (call: Call) => {
    if (currentCall) {
      const prevCall = callList.find(call => call.CallID === currentCall?.CallID);

      if (prevCall && currentCall) {
        if (prevCall.CallBookingID !== currentCall.CallBookingID || prevCall.CallNotes !== currentCall.CallNotes || prevCall.CallDocuments !== currentCall.CallDocuments || documentList.length > 0) {
          setConfirmCallChangeModal({ status: true, call });
        } else {
          handleCallChange(call);
        }
      }
    } else {
      handleCallChange(call);
    }
  }

  const handleCallChange = (call: Call) => {
    setCurrentCall(call);
    fetchCallLog(call.CallID);
  }

  const fetchCallListData = async (locationID: number) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/call?CallPlacedByLocationID=${locationID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.status === 200) {
        const data = await response.json();
        setCallList(data);
        setFilteredCallList(data);
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to fetch call list data' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to fetch call list data' type='error' />)
    }
  }

  const fetchLocation = async (locationID: number) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location/${locationID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.status === 200) {
        const data = await response.json();
        setLocation(data);
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to fetch location list data' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to fetch location list data' type='error' />)
    }
  }

  const fetchCallLog = async (callID: string) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/callLog/${callID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.status === 200) {
        const data = await response.json();
        setCallLog(data);
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to fetch call log data' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to fetch call log data' type='error' />)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;

    // For input event, extract the file from event.target.files
    if (event.target instanceof HTMLInputElement && event.target.files) {
      file = event.target.files[0];
    }
    // For drag event, extract the file from event.dataTransfer.files
    else if ('dataTransfer' in event && event.dataTransfer?.files) {
      file = event.dataTransfer.files[0];
    }

    if (file) {
      const reader = new FileReader();

      // Read the file as a data URL (Base64)
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result as string; // This is the base64 string with the MIME type
        console.log({ base64String });  // This will log the base64-encoded string
        setDocumentList([...documentList, base64String]);
      };

      reader.onerror = () => {
        console.error('Error while reading the file');
      };
    } else {
      console.error('No file found');
    }
  };

  useEffect(() => {
    console.log({ documentList });
  }, [documentList])

  const updateCallInfo = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      if ((currentCall?.CallBookingID?.length ?? 0) > 50) {
        return toast.custom((t: any) => (<Toast t={t} type="warning" content="Booking ID Is Too Long" />));
      }

      if ((currentCall?.CallNotes?.length ?? 0) > 2000) {
        return toast.custom((t: any) => (<Toast t={t} type="warning" content="Call Notes Is Too Long" />));
      }

      const formData = new FormData();
      formData.append('CallID', currentCall!.CallID!);
      formData.append('CallBookingID', currentCall!.CallBookingID || "");
      formData.append('CallNotes', currentCall!.CallNotes || "");
      formData.append('CallDocuments', currentCall!.CallDocuments || "");

      if (documentList && documentList.length > 0) {
        documentList.forEach((base64String, index) => {
          const matches = base64String.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");

            // Convert the buffer to a Blob
            const blob = new Blob([buffer], { type: mimeType });
            const file = new File([blob], `document-${index + 1}.${mimeType.split('/')[1]}`);
            formData.append("CallDocument", file);
          }
        })
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/call`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      })
      fetchCallListData(Number(router.query.id));
      if (response.status === 200) {
        return toast.custom((t: any) => <Toast t={t} content='Call info updated successfully' type='success' />)
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to update call info' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to update call info' type='error' />)
    }
  }

  const handleUploadDocument = async () => {
    await updateCallInfo();
    setUploadDocumentModal(false);
    setDocumentList([]);
    setCurrentCall(null);
  }

  const downloadVideo = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      if (!currentCall) {
        return toast.custom((t: any) => <Toast t={t} content='No call selected' type='error' />)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${currentCall?.CallID}.mp4`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.status === 200) {
        const data = await response.blob();
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentCall?.CallBookingID ? `${currentCall?.CallBookingID}.mp4` : `${currentCall?.CallID}.mp4`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to download video' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to download video' type='error' />)
    }
  }

  useEffect(() => {
    if (router.isReady && router.query.id) {
      fetchCallListData(Number(router.query.id));
      fetchLocation(Number(router.query.id));
    }
  }, [router.isReady, router.query.id]);

  const formatDuration = (difference: number) => {
    const hours = Math.floor(difference / (60 * 60 * 1000));
    const minutes = Math.floor((difference % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((difference % (60 * 1000)) / 1000);

    let result = '';
    if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} min${minutes > 1 ? 's' : ''} `;
    if (seconds > 0 || result === '') result += `${seconds} second${seconds > 1 ? 's' : ''}`;
    return result.trim();
  };

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-lg'>CHECK-IN TRAILS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] flex flex-col-reverse gap-2'>
        <div className='w-full h-1/2 flex gap-2'>
          <div className='w-1/2 h-full max-h-[50vh] p-2 rounded-md bg-foreground flex flex-col gap-2 overflow-y-auto overflow-x-hidden relative'>
            <div className='w-full border-b border-b-border pb-2 sticky top-0 z-50 bg-foreground'>
              <div>
                <h1 className='text-xl font-bold'>Check In Details</h1>
              </div>
              {(currentCall && callLog) && (
                <div className="w-full flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Ticket className="w-4 text-textAlt" />
                    <h1 className="font text-sm text-textAlt whitespace-nowrap">{currentCall.CallBookingID || currentCall.CallID}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 text-textAlt" />
                    <h1 className="font text-sm text-textAlt whitespace-nowrap">
                      {new Date(currentCall.CreatedOn!).toLocaleDateString()}
                    </h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 text-textAlt" />
                    <h1 className="font text-sm text-textAlt whitespace-nowrap">{
                      new Date(currentCall.CreatedOn!).toLocaleTimeString()
                    }</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 text-textAlt" />
                    <h1 className="font text-sm text-textAlt whitespace-nowrap">{
                      formatDuration(
                        new Date(callLog![callLog!.length - 1].CallTimeStamp).getTime()
                        - new Date(callLog![0].CallTimeStamp).getTime()
                      )
                    }</h1>
                  </div>
                </div>
              )}
            </div>
            {/* Timeline and call details */}
            <div className='w-full h-full overflow-hidden'>
              {currentCall ? (
                <div className='w-full h-full overflow-hidden flex gap-2'>
                  <div className='w-1/2 px-2 h-full overflow-auto flex flex-col gap-2 border-r border-r-border relative'>
                    <div className='w-full flex bg-foreground sticky top-0'>
                      <h1 className='font-bold text-base'>Timeline</h1>
                    </div>
                    <div className='w-full h-full flex flex-col gap-1'>
                      {callLog && callLog!.map((callL, index) => {
                        const difference =
                          index < callLog!.length - 1
                            ? new Date(callLog![index + 1].CallTimeStamp).getTime() - new Date(callL.CallTimeStamp).getTime()
                            : 0;
                        return (
                          <div key={index} className='flex flex-col gap-1'>
                            <TimelineCard timestamp={callL.CallTimeStamp} status={callL.Type.trim()} />
                            {index < callLog!.length - 1 && (
                              <div className='w-full flex items-center justify-center gap-2 bg-foreground border-2 border-border border-dashed p-1 px-2 rounded-md'>
                                <div>
                                  {/* <PhoneIncoming className='w-4 text-sky-500' /> */}
                                  <h1 className='text-[0.6rem] text-textAlt font-bold whitespace-nowrap'>{ }
                                    {/* Difference of timestamp of next timestamp and current */}
                                    {difference > 0 ? `${formatDuration(difference)}` : ""}
                                  </h1>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {
                    currentCall && (
                      <div onSubmit={updateCallInfo} className='w-1/2 h-full flex flex-col gap-2'>
                        <div>
                          <div>
                            <h1 className='font-bold text-base'>Booking ID</h1>
                          </div>
                          <div className='w-full h-full'>
                            <Input type='text' placeholder='Enter Booking ID' value={currentCall?.CallBookingID || ""} onChange={
                              (event) => setCurrentCall({ ...currentCall, CallBookingID: event.target.value })
                            } />
                          </div>
                        </div>
                        <div className='w-full h-full'>
                          <div>
                            <h1 className='font-bold text-base'>Notes</h1>
                          </div>
                          <div className='w-full h-5/6'>
                            <Input type='textArea' placeholder='Enter Notes' value={currentCall?.CallNotes} onChange={
                              (event) => setCurrentCall({ ...currentCall, CallNotes: event.target.value })
                            } />
                          </div>
                        </div>
                        <div className='w-full flex items-center justify-end'>
                          <Button altClassName="w-full max-w-full" text='Save' color='foreground' onClick={updateCallInfo} />
                        </div>
                      </div>
                    )
                  }
                </div>
              ) : (
                <div className='w-full h-full max-h-[50vh] p-2 rounded-md flex flex-col items-center justify-center gap-2 overflow-auto relative'>
                  <h1 className='text-xl font-bold text-textAlt'>Select A Check In</h1>
                </div>
              )}
            </div>
          </div>
          {/* Documents */}
          <div className='w-1/2 h-full rounded-md bg-foreground flex flex-col gap-2 overflow-auto overflow-x-hidden relative'>
            <div className='w-full flex items-center bg-foreground justify-between border-b border-b-border pb-2 p-2 sticky top-0'>
              <div className='w-full'>
                <div>
                  <h1 className='text-xl font-bold'>Documents</h1>
                </div>
              </div>
              {currentCall && (
                <div>
                  <Button text='Document' icon={<FilePlus2 className='w-5 h-5' />} color="zinc" onClick={setUploadDocumentModal.bind(null, true)} />
                </div>
              )}
            </div>
            {currentCall ? (
              <div className='p-2'>
                {/* Grid of black boxes */}
                {
                  currentCall.CallDocuments && currentCall.CallDocuments !== "" ? (
                    <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
                      {
                        currentCall.CallDocuments?.split("|").map((doc, i) => (
                          <div key={i} className='w-32 h-32 rounded-md flex flex-col justify-center items-center gap-2 relative'>
                            <ImageViewer src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${doc}`
                            }>
                              <img
                                src={
                                  `${process.env.NEXT_PUBLIC_BACKEND_URL}${doc}`
                                }
                                alt="Logo"
                                className="w-full object-fill"
                              />
                            </ImageViewer>
                            <Button
                              className="bg-red-500/60 border border-red-500 hover:bg-red-500 duration-300 rounded-md px-1 p-1 absolute top-0 right-0" color="red" icon={
                                <Tooltip tooltip="Delete Document" position="top">
                                  <Trash className="w-3 h-3 text-text" />
                                </Tooltip>
                              }
                              onClick={() => {
                                const docArray = currentCall.CallDocuments?.split("|");
                                const filteredDocs = docArray?.filter((doc, index) => index !== i);
                                let updatedDocs = filteredDocs?.join("|");
                                if (updatedDocs == "null") {
                                  updatedDocs = "";
                                }
                                setCurrentCall({ ...currentCall, CallDocuments: updatedDocs });
                              }}
                            />
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className='w-full h-44 border-2 rounded-md border-border border-dashed flex items-center justify-center'>
                      <h1 className='text-xl font-bold text-textAlt'>No Documents Uploaded</h1>
                    </div>
                  )
                }
              </div>
            ) : (
              <div className='w-full h-full rounded-md flex items-center justify-center'>
                <h1 className='text-xl font-bold text-textAlt'>Select A Check In</h1>
              </div>
            )}
          </div>
        </div>
        <div className='w-full h-1/2 max-h-[44vh] bg-background rounded-md flex gap-2'>
          <div className='w-1/4 h-full rounded-md bg-foreground flex flex-col overflow-auto relative'>
            <div className='w-full h-full flex flex-col space-y-2'>
              <div className='w-full flex flex-col gap-1 sticky top-0 border-b border-b-border z-30 bg-foreground p-2'>
                <div className='w-full flex  items-center gap-2'>
                  <div>
                    <ArrowLeft className='w-5 h-5 cursor-pointer' onClick={() => {
                      router.push('/admin/checkIns')
                    }} />
                  </div>
                  <div>
                    <h1 className='text-xl font-bold'>{location?.LocationName}</h1>
                  </div>
                </div>
                <div className="w-full flex justify-between items-center">
                  <div className='w-full'>
                    <SearchInput placeholder='Booking ID' onChange={handleOnChange} />
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-2 px-2'>
                {
                  filteredCallList.map((call, index) => (
                    <CallCard key={index}
                      name={call.CallAssignedTo!}
                      date={new Date(call.CallStartDateTime!).toLocaleDateString()}
                      time={new Date(call.CallStartDateTime!).toLocaleTimeString()}
                      ticket={call.CallBookingID || call.CallID}
                      onClick={handleCallChangePopUp.bind(null, call)} />
                  ))
                }
              </div>
            </div>
          </div>
          {currentCall ? (
            <div className='w-3/4 h-full bg-black rounded-md relative'>
              <div className='absolute w-full flex items-center justify-between pb-2 p-2 top-0 z-50'>
                <div className='w-full'>
                  <div>
                    <h1 className='text-xl font-bold'>Video</h1>
                  </div>
                </div>
                {currentCall?.CallVideoProcessingStatus === 'Completed' && (
                  <div>
                    <Button text='Download' color='foreground' onClick={downloadVideo} />
                  </div>
                )}
              </div>
              <div className='w-full h-full'>
                {!videoError ? (
                  <div className='w-full h-full'>
                    {currentCall?.CallVideoProcessingStatus === 'Completed' ? (
                      <video className='w-full h-full' key={videoUrl} autoPlay controls onError={() => setVideoError(true)}>
                        <source src={videoUrl} type='video/mp4' />
                      </video>
                    ) :
                      currentCall?.CallVideoProcessingStatus === 'Processing' ? (
                        <div className='w-full h-full flex items-center justify-center'>
                          <h1 className='text-xl font-bold text-textAlt'>Processing Video, Please Wait...</h1>
                        </div>
                      ) : currentCall?.CallVideoProcessingStatus === 'Pending' ? (
                        <div className='w-full h-full flex items-center justify-center'>
                          <h1 className='text-xl font-bold text-textAlt'>Video Processing Is Pending. Please Check Back Later.</h1>
                        </div>
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <h1 className='text-xl font-bold text-textAlt'>Something Went Wrong.</h1>
                        </div>
                      )
                    }
                  </div>
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <h1 className='text-xl font-bold text-textAlt'>No Video Available.</h1>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='w-3/4 h-full rounded-md flex flex-col'>
              <div className='w-full flex items-center bg-foreground justify-between border-b border-b-border pb-2 p-2 sticky top-0'>
                <div className='w-full'>
                  <div>
                    <h1 className='text-xl font-bold'>Video</h1>
                  </div>
                </div>
              </div>
              <div className='w-full h-full bg-foreground flex items-center justify-center'>
                <h1 className='text-xl font-bold text-textAlt'>Select A Check In</h1>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadDocumentModal && (
        <Modal className='w-1/2' title='Upload Documents' onClose={setUploadDocumentModal.bind(null, false)}>
          <div className='w-full h-full flex flex-col gap-4 py-2'>
            <div className='flex flex-col gap-1'>
              <h1 className='font-bold'>Upload Documents</h1>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png"
                className="w-64 cursor-pointer min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm"
              />
            </div>
            {
              documentList.length > 0 ? (
                <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 justify-center items-start">
                  {documentList.map((doc, i) => {
                    return (
                      <div key={i} className='w-40 h-40 rounded-md flex flex-col gap-2 items-center justify-center relative'>
                        <ImageViewer src={doc}>
                          <img
                            src={doc}
                            alt="Logo"
                            className="w-full object-fill"
                          />
                        </ImageViewer>
                        <Button
                          className="bg-red-500/60 border border-red-500 hover:bg-red-500 duration-300 rounded-md px-1 p-1 absolute top-0 right-0" color="red" icon={
                            <Tooltip tooltip="Delete Document" position="top">
                              <Trash className="w-3 h-3 text-text" />
                            </Tooltip>
                          }
                          onClick={() => {
                            const filteredDocs = documentList.filter((doc, index) => index !== i);
                            setDocumentList(filteredDocs);
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='w-full h-44 border-2 rounded-md border-border border-dashed flex items-center justify-center'>
                  <h1 className='text-xl font-bold text-textAlt'>No Documents Uploaded</h1>
                </div>
              )
            }
            <div className='w-full flex items-center justify-center'>
              <Button text='Save' color='foreground' onClick={handleUploadDocument} />
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Call Change Modal */}
      {confirmCallChangeModal.status && (
        <Modal className='w-1/4' title='Confirm Call Change' onClose={setConfirmCallChangeModal.bind(null, { status: false, call: null })}>
          <div className='w-full h-full flex flex-col gap-4 py-2'>
            <div className='flex flex-col gap-1'>
              <h1 className='font-bold'>Would you like to save your changes?</h1>
            </div>
            <div className='w-full flex items-center justify-center gap-4'>
              <Button text='Yes' color='foreground' onClick={() => {
                updateCallInfo();
                handleCallChange(confirmCallChangeModal.call!);
                setConfirmCallChangeModal({ status: false, call: null });
              }} />
              <Button text='No' color='foreground' onClick={() => {
                setConfirmCallChangeModal({ status: false, call: null });
              }} />
            </div>
          </div>
        </Modal>
      )}
    </Layout >
  )
}
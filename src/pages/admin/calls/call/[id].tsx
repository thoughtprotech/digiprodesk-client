import Layout from '@/components/Layout'
import { ArrowLeft, Calendar, Clock, FilePlus2, Ticket, Timer, Trash } from 'lucide-react';
import CallCard from '../_components/CallCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import ImageViewer from '@/components/ui/ImageViewer';
import Tooltip from '@/components/ui/ToolTip';

interface Call {
  roomId: string;
  from: string;
  status: string;
  to: string;
  bookingId?: string;
  timestamps: {
    timestamp: string;
    status: 'pending' | 'accepted' | 'onHold' | 'resumed' | 'end';
  }[]
}

const callMock: Call =
{
  roomId: '1',
  from: 'John Doe',
  status: 'pending',
  bookingId: 'BKID123',
  to: 'Jane Doe',
  timestamps: [
    {
      timestamp: '2025-01-01T08:00:30.564Z',
      status: 'pending',
    },
    {
      timestamp: '2025-01-01T08:02:05.564Z',
      status: 'accepted'
    },
    {
      timestamp: '2025-01-01T08:05:00.564Z',
      status: 'onHold'
    },
    {
      timestamp: '2025-01-01T08:10:00.564Z',
      status: 'resumed'
    },
    {
      timestamp: '2025-01-01T08:15:00.564Z',
      status: 'end'
    }
  ]
};

const callMapping: {
  [key: string]: {
    text: string;
    bg: string;
    color: string;
  };
} = {
  pending: {
    text: "Call Initiated",
    bg: "bg-orange-500/30",
    color: "text-orange-500"
  },
  accepted: {
    text: "Call Accepted",
    bg: "bg-green-500/30",
    color: "text-green-500"
  },
  onHold: {
    text: "Call On Hold",
    bg: "bg-indigo-500/30",
    color: "text-indigo-500"
  },
  resumed: {
    text: "Call Resumed",
    bg: "bg-violet-500/30",
    color: "text-violet-500"
  },
  end: {
    text: "Call Ended",
    bg: "bg-red-500/30",
    color: "text-red-500"
  }
}

export function TimelineCard({ timestamps }: {
  timestamps: {
    timestamp: string;
    status: string;
  }[]
}) {
  return (
    <div className='w-full flex flex-col gap-1'>
      {timestamps.map((timestamp, index) => (
        <div key={index} className='w-full flex flex-col gap-1'>
          <div className={`w-full flex items-center justify-between gap-2 ${callMapping[timestamp.status].bg} p-1 px-2 rounded-md`}>
            <div>
              <h1 className='font-bold text-text'>{callMapping[timestamp.status].text}</h1>
            </div>
            <div>
              <h1 className={`text-[0.6rem] ${callMapping[timestamp.status].color} font-bold whitespace-nowrap`}>{
                new Date(timestamp.timestamp).toLocaleTimeString()
              }</h1>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const mockCardData: {
  id: string;
  name: string;
  date: string;
  time: string;
  ticket: string;
}[] = [
    {
      id: '1',
      name: 'John Doe',
      date: '01-01-2025',
      time: '08:00 AM',
      ticket: 'BKID123'
    },
    {
      id: '2',
      name: 'Jane Doe',
      date: '01-01-2025',
      time: '08:00 AM',
      ticket: 'BKID124'
    },
    {
      id: '3',
      name: 'John Doe',
      date: '01-01-2025',
      time: '08:00 AM',
      ticket: 'BKID125'
    },
    {
      id: '4',
      name: 'Jane Doe',
      date: '01-01-2025',
      time: '08:00 AM',
      ticket: 'BKID126'
    },
  ]

export default function Index() {
  const [bookingId, setBookingId] = useState<string>('');
  const [callLogList, setCallLogList] = useState<{
    id: string;
    name: string;
    date: string;
    time: string;
    ticket: string;
  }[]>([]);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);

  const router = useRouter();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingId(event.target.value);
    console.log(event.target.value)
    const filteredData = mockCardData.filter(data => data.ticket.includes(event.target.value));
    setCallLogList(filteredData);
  }

  const handleCallChange = () => {
    setCurrentCall(callMock);
  }

  useEffect(() => {
    setCallLogList(mockCardData);
  }, [mockCardData])

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
          <h1 className='font-bold text-lg'>CHECK IN</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] flex flex-col-reverse gap-2'>
        <div className='w-full h-1/2 flex gap-2'>
          <div className='w-1/2 h-full max-h-[50vh] p-2 rounded-md bg-foreground flex flex-col gap-2 overflow-auto relative'>
            <div className='w-full border-b border-b-border pb-2 sticky top-0 z-50 bg-foreground'>
              <div>
                <h1 className='text-2xl font-bold'>Call Details</h1>
              </div>
              {currentCall && (
                <div className="w-full flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Ticket className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">{currentCall.bookingId}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">
                      {new Date(currentCall.timestamps[0].timestamp).toLocaleDateString()}
                    </h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">{
                      new Date(currentCall.timestamps[0].timestamp).toLocaleTimeString()
                    }</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">{
                      formatDuration(
                        new Date(currentCall.timestamps[currentCall.timestamps.length - 1].timestamp).getTime()
                        - new Date(currentCall.timestamps[0].timestamp).getTime()
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
                      <h1 className='font-bold text-xl'>Timeline</h1>
                    </div>
                    <div className='w-full h-full flex flex-col gap-1'>
                      {currentCall.timestamps.map((timestamp, index) => {
                        const difference =
                          index < currentCall.timestamps.length - 1
                            ? new Date(currentCall.timestamps[index + 1].timestamp).getTime() - new Date(timestamp.timestamp).getTime()
                            : 0;
                        return (
                          <div key={index} className='flex flex-col gap-1'>
                            <TimelineCard timestamps={[timestamp]} />
                            {index < currentCall.timestamps.length - 1 && (
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
                  <div className='w-1/2 h-full flex flex-col gap-2'>
                    <div>
                      <div>
                        <h1 className='font-bold text-xl'>Booking ID</h1>
                      </div>
                      <div className='w-full h-full'>
                        <Input type='text' placeholder='Enter Booking ID' />
                      </div>
                    </div>
                    <div className='w-full h-full'>
                      <div>
                        <h1 className='font-bold text-xl'>Notes</h1>
                      </div>
                      <div className='w-full h-5/6'>
                        <Input type='textArea' placeholder='Enter Notes' />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='w-full h-full max-h-[50vh] p-2 rounded-md flex flex-col items-center justify-center gap-2 overflow-auto relative'>
                  <h1 className='text-2xl font-bold text-textAlt'>Select A Check In</h1>
                </div>
              )}
            </div>
          </div>
          {/* Documents */}
          <div className='w-1/2 h-full rounded-md bg-foreground flex flex-col gap-2 overflow-auto overflow-x-hidden relative'>
            <div className='w-full flex items-center bg-foreground justify-between border-b border-b-border pb-2 p-2 sticky top-0'>
              <div className='w-full'>
                <div>
                  <h1 className='text-2xl font-bold'>Documents</h1>
                </div>
              </div>
              {currentCall && (
                <div>
                  <Button text='Document' icon={<FilePlus2 className='w-5 h-5' />} color="zinc" onClick={() => console.log('Add Document')} />
                </div>
              )}
            </div>
            {currentCall ? (
              <div className='p-2'>
                {/* Grid of black boxes */}
                <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
                  {
                    Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className='w-full h-fit rounded-md flex flex-col gap-2 bg-black relative'>
                        <ImageViewer src={"/images/doc.png"}>
                          <Image
                            src="/images/doc.png"
                            alt="Logo"
                            width={1000}
                            height={1000}
                            className="w-full object-fill"
                          />
                        </ImageViewer>
                        <Button
                          className="bg-red-500/60 border border-red-500 hover:bg-red-500 duration-300 rounded-md px-1 p-1 absolute top-0 right-0" color="red" icon={
                            <Tooltip tooltip="Delete Document" position="top">
                              <Trash className="w-3 h-3 text-text" />
                            </Tooltip>
                          } />
                      </div>
                    ))
                  }
                </div>
              </div>
            ) : (
              <div className='w-full h-full rounded-md flex items-center justify-center'>
                <h1 className='text-2xl font-bold text-textAlt'>Select A Check In</h1>
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
                      router.push('/admin/calls')
                    }} />
                  </div>
                  <div>
                    <h1 className='text-2xl font-bold'>Olive Indiranagar</h1>
                  </div>
                  {/* <div className="flex items-center gap-1">
                    <Phone className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">7 Calls</h1>
                  </div> */}
                </div>
                <div className="w-full flex justify-between items-center">
                  <div className='w-full'>
                    <Input value={bookingId} className="py-1" type='text' placeholder='Booking ID' onChange={handleOnChange} />
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-2 px-2'>
                {
                  callLogList.map((call, index) => (
                    <CallCard key={index} {...call} onClick={handleCallChange} />
                  ))
                }
              </div>
            </div>
          </div>
          {currentCall ? (
            <div className='w-3/4 h-full bg-black rounded-md'></div>
          ) : (
            <div className='w-3/4 h-full rounded-md flex flex-col'>
              <div className='w-full flex items-center bg-foreground justify-between border-b border-b-border pb-2 p-2 sticky top-0'>
                <div className='w-full'>
                  <div>
                    <h1 className='text-2xl font-bold'>Video</h1>
                  </div>
                </div>
              </div>
              <div className='w-full h-full bg-foreground flex items-center justify-center'>
                <h1 className='text-2xl font-bold text-textAlt'>Select A Check In</h1>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout >
  )
}
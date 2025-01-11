import Layout from '@/components/Layout'
import { Backpack, Calendar, Clock, FilePlus2, Pause, Phone, PhoneIncoming, PhoneOff, Play, Ticket } from 'lucide-react';
import CallCard from '../_components/CallCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useEffect, useState } from 'react';

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
  const [currentCall, setCurrentCall] = useState<string>("");

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookingId(event.target.value);
    console.log(event.target.value)
    const filteredData = mockCardData.filter(data => data.ticket.includes(event.target.value));
    setCallLogList(filteredData);
  }

  const handleCallChange = (id: string) => {
    setCurrentCall(id);
  }

  useEffect(() => {
    setCallLogList(mockCardData);
  }, [mockCardData])

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <Backpack />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>Check In</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] flex flex-col-reverse gap-2'>
        <div className='w-full h-1/2 flex gap-2'>
          <div className='w-1/4 h-full max-h-[50vh] p-2 rounded-md bg-foreground flex flex-col gap-2 overflow-auto relative'>
            <div className='w-full border-b border-b-border pb-2 sticky top-0 z-50 bg-foreground'>
              <div>
                <h1 className='text-2xl font-bold'>Call Details</h1>
              </div>
              {currentCall !== "" && (
                <div className="w-full flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">01-01-2025</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">08:00 AM</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ticket className="w-4 text-textAlt" />
                    <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">BKID123456</h1>
                  </div>
                </div>
              )}
            </div>
            {currentCall ? (
              <div className='w-full h-full flex flex-col gap-2'>
                <div>
                  <h1 className='font-bold text-xl'>Timeline</h1>
                </div>
                <div className='w-full h-full flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                      <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:00 AM</h1>
                    </div>
                    <div className='w-fit flex flex-col bg-sky-700/30 p-1 px-2 rounded-md'>
                      <div className='w-fit flex justify-center items-center gap-2'>
                        <PhoneIncoming className='w-4 ' />
                        <h1 className='font-bold text-sm'>Call Inbound</h1>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                      <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:00 AM</h1>
                    </div>
                    <div className='w-fit flex flex-col bg-green-700/30 p-1 px-2 rounded-md'>
                      <div className='w-fit flex justify-center items-center gap-2'>
                        <Phone className='w-4 ' />
                        <h1 className='font-bold text-sm'>Call Accepted</h1>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                      <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:02 AM</h1>
                    </div>
                    <div className='w-fit flex flex-col bg-indigo-700/30 p-1 px-2 rounded-md'>
                      <div className='w-fit flex justify-center items-center gap-2'>
                        <Pause className='w-4 ' />
                        <h1 className='font-bold text-sm'>Call Put On Hold</h1>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                      <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:02 AM</h1>
                    </div>
                    <div className='w-fit flex flex-col bg-purple-700/30 p-1 px-2 rounded-md'>
                      <div className='w-fit flex justify-center items-center gap-2'>
                        <Play className='w-4 ' />
                        <h1 className='font-bold text-sm'>Call Resumed</h1>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                      <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:05 AM</h1>
                    </div>
                    <div className='w-fit flex flex-col bg-red-700/30 p-1 px-2 rounded-md'>
                      <div className='w-fit flex justify-center items-center gap-2'>
                        <PhoneOff className='w-4 ' />
                        <h1 className='font-bold text-sm'>Call Ended</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='w-full h-full max-h-[50vh] p-2 rounded-md flex flex-col items-center justify-center gap-2 overflow-auto relative'>
                <h1 className='text-2xl font-bold text-textAlt'>Select A Session</h1>
              </div>
            )}
          </div>
          <div className='w-3/4 h-full rounded-md bg-foreground flex flex-col gap-2 overflow-auto relative'>
            <div className='w-full flex items-center bg-foreground justify-between border-b border-b-border pb-2 p-2 sticky top-0'>
              <div className='w-full'>
                <div>
                  <h1 className='text-2xl font-bold'>Documents</h1>
                </div>
                {currentCall !== "" && (
                  <div className="flex items-center gap-1">
                    <h1 className="font-semibold text-sm text-textAlt border-r border-r-border pr-2">Notes</h1>
                    <div>
                      <h1 className='text-xs text-textAlt'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id odio beatae dignissimos nostrum </h1>
                    </div>
                  </div>
                )}
              </div>
              {currentCall !== "" && (
                <div>
                  <Button text='Add Document' icon={<FilePlus2 className='w-5 h-5' />} color="zinc" onClick={() => console.log('Add Document')} />
                </div>
              )}
            </div>
            {currentCall ? (
              <div className='p-2'>
                {/* Grid of black boxes */}
                <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
                  {
                    Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className='w-full h-32 rounded-md flex flex-col gap-2 bg-black'>

                      </div>
                    ))
                  }
                </div>
              </div>
            ) : (
              <div className='w-full h-full rounded-md flex items-center justify-center'>
                <h1 className='text-2xl font-bold text-textAlt'>Select A Session</h1>
              </div>
            )}
          </div>
        </div>
        <div className='w-full h-1/2 max-h-[44vh] bg-background rounded-md flex gap-2'>
          <div className='w-1/4 h-full rounded-md bg-foreground flex flex-col overflow-auto relative'>
            <div className='w-full h-full flex flex-col space-y-2'>
              <div className='w-full flex flex-col gap-1 sticky top-0 border-b border-b-border  z-50 bg-foreground p-2'>
                <div className='w-full flex  items-center justify-between'>
                  <h1 className='text-2xl font-bold'>Olive Indiranagar</h1>
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
                    <CallCard key={index} {...call} onClick={() => handleCallChange(call.id)} />
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
                <h1 className='text-2xl font-bold text-textAlt'>Select A Session</h1>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout >
  )
}
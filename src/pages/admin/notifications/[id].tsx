/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from '@/components/Layout'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import toast from 'react-hot-toast';
import Toast from '@/components/ui/Toast';
import { Call, Location } from '@/utils/types';
import { ArrowLeft, Clock, User } from 'lucide-react';
import ElapsedTime from '@/components/ui/ElapsedTime';

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
  const [, setCallList] = useState<Call[]>([]);
  const [filteredCallList, setFilteredCallList] = useState<Call[]>([]);
  const [location, setLocation] = useState<Location>();

  const router = useRouter();

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
        console.log({ data });
        setCallList(data.sort((a: any, b: any) =>
          new Date(b.CallStartDateTime).getTime() - new Date(a.CallStartDateTime).getTime()
        ));
        setFilteredCallList(data.sort((a: any, b: any) =>
          new Date(b.CallStartDateTime).getTime() - new Date(a.CallStartDateTime).getTime()
        ));
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

  useEffect(() => {
    if (router.isReady && router.query.id) {
      fetchCallListData(Number(router.query.id));
      fetchLocation(Number(router.query.id));
    }
  }, [router.isReady, router.query.id]);

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-lg'>NOTIFICATIONS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] flex flex-col gap-2 overflow-hidden bg-foreground rounded-md p-2'>
        <div className='w-full border-b border-b-border pb-2 flex items-center gap-2'>
          <div>
            <ArrowLeft className='w-8 h-8 cursor-pointer' onClick={() => {
              router.push('/admin/checkIns')
            }} />
          </div>
          <div>
            <h1 className='font-bold text-3xl'>{location?.LocationName}</h1>
          </div>
        </div>
        {
          filteredCallList.filter(call => call.CallStatus !== "Completed").length !== 0 ? (
            <div className='w-full h-full flex overflow-y-auto'>
              {filteredCallList.filter(call => call.CallStatus === "New").length !== 0 && (
                <div className='w-1/4 h-full flex flex-col gap-2 p-2'>
                  <>
                    {filteredCallList.filter((call) => call.CallStatus === 'New').map((call) => (
                      <div key={call.CallID} className='w-full p-2 rounded-md bg-background flex flex-col gap-1'>
                        <div className='w-full flex items-center justify-between border-b border-b-border pb-2'>
                          <div>
                            <h1 className='font-bold text-orange-500'>Pending</h1>
                          </div>
                          <div>
                            <ElapsedTime startTime={call.CallStartDateTime!} />
                          </div>
                        </div>
                        <div className='w-full flex gap-2 items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-4 h-4' />
                            <h1 className='font-medium'>{new Date(call.CallStartDateTime!).toLocaleTimeString()}</h1>
                          </div>
                          <div className='flex items-center gap-1'>
                            <User className='w-4 h-4' />
                            <h1 className='font-medium'>{call.CallAssignedTo}</h1>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                </div>
              )}
              {filteredCallList.filter(call => call.CallStatus === "In Progress").length !== 0 && (
                <div className='w-1/4 h-full flex flex-col gap-2 p-2'>
                  <>
                    {filteredCallList.filter((call) => call.CallStatus === 'In Progress').map((call) => (
                      <div key={call.CallID} className='w-full p-2 rounded-md bg-background flex flex-col gap-1'>
                        <div className='w-full flex items-center justify-between border-b border-b-border pb-2'>
                          <div>
                            <h1 className='font-bold text-green-500'>In Progress</h1>
                          </div>
                          <div>
                            <ElapsedTime startTime={call.CallStartDateTime!} />
                          </div>
                        </div>
                        <div className='w-full flex gap-2 items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-4 h-4' />
                            <h1 className='font-medium'>{new Date(call.CallStartDateTime!).toLocaleTimeString()}</h1>
                          </div>
                          <div className='flex items-center gap-1'>
                            <User className='w-4 h-4' />
                            <h1 className='font-medium'>{call.CallAssignedTo}</h1>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                </div>
              )}
              {filteredCallList.filter(call => call.CallStatus === "On Hold").length !== 0 && (
                <div className='w-1/4 h-full flex flex-col gap-2 p-2'>
                  <>
                    {filteredCallList.filter((call) => call.CallStatus === 'On Hold').map((call) => (
                      <div key={call.CallID} className='w-full p-2 rounded-md bg-background flex flex-col gap-1'>
                        <div className='w-full flex items-center justify-between border-b border-b-border pb-2'>
                          <div>
                            <h1 className='font-bold text-indigo-500'>On Hold</h1>
                          </div>
                          <div>
                            <ElapsedTime startTime={call.CallStartDateTime!} />
                          </div>
                        </div>
                        <div className='w-full flex gap-2 items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-4 h-4' />
                            <h1 className='font-medium'>{new Date(call.CallStartDateTime!).toLocaleTimeString()}</h1>
                          </div>
                          <div className='flex items-center gap-1'>
                            <User className='w-4 h-4' />
                            <h1 className='font-medium'>{call.CallAssignedTo}</h1>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                </div>
              )}
              {filteredCallList.filter(call => call.CallStatus === "Missed").length !== 0 && (
                <div className='w-1/4 h-full flex flex-col gap-2 p-2'>
                  <>
                    {filteredCallList.filter((call) => call.CallStatus === 'Missed').map((call) => (
                      <div key={call.CallID} className='w-full p-2 rounded-md bg-background flex flex-col gap-1'>
                        <div className='w-full flex items-center justify-between border-b border-b-border pb-2'>
                          <div>
                            <h1 className='font-bold text-red-500'>Missed</h1>
                          </div>
                          <div>
                            <ElapsedTime startTime={call.CallStartDateTime!} />
                          </div>
                        </div>
                        <div className='w-full flex gap-2 items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-4 h-4' />
                            <h1 className='font-medium'>{new Date(call.CallStartDateTime!).toLocaleTimeString()}</h1>
                          </div>
                          <div className='flex items-center gap-1'>
                            <User className='w-4 h-4' />
                            <h1 className='font-medium'>{call.CallAssignedTo}</h1>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                </div>
              )}
            </div>
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <h1 className='font-bold text-textAlt'>No Active Call Data To Be Shown</h1>
            </div>
          )
        }
      </div>
    </Layout >
  )
}
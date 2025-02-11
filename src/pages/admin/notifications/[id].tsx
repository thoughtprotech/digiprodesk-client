/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from '@/components/Layout'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import toast from 'react-hot-toast';
import Toast from '@/components/ui/Toast';
import { Call, Location } from '@/utils/types';
import { ArrowLeft } from 'lucide-react';
import ElapsedTime from '@/components/ui/ElapsedTime';


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
      <div className='w-full h-[90vh] flex flex-col gap-2 overflow-hidden rounded-md p-2'>
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
        <table className="bg-background w-full">
          <thead className="bg-foreground">
            <tr>
              <th className="py-2 px-4 text-left border-b border-b-border">Call ID</th>
              <th className="py-2 px-4 text-left border-b border-b-border">Assigned To</th>
              <th className="py-2 px-4 text-left border-b border-b-border">Call Placed Time</th>
              <th className="py-2 px-4 text-left border-b border-b-border">Time Elapsed</th>
              <th className="py-2 px-4 text-left border-b border-b-border">Status</th>
            </tr>
          </thead>
          {
            filteredCallList.filter(call => call.CallStatus !== "Completed").length !== 0 ? (
              <tbody>
                {filteredCallList.filter(call => call.CallStatus !== "Completed").map((row) => (
                  <tr key={row.CallID} className="">
                    <td className="w-1/5 py-2 px-4 border-b border-b-border text-sm">{row.CallID}</td>
                    <td className="w-1/5 py-2 px-4 border-b border-b-border">{row.CallAssignedTo}</td>
                    <td className="w-1/5 py-2 px-4 border-b border-b-border">{row?.CallStartDateTime ? new Date(row.CallStartDateTime).toLocaleTimeString() : 'N/A'}</td>
                    <td className="w-1/5 py-2 px-4 border-b border-b-border">
                      <ElapsedTime startTime={row?.CallStartDateTime || ""} />
                    </td>
                    <td className={`w-1/5 py-2 px-4 border-b border-b-border`}>
                      <div className={`w-fit px-4 rounded-md font-medium 
                  ${row.CallStatus === "New" ? "text-orange-600 bg-orange-600/20"
                          : row.CallStatus === "In Progress" ? "text-green-500 bg-green-600/20"
                            : row.CallStatus === "On Hold" ? "text-blue-500 bg-blue-600/20" : "text-red-600 bg-red-600/20"}`}>
                        {row.CallStatus}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td className="w-full py-2 px-4 border-b border-b-border text-center" colSpan={4}>
                    <h1 className="font-bold text-lg">No Notifications</h1>
                  </td>
                </tr>
              </tbody>
            )
          }
        </table>
      </div>
    </Layout >
  )
}
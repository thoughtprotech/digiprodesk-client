/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from '@/components/Layout'
import { Phone } from 'lucide-react'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Select from '@/components/ui/Select'
import SearchInput from '@/components/ui/Search';
import { Call, Location } from '@/utils/types';
import toast from 'react-hot-toast';
import Toast from '@/components/ui/Toast';
import { parseCookies } from 'nookies';

export default function Index() {
  const [callList, setCallList] = useState<Call[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [filteredLocationList, setFilteredLocationList] = useState<Location[]>([]);

  const fetchCallListData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/call`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.status === 200) {
        const data = await response.json();
        setCallList(data);
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to fetch call list data' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to fetch call list data' type='error' />)
    }
  }

  const fetchLocationList = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })

      if (response.status === 200) {
        const data = await response.json();
        setLocationList(data.filter((loc: Location) => loc.LocationParentID !== 0));
        setFilteredLocationList(data.filter((loc: Location) => loc.LocationParentID !== 0));
      } else {
        return toast.custom((t: any) => <Toast t={t} content='Failed to fetch location list data' type='error' />)
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content='Failed to fetch location list data' type='error' />)
    }
  }

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setSearchParam(event.target.value)
  // }

  const router = useRouter();

  const handleCallClick = (locationId: number) => {
    router.push(`/admin/checkIns/checkIn/${locationId}`)
  }

  const handleSearchCall = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const filteredData = locationList.filter((data) => data.LocationName.toLowerCase().includes(event.target.value.toLowerCase()));
    setFilteredLocationList(filteredData);
  }

  useEffect(() => {
    fetchCallListData();
    fetchLocationList();
  }, [])

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
      <div className='w-full h-full flex flex-col gap-2 bg-background px-2'>
        <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
          <div className='w52'>
            <SearchInput placeholder='Locations' onChange={handleSearchCall} />
          </div>
          <div className='flex gap-2'>
            <div>
              <Select
                className="hover:bg-highlight duration-300"
                options={[
                  {
                    label: "Today",
                    value: "today"
                  },
                  {
                    label: "Last 7 Days",
                    value: "sevenDays"
                  },
                  {
                    label: "Last 15 Days",
                    value: "fifteenDays"
                  },
                  {
                    label: "Last 30 Days",
                    value: "thirtyDays"
                  },
                  {
                    label: "Last 60 Days",
                    value: "sixtyDays"
                  },
                  {
                    label: "Custom",
                    value: "custom"
                  },
                ]}
                placeholder="Select Range" onChange={(value) => console.log(value)}
                defaultValue='today'
              />
            </div>
          </div>
        </div>
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
          {filteredLocationList.map((loc) => (
            <div key={loc.LocationID} onClick={handleCallClick.bind(null, loc.LocationID!)}>
              <div className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-highlight duration-300 p-2 cursor-pointer'>
                <div>
                  <h1 className='font-bold text-xl'>{loc.LocationName}</h1>
                </div>
                <div className="w-full flex flex-col gap-1 justify-between">
                  <div className="w-full flex items-center gap-1 justify-between">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 text-textAlt" />
                      <h1 className="font-semibold text-sm text-textAlt">
                        {
                          callList.filter(call => call.CallPlacedByLocationID === loc.LocationID).length
                        }
                        {" "}
                        Check Ins</h1>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <FileText className="w-4 text-textAlt" />
                      <h1 className="font-semibold text-sm text-textAlt">08:00 AM</h1>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
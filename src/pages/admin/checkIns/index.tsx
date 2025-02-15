/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from '@/components/Layout'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SearchInput from '@/components/ui/Search';
import { Call, Location } from '@/utils/types';
import toast from 'react-hot-toast';
import Toast from '@/components/ui/Toast';
import { parseCookies } from 'nookies';
import DateRangeSelect from '@/components/ui/DateRangeSelect';

export default function Index() {
  const [callList, setCallList] = useState<Call[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [filteredLocationList, setFilteredLocationList] = useState<Location[]>([]);

  const fetchCallListData = async (startDate?: string, endDate?: string) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      // Construct query parameters if startDate and endDate are provided
      const queryParams = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/call${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setCallList(data);
      } else {
        return toast.custom((t: any) => <Toast t={t} content="Failed to fetch call list data" type="error" />);
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content="Failed to fetch call list data" type="error" />);
    }
  };

  const fetchLocationList = async (startDate?: string, endDate?: string) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      // Construct query parameters if startDate and endDate are provided
      const queryParams = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setLocationList(data.filter((loc: Location) => loc.LocationParentID !== 0));
        setFilteredLocationList(data.filter((loc: Location) => loc.LocationParentID !== 0));
      } else {
        return toast.custom((t: any) => <Toast t={t} content="Failed to fetch location list data" type="error" />);
      }
    } catch {
      return toast.custom((t: any) => <Toast t={t} content="Failed to fetch location list data" type="error" />);
    }
  };


  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setSearchParam(event.target.value)
  // }

  const router = useRouter();

  const handleCallClick = (locationId: number) => {
    router.push(`/admin/checkIns/checkIn/${locationId}`)
  }

  const handleNotificationClick = (locationId: number) => {
    router.push(`/admin/notifications/${locationId}`)
  }

  const handleSearchCall = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const filteredData = locationList.filter((data) => data.LocationName.toLowerCase().includes(event.target.value.toLowerCase()));
    setFilteredLocationList(filteredData);
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {

    console.log("Start Date:", startDate, "End Date:", endDate);
    fetchCallListData(startDate, endDate);
  };


  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 1);


    fetchCallListData(startDate.toISOString(), now.toISOString());
    fetchLocationList();
  }, []);

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
      <div className='w-full h-full min-h-screen flex flex-col gap-2 bg-background px-2'>
        <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
          <div className='w52'>
            <SearchInput placeholder='Locations' onChange={handleSearchCall} />
          </div>
          <div className='flex gap-2'>
            <div>
              <DateRangeSelect callBack={(startDate, endDate) => handleDateRangeChange(startDate, endDate)} />
            </div>
          </div>
        </div>
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2'>
          {filteredLocationList.map((loc) => (
            <div key={loc.LocationID}>
              <div className='w-full h-fit rounded-md bg-foreground border border-border flex flex-col'>
                <div className='w-full flex items-center justify-between gap-2 border-b border-b-border pb-2 hover:bg-highlight cursor-pointer duration-300 p-2' onClick={handleCallClick.bind(null, loc.LocationID!)}>
                  <div className='w-full flex items-center gap-2'>
                    <div className='bg-text w-12 h-12 rounded-full flex items-center justify-center'>
                      <h1 className='text-textAlt font-bold text-2xl'>
                        {loc.LocationName.split(' ')[0].slice(0, 1) + loc.LocationName.split(' ')[1].slice(0, 1)}
                      </h1>
                    </div>
                    <div>
                      <h1 className='font-bold text-xl'>{loc.LocationName}</h1>
                    </div>
                  </div>
                  <div className="w-fit flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <h1 className="text-text font-bold text-2xl">
                        {
                          callList.filter(call => call.CallPlacedByLocationID === loc.LocationID).length
                        }
                      </h1>
                      <h1 className='font-semibold text-xs text-blue-500 whitespace-nowrap'>Check Ins</h1>
                    </div>
                  </div>
                </div>
                <div className="w-full flex gap-1 justify-between hover:bg-highlight cursor-pointer duration-300 p-2" onClick={handleNotificationClick.bind(null, loc.LocationID!)}>
                  <div className="w-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-2xl text-text">
                        {
                          callList.filter(call => call.CallPlacedByLocationID === loc.LocationID && call.CallStatus === "New").length
                        }
                      </h1>
                      <h1 className="font-semibold text-xs text-orange-500">
                        Pending
                      </h1>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-2xl text-text">
                        {
                          callList.filter(call => call.CallPlacedByLocationID === loc.LocationID && call.CallStatus === "In Progress").length
                        }
                      </h1>
                      <h1 className="font-semibold text-xs text-green-500">
                        In Progress
                      </h1>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-2xl text-text">
                        {
                          callList.filter(call => call.CallPlacedByLocationID === loc.LocationID && call.CallStatus === "On Hold").length
                        }
                      </h1>
                      <h1 className="font-semibold text-xs text-indigo-500">
                        On Hold
                      </h1>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-2xl text-text">
                        {
                          callList.filter(call => call.CallPlacedByLocationID === loc.LocationID && call.CallStatus === "Missed").length
                        }
                      </h1>
                      <h1 className="font-semibold text-xs text-red-500">
                        Missed
                      </h1>
                    </div>
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
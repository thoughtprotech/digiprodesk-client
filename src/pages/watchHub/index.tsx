/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import WatchCard from "./_components/WatchCard";
import VideoViewer from "@/components/ui/videoViewer";
import Button from "@/components/ui/Button";
import { PhoneOutgoing } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { parseCookies } from "nookies";
import { Location, User } from "@/utils/types";
import SearchInput from "@/components/ui/Search";
import { CallContext } from "@/context/CallContext";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";

export default function Index() {
  const [userLocationListData, setUserLocationListData] = useState<Location[]>([]);
  const [filteredUserLocationData, setFilteredUserLocationData] = useState<Location[]>([]);
  const [userList, setUserList] = useState<User[]>([]);

  const { setCallId: setGuestCallId } = useContext(CallContext);

  const router = useRouter();


  const fetchUserLocationList = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        setUserLocationListData(data.filter((loc: Location) => loc.LocationParentID !== 0));
        setFilteredUserLocationData(data.filter((loc: Location) => loc.LocationParentID !== 0));
      }
    } catch (error) {
      console.error(error);
    }
  }

  const fetchUserList = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        setUserList(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const filterUserLocationList = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value
    const filteredUserList = userLocationListData.filter(loc => loc.LocationName.toLowerCase().includes(searchValue.toLowerCase()))
    setFilteredUserLocationData(filteredUserList)
  }

  const handleCallGuest = (locationId: number) => {
    const guestId = userList.find(user => user.LocationID === locationId)?.UserName;
    if (!guestId) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Location Not Mapped To This User" type="error" />));
    } else {
      console.log(guestId);
      setGuestCallId(guestId);
      router.push('/checkInHub');
    }
  }

  useEffect(() => {
    fetchUserLocationList();
    fetchUserList();
  }, []);

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-lg'>WATCH HUB</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2 bg-background px-2'>
        <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
          <div className='w-64 flex gap-1'>
            <SearchInput placeholder='Locations' onChange={filterUserLocationList} />
          </div>
        </div>
        <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch">
          {filteredUserLocationData.map((location, index) => (
            <VideoViewer key={index} title={location.LocationName} src="/videos/placeholder.mp4"
              component={
                <Button text="Call" color="green" icon={<PhoneOutgoing className="w-5 h-5" />} onClick={handleCallGuest.bind(null, location.LocationID!)} />
              }
            >
              <WatchCard title={location.LocationName} src="/videos/placeholder.mp4" onClick={handleCallGuest.bind(null, location.LocationID!)} />
            </VideoViewer>
          ))}
        </div>
      </div>
    </Layout>
  );
}

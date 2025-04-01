/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SearchInput from "@/components/ui/Search";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import { parseCookies } from "nookies";
import DateRangeSelect from "@/components/ui/DateRangeSelect";

export default function Index() {
  const [checkInDetails, setCheckInDetails] = useState<
    {
      locationid: number;
      locationname: string;
      TotalCheckIns: string;
      NewCheckIns: string;
      InProgressCheckIns: string;
      OnHoldCheckIns: string;
      MissedCheckIns: string;
      ManagerMissedCheckIns: string;
      AnalyticsNegativeCheckIns: string;
    }[]
  >([]);
  const [filteredCheckInDetails, setFilteredCheckInDetails] = useState<
    {
      locationid: number;
      locationname: string;
      TotalCheckIns: string;
      NewCheckIns: string;
      InProgressCheckIns: string;
      OnHoldCheckIns: string;
      MissedCheckIns: string;
      ManagerMissedCheckIns: string;
      AnalyticsNegativeCheckIns: string;
    }[]
  >([]);

  const fetchCheckInDetails = async (startDate?: string, endDate?: string) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      // Build query parameters only if provided
      const params: { [key: string]: string } = {};
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }
      const queryString = Object.keys(params).length
        ? `?${new URLSearchParams(params).toString()}`
        : "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkInTrailDetails${queryString}`,
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
        setCheckInDetails(data);
        setFilteredCheckInDetails(data);
      } else {
        return toast.custom((t: any) => (
          <Toast
            t={t}
            content="Failed to fetch check-in details"
            type="error"
          />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} content="Failed to fetch check-in details" type="error" />
      ));
    }
  };

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setSearchParam(event.target.value)
  // }

  const router = useRouter();

  const handleCallClick = (locationId: number) => {
    router.push(`/admin/checkIns/checkIn/${locationId}`);
  };

  const handleNotificationClick = (locationId: number) => {
    router.push(`/admin/notifications/${locationId}`);
  };

  const handleSearchCall = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const filteredData = checkInDetails.filter((data) =>
      data.locationname.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredCheckInDetails(filteredData);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log("Start Date:", startDate, "End Date:", endDate);
    fetchCheckInDetails(startDate, endDate);
  };

  useEffect(() => {
    fetchCheckInDetails();
  }, []);

  return (
    <Layout
      headerTitle={
        <div className="flex items-center gap-2">
          <div className="border-r border-r-border pr-2">
            <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
          </div>
          <div>
            <h1 className="font-bold text-lg">CHECK-IN TRAILS</h1>
          </div>
        </div>
      }
    >
      <div className="w-full h-full min-h-screen flex flex-col gap-2 bg-background px-2">
        <div className="w-full flex justify-between items-center gap-2 border-b border-b-border pb-2">
          <div className="w52">
            <SearchInput placeholder="Locations" onChange={handleSearchCall} />
          </div>
          <div className="flex gap-2">
            <div>
              <DateRangeSelect
                callBack={(startDate, endDate) =>
                  handleDateRangeChange(startDate, endDate)
                }
              />
            </div>
          </div>
        </div>
        <div className="w-full h-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {filteredCheckInDetails.map((loc) => (
            <div key={loc.locationid}>
              <div className="w-full h-fit rounded-md bg-foreground border border-border flex flex-col">
                <div
                  className="w-full flex items-center justify-between gap-2 border-b border-b-border pb-2 hover:bg-highlight cursor-pointer duration-300 p-2"
                  onClick={handleCallClick.bind(null, loc.locationid!)}
                >
                  <div className="w-full flex items-center gap-2">
                    <div className="bg-text w-12 h-12 rounded-full flex items-center justify-center">
                      <h1 className="text-textAlt font-bold text-2xl">
                        {loc?.locationname?.split(" ")[0]?.slice(0, 1) +
                          (loc?.locationname?.split(" ")[1]?.slice(0, 1)
                            ? loc?.locationname?.split(" ")[1]?.slice(0, 1)
                            : "")}
                      </h1>
                    </div>
                    <div>
                      <h1 className="font-bold text-xl">{loc.locationname}</h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1 className="font-bold text-3xl">{loc.TotalCheckIns}</h1>
                  </div>
                </div>
                <div
                  className="w-full flex flex-col items-center justify-center gap-4 p-4 cursor-pointer hover:bg-highlight duration-300"
                  onClick={handleNotificationClick.bind(null, loc.locationid!)}
                >
                  <div className="w-full grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-start">
                      <h1 className="font-bold text-3xl">{loc.NewCheckIns}</h1>
                      <h1 className="text-sm font-bold text-purple-500">
                        New Check Ins
                      </h1>
                    </div>
                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-3xl">
                        {loc.InProgressCheckIns}
                      </h1>
                      <h1 className="text-sm font-bold text-orange-500">
                        In Progress
                      </h1>
                    </div>
                    <div className="flex flex-col items-end">
                      <h1 className="font-bold text-3xl">
                        {loc.OnHoldCheckIns}
                      </h1>
                      <h1 className="text-sm font-bold text-indigo-500">
                        On Hold
                      </h1>
                    </div>
                    <div className="flex flex-col items-start">
                      <h1 className="font-bold text-3xl">
                        {loc.MissedCheckIns}
                      </h1>
                      <h1 className="text-sm font-bold text-red-500">Missed</h1>
                    </div>
                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-3xl">
                        {loc.ManagerMissedCheckIns}
                      </h1>
                      <h1 className="text-sm font-bold text-red-500">
                        Manager Missed
                      </h1>
                    </div>
                    <div className="flex flex-col items-end">
                      <h1 className="font-bold text-3xl">
                        {loc.AnalyticsNegativeCheckIns}
                      </h1>
                      <h1 className="text-sm font-bold text-red-500">
                        Negative
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
  );
}

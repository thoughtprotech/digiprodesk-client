/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import { Call, Location } from "@/utils/types";
import { ArrowLeft } from "lucide-react";
import DateRangeSelect from "@/components/ui/DateRangeSelect";

export default function Index() {
  const [, setCallList] = useState<Call[]>([]);
  const [filteredCallList, setFilteredCallList] = useState<any[]>([]);
  const [location, setLocation] = useState<Location>();

  const router = useRouter();

  const fetchCallListData = async (
    locationID: number,
    startDate: string = "",
    endDate: string = ""
  ) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      // Check if startDate and endDate are provided
      if (startDate === "" && endDate === "") {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/callList?CallPlacedByLocationID=${locationID}`,
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
          console.log({ data });
          setCallList(
            data.sort(
              (a: any, b: any) =>
                new Date(b.CallStartDateTime).getTime() -
                new Date(a.CallStartDateTime).getTime()
            )
          );
          setFilteredCallList(
            data.sort(
              (a: any, b: any) =>
                new Date(b.CallStartDateTime).getTime() -
                new Date(a.CallStartDateTime).getTime()
            )
          );
        } else {
          return toast.custom((t: any) => (
            <Toast
              t={t}
              content="Failed to fetch call list data"
              type="error"
            />
          ));
        }
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/callList?CallPlacedByLocationID=${locationID}&startDate=${startDate}&endDate=${endDate}`,
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
          console.log({ data });
          setCallList(
            data.sort(
              (a: any, b: any) =>
                new Date(b.CallStartDateTime).getTime() -
                new Date(a.CallStartDateTime).getTime()
            )
          );
          setFilteredCallList(
            data.sort(
              (a: any, b: any) =>
                new Date(b.CallStartDateTime).getTime() -
                new Date(a.CallStartDateTime).getTime()
            )
          );
        } else {
          return toast.custom((t: any) => (
            <Toast
              t={t}
              content="Failed to fetch call list data"
              type="error"
            />
          ));
        }
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} content="Failed to fetch call list data" type="error" />
      ));
    }
  };

  const fetchLocation = async (locationID: number) => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location/${locationID}`,
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
        setLocation(data);
      } else {
        return toast.custom((t: any) => (
          <Toast
            t={t}
            content="Failed to fetch location list data"
            type="error"
          />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast
          t={t}
          content="Failed to fetch location list data"
          type="error"
        />
      ));
    }
  };

  useEffect(() => {
    if (router.isReady && router.query.id) {
      fetchCallListData(Number(router.query.id));
      fetchLocation(Number(router.query.id));
    }
  }, [router.isReady, router.query.id]);

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
      <div className="w-full h-[90vh] flex flex-col gap-2 overflow-x-hidden rounded-md p-2">
        <div className="w-full border-b border-b-border pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div>
              <ArrowLeft
                className="w-8 h-8 cursor-pointer"
                onClick={() => {
                  router.push("/admin/checkIns");
                }}
              />
            </div>
            <div>
              <h1 className="font-bold text-3xl">{location?.LocationName}</h1>
            </div>
          </div>
          <div>
            <DateRangeSelect
              callBack={(startDate, endDate) => {
                fetchCallListData(Number(router.query.id), startDate, endDate);
              }}
            />
          </div>
        </div>
        <table className="bg-background w-full">
          <thead className="bg-foreground">
            <tr>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Call ID
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Assigned To
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Start Time
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                End Time
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Status
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Manager Missed
              </th>
            </tr>
          </thead>
          {filteredCallList.filter((call) => call.CallStatus !== "Completed")
            .length !== 0 ? (
            <tbody>
              {filteredCallList
                .filter((call) => call.CallStatus !== "Completed")
                .map((row) => (
                  <tr key={row.callid} className="">
                    <td className="w-1/5 py-2 px-4 border-b border-b-border text-sm">
                      {row.callid}
                    </td>
                    <td className="w-1/6 py-2 px-4 border-b border-b-border">
                      {row.displayname}
                    </td>
                    <td className="w-1/6 py-2 px-4 border-b border-b-border">
                      {row?.callstartdatetime
                        ? new Date(row.callstartdatetime).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="w-1/6 py-2 px-4 border-b border-b-border">
                      {row?.CallEndDateTime
                        ? new Date(row.CallEndDateTime).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td className={`w-1/6 py-2 px-4 border-b border-b-border`}>
                      <div
                        className={`w-fit px-4 rounded-md font-medium 
                  ${
                    row.callstatus === "New"
                      ? "text-orange-600 bg-orange-600/20"
                      : row.callstatus === "In Progress"
                      ? "text-green-500 bg-green-600/20"
                      : row.callstatus === "On Hold"
                      ? "text-blue-500 bg-blue-600/20"
                      : row.callstatus === "Completed"
                      ? "text-indigo-600 bg-indigo-600/20"
                      : "text-red-600 bg-red-600/20"
                  }`}
                      >
                        {row.callstatus}
                      </div>
                    </td>
                    <td className="w-1/5 py-2 px-4 border-b border-b-border">
                      {row.ManagerMissed}
                    </td>
                  </tr>
                ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  className="w-full py-2 px-4 border-b border-b-border text-center"
                  colSpan={6}
                >
                  <h1 className="font-bold text-lg">No Data</h1>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </Layout>
  );
}

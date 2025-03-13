/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import DateRangeSelect from "@/components/ui/DateRangeSelect";
import exportToExcel from "@/utils/exportToExcel";
import { FileDown, X } from "lucide-react";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
};

interface LocationInfo {
  LocationID: number;
  LocationName: string;
  LocationCode: string;
  LocationParentID: number;
  LocationType: string;
  LocationManager: string | null;
  LocationLogo: string | null;
  LocationImage: string | null;
  LocationBanner: string | null;
  LocationVideoFeed: string;
  LocationReceptionistPhoto: string | null;
  LocationAdvertisementVideo: string | null;
  IsActive: boolean;
  CreatedBy: string;
  CreatedOn: string; // ISO date string
  ModifiedBy: string | null;
  ModifiedOn: string; // ISO date string
}

interface CallData {
  CallStartDateTime: string; // ISO date string
  CallEndDateTime: string;
  CallPlacedByUserName: string;
  CallTransferredTo: string;
  CallStatus: string;
  CallAnalytics: string;
  LocationInfo: LocationInfo;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, user }) => {
  const [callData, setCallData] = useState<CallData[]>();

  const fetchCallData = async (startDate?: string, endDate?: string) => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    if (startDate === "" || startDate === undefined) {
      startDate = new Date().toISOString();
    }
    if (endDate === "" || endDate === undefined) {
      endDate = new Date().toISOString();
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/users/${user}?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log({ data });
      setCallData(data);
    } else {
      toast.error("Failed to fetch call data");
    }
  };

  const handleExportData = () => {
    exportToExcel(callData!, `users-${new Date().toISOString()}.xlsx`);
  };

  useEffect(() => {
    fetchCallData();
    console.log(user);
  }, [user]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed z-[999] top-0 right-0 h-full min-w-[60%] w-fit bg-background shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full flex items-center justify-between px-4 border-b border-b-border">
          <div>
            <h1 className="text-3xl font-bold">{user}</h1>
          </div>
          <div className="p-4">
            <button onClick={onClose} className="text-text focus:outline-none">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-4 w-full h-full flex flex-col gap-2">
          <div className="w-full flex justify-between items-center gap-2">
            <div>
              <h1 className="text-xl font-bold">Call History</h1>
            </div>
            <div className="flex gap-2 items-center">
              <DateRangeSelect
                callBack={(startDate) => fetchCallData(startDate)}
              />
              <Button
                color="foreground"
                icon={<FileDown className="w-5" />}
                text="Export"
                onClick={handleExportData}
              />
            </div>
          </div>
          {callData?.length !== 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-foreground">
                  <tr className="text-xs">
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Location
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Date
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Start Time
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      End Time
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Duration
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Transferred To
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Status
                    </th>
                    <th className="py-2 px-4 border-b border-b-border text-left">
                      Analytics
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {callData?.map((call, index) => {
                    const callStart = new Date(call?.CallStartDateTime);
                    const callEnd = call?.CallEndDateTime
                      ? new Date(call?.CallEndDateTime)
                      : null;
                    const dateString = callStart.toLocaleDateString();
                    // Calculate duration in minutes and seconds
                    let duration = "N/A";
                    if (callEnd) {
                      const minutes =
                        callEnd.getMinutes() - callStart.getMinutes();
                      const seconds =
                        callEnd.getSeconds() - callStart.getSeconds();
                      duration = `${minutes}:${seconds}`;
                    }

                    return (
                      <tr key={index} className="hover:bg-muted">
                        <td className="py-2 px-4 border-b border-b-border">
                          {call?.LocationInfo?.LocationName}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {dateString}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {new Date(
                            call.CallStartDateTime
                          ).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {new Date(
                            call.CallEndDateTime
                          ).toLocaleTimeString() || "--"}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {duration}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {call?.CallTransferredTo
                            ? call?.CallTransferredTo
                            : "--"}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {call.CallStatus}
                        </td>
                        <td className="py-2 px-4 border-b border-b-border">
                          {call?.CallAnalytics ? call?.CallAnalytics : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-lg font-medium">No call data available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;

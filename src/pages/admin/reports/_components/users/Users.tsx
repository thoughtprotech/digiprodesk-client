/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchInput from "@/components/ui/Search";
import Toast from "@/components/ui/Toast";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { FileDown } from "lucide-react";
import exportToExcel from "@/utils/exportToExcel";
import DateRangeSelect from "@/components/ui/DateRangeSelect";
import Drawer from "./_components/Drawer";
import formatDuration from "@/utils/formatSeconds";

interface UserReport {
  UserName: string;
  DisplayName: string;
  Role: string;
  TotalAvailableDuration: string;
  TotalAwayDuration: string;
  TotalCalls: number;
  TotalCallDurationSeconds: number;
  AverageCallDurationSeconds: number;
  NumberOfCallsTransferred: number;
  LatestStatus:
    | "Logged In"
    | "Available"
    | "Away"
    | "Logged Out"
    | "Session Terminated"
    | "InCall"
    | "Ready"
    | "No Logs";
  NumberOfMissedCalls: number;
  CallsWithOnHold: number;
  CallsWithoutOnHold: number;
  LongestCallDuration: string;
  ShortestCallDuration: string;
  TotalHoldDuration: string;
}

export default function Users() {
  const [userList, setUserList] = useState<UserReport[]>([]);
  const [filteredUserList, setFilteredUserList] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState({
    username: "",
    displayname: "",
  });

  const filterUserList = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const searchValue = event.target.value;
    const filteredUserList = userList.filter((user) =>
      user.UserName.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUserList(filteredUserList);
  };

  const fetchUserListData = async (startDate?: string, endDate?: string) => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    let queryParams = "";

    if (startDate && endDate) {
      // Construct query parameters if startDate and endDate are provided
      queryParams = `?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/users${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();
      setUserList(
        data.filter((user: UserReport) => user.Role !== "Super Admin")
      );
      setFilteredUserList(
        data.filter((user: UserReport) => user.Role !== "Super Admin")
      );
    } catch {
      toast.custom((t: any) => (
        <Toast t={t} content="Something went wrong." type="error" />
      ));
    }
  };

  const handleExportData = () => {
    exportToExcel(filteredUserList, `users-${new Date().toISOString()}.xlsx`);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log("Start Date:", startDate, "End Date:", endDate);
    fetchUserListData(startDate, endDate);
  };

  const handleDrawerOpen = (user: any) => {
    console.log({ user });
    setSelectedUserName({
      username: user.username,
      displayname: user.displayname,
    });
    setDrawerOpen(true);
  };

  useEffect(() => {
    fetchUserListData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-2 bg-background p-2 rounded-md">
      <div className="w-full flex justify-between items-center gap-2 border-b border-b-border pb-2">
        <div className="w-64 flex gap-1">
          <SearchInput placeholder="Users" onChange={filterUserList} />
          <DateRangeSelect
            callBack={(startDate, endDate) =>
              handleDateRangeChange(startDate, endDate)
            }
          />
        </div>
        <div>
          <Button
            color="foreground"
            icon={<FileDown className="w-5" />}
            text="Export"
            onClick={handleExportData}
          />
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="bg-background w-full">
          <thead className="bg-foreground">
            <tr className="text-xs">
              <th className="py-2 px-4 text-left border-b border-b-border">
                User
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Away Duration (HH:MM)
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Available Duration (HH:MM)
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Total Calls
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Missed Calls
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Held Calls
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Calls Transferred
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Tot. Call Duration (HH:MM)
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Avg. Call Duration (HH:MM)
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Max. Call Duration (HH:MM)
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Min. Call Duration (HH:MM)
              </th>
              <th className="py-2 px-4 text-left border-b border-b-border">
                Held Call Duration (HH:MM)
              </th>
            </tr>
          </thead>
          {filteredUserList.filter((call) => call.Role !== "Guest").length !==
          0 ? (
            <tbody>
              {filteredUserList
                .filter((call) => call.Role !== "Guest")
                .map((row, index) => (
                  <tr
                    key={row.UserName}
                    className={`text-sm cursor-pointer hover:bg-highlight ${
                      index !==
                      filteredUserList.filter((call) => call.Role !== "Guest")
                        .length -
                        1
                        ? "border-b border-b-border"
                        : ""
                    }`}
                    onClick={handleDrawerOpen.bind(null, row)}
                  >
                    <td className="py-2 px-4 font-medium">{row.displayname}</td>
                    <td className="py-2 px-4">
                      <div className="">{formatDuration(row.AwayDuration)}</div>
                    </td>
                    <td className={`py-2 px-4`}>
                      <div className="">
                        {formatDuration(row.AvailableDuration)}
                      </div>
                    </td>
                    <td className="py-2 px-4 font-medium">{row.TotalCalls}</td>
                    <td className={`py-2 px-4 font-medium`}>
                      {row.MissedCalls}
                    </td>
                    <td className={`py-2 px-4 font-medium`}>{row.HeldCalls}</td>
                    <td className={`py-2 px-4 font-medium`}>
                      {row.TransferredCalls}
                    </td>
                    <td className={`py-2 px-4 font-medium`}>
                      {formatDuration(row.Totalcallduration)}
                    </td>
                    <td className={`py-2 px-4 font-medium`}>
                      {formatDuration(row.Averagecallduration)}
                    </td>
                    <td className={`py-2 px-4 font-medium`}>
                      {formatDuration(row.Maxcallduration)}
                    </td>
                    <td className={`py-2 px-4 font-medium`}>
                      {formatDuration(row.Mincallduration)}
                    </td>
                    <td className={`py-2 px-4 font-medium`}>
                      {formatDuration(row.Heldcallduration)}
                    </td>
                  </tr>
                ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="w-full py-2 px-4 text-center" colSpan={13}>
                  <h1 className="font-bold text-sm">No Data</h1>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={selectedUserName}
      />
    </div>
  );
}

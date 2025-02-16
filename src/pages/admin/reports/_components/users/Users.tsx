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
  LatestStatus: 'Logged In' | 'Available' | 'Away' | 'Logged Out' | 'Session Terminated' | 'InCall' | 'Ready' | 'No Logs';
}

export default function Users() {
  const [userList, setUserList] = useState<UserReport[]>([]);
  const [filteredUserList, setFilteredUserList] = useState<UserReport[]>([]);

  const filterUserList = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value
    const filteredUserList = userList.filter(user => user.DisplayName.toLowerCase().includes(searchValue.toLowerCase()))
    setFilteredUserList(filteredUserList)
  }

  const fetchUserListData = async (startDate?: string, endDate?: string) => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    let queryParams = '';

    if (startDate && endDate) {
      // Construct query parameters if startDate and endDate are provided
      queryParams = `?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/users${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application',
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      setUserList(data.filter((user: UserReport) => user.Role !== 'Super Admin'));
      setFilteredUserList(data.filter((user: UserReport) => user.Role !== 'Super Admin'));
    } catch {
      toast.custom((t: any) => (
        <Toast
          t={t}
          content="Something went wrong."
          type='error'
        />
      ));
    }
  }

  const handleExportData = () => {
    exportToExcel(filteredUserList, `users-${new Date().toISOString()}.xlsx`);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {

    console.log("Start Date:", startDate, "End Date:", endDate);
    fetchUserListData(startDate, endDate);
  };

  useEffect(() => {
    fetchUserListData();
  }, [])

  return (
    <div className='w-full h-full flex flex-col gap-2 bg-background p-2 rounded-md'>
      <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
        <div className='w-64 flex gap-1'>
          <SearchInput placeholder='Users' onChange={filterUserList} />
          <DateRangeSelect callBack={(startDate, endDate) => handleDateRangeChange(startDate, endDate)} />
        </div>
        <div>
          <Button color="foreground" icon={<FileDown className='w-5' />} text='Export' onClick={handleExportData} />
        </div>
      </div>
      <table className="bg-background w-full">
        <thead className="bg-foreground">
          <tr>
            <th className="py-2 px-4 text-left border-b border-b-border">User</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Away Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Available Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Total Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Total Call Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Average Call Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Calls Transferred</th>
          </tr>
        </thead>
        {
          filteredUserList.filter(call => call.Role !== "Guest").length !== 0 ? (
            <tbody>
              {filteredUserList.filter(call => call.Role !== "Guest").map((row, index) => (
                <tr key={row.UserName} className={`${index !== filteredUserList.filter(call => call.Role !== "Guest").length - 1 ? 'border-b border-b-border' : ''}`}>
                  <td className="py-2 px-4 font-medium">{row.UserName}</td>
                  <td className="py-2 px-4">
                    <div className="px-4 rounded-md font-medium bg-highlight w-fit">
                      {row.TotalAwayDuration}
                    </div>
                  </td>
                  <td className={`py-2 px-4`}>
                    <div className="px-4 rounded-md font-medium bg-highlight w-fit">
                      {row.TotalAvailableDuration}
                    </div>
                  </td>
                  <td className="py-2 px-4 font-medium">{row.TotalCalls}</td>
                  <td className={`py-2 px-4 font-medium`}>
                    {formatDuration(row.TotalCallDurationSeconds)}
                  </td>
                  <td className={`py-2 px-4 font-medium`}>
                    {formatDuration(row.AverageCallDurationSeconds)}
                  </td>
                  <td className={`py-2 px-4 font-medium`}>
                    {row.NumberOfCallsTransferred}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="w-full py-2 px-4 text-center" colSpan={7}>
                  <h1 className="font-bold text-lg">No Data</h1>
                </td>
              </tr>
            </tbody>
          )
        }
      </table>
    </div>
  );
}
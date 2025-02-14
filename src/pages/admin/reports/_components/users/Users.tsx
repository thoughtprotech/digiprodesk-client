/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchInput from "@/components/ui/Search";
import Toast from "@/components/ui/Toast";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { FileDown } from "lucide-react";
import exportToExcel from "@/utils/exportToExcel";

interface UserReport {
  UserName: string;
  DisplayName: string;
  Role: string;
  Region: string;
  Language: string;
  IsActive: string;
  TotalAwayDuration: string;
  TotalAvailableDuration: string;
  LatestStatus: 'Logged In' | 'Available' | 'Away' | 'Logged Out' | 'Session Terminated' | 'InCall' | 'Ready' | 'No Logs';
}

const statusMapping = {
  'Logged In': {
    color: 'bg-green-500/30',
    text: 'text-green-500'
  },
  'Available': {
    color: 'bg-green-500/30',
    text: 'text-green-500'
  },
  'Away': {
    color: 'bg-yellow-500/30',
    text: 'text-yellow-500'
  },
  'Logged Out': {
    color: 'bg-red-500/30',
    text: 'text-red-500'
  },
  'Session Terminated': {
    color: 'bg-red-500/30',
    text: 'text-red-500'
  },
  'InCall': {
    color: 'bg-blue-500/30',
    text: 'text-blue-500'
  },
  'Ready': {
    color: 'bg-green-500/30',
    text: 'text-green-500'
  },
  'No Logs': {
    color: 'bg-gray-500/30',
    text: 'text-gray-500'
  }
}

export default function Users() {
  const [userList, setUserList] = useState<UserReport[]>([]);
  const [filteredUserList, setFilteredUserList] = useState<UserReport[]>([]);

  const filterUserList = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value
    const filteredUserList = userList.filter(user => user.DisplayName.toLowerCase().includes(searchValue.toLowerCase()))
    setFilteredUserList(filteredUserList)
  }

  const fetchUserListData = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/users`, {
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

  useEffect(() => {
    fetchUserListData();
  }, [])

  return (
    <div className='w-full h-full flex flex-col gap-2 bg-background p-2'>
      <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
        <div className='w-64 flex gap-1'>
          <SearchInput placeholder='Users' onChange={filterUserList} />
        </div>
        <div>
          <Button color="foreground" icon={<FileDown className='w-5' />} text='Export' onClick={handleExportData} />
        </div>
      </div>
      <table className="bg-background w-full">
        <thead className="bg-foreground">
          <tr>
            <th className="py-2 px-4 text-left border-b border-b-border">User</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Role</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Status</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Away Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Available Duration</th>
          </tr>
        </thead>
        {
          filteredUserList.filter(call => call.Role !== "Guest").length !== 0 ? (
            <tbody>
              {filteredUserList.filter(call => call.Role !== "Guest").map((row) => (
                <tr key={row.UserName} className="">
                  <td className="w-1/5 py-2 px-4 border-b border-b-border font-medium">{row.UserName}</td>
                  <td className="w-1/5 py-2 px-4 border-b border-b-border font-medium">{row.Role}</td>
                  <td className={`w-1/5 py-2 px-4 border-b border-b-border font-medium`}>
                    <div className={`w-fit px-4 rounded-md ${statusMapping[row.LatestStatus]?.color}`}>
                      {row.LatestStatus === 'No Logs' ? (
                        <h1 className={`${statusMapping[row.LatestStatus]?.text} font-medium`}>
                          --
                        </h1>
                      ) : row.LatestStatus === "Session Terminated" ? (
                        <h1 className={`${statusMapping[row.LatestStatus]?.text} font-medium`}>
                          Logged Out
                        </h1>
                      ) : row.LatestStatus === "Ready" || row.LatestStatus === "Logged In" ? (
                        <h1 className={`${statusMapping[row.LatestStatus]?.text} font-medium`}>
                          Available
                        </h1>
                      ) : (
                        <h1 className={`${statusMapping[row.LatestStatus]?.text} font-medium`}>
                          {row?.LatestStatus}
                        </h1>
                      )
                      }
                    </div>
                  </td>
                  <td className="w-1/5 py-2 px-4 border-b border-b-border">
                    <div className="px-4 rounded-md font-medium bg-highlight w-fit">
                      {row.TotalAwayDuration}
                    </div>
                  </td>
                  <td className={`w-1/5 py-2 px-4 border-b border-b-border`}>
                    <div className="px-4 rounded-md font-medium bg-highlight w-fit">
                      {row.TotalAvailableDuration}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="w-full py-2 px-4 border-b border-b-border text-center" colSpan={5}>
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
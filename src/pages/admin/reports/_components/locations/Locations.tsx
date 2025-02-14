/* eslint-disable @typescript-eslint/no-explicit-any */
import SearchInput from "@/components/ui/Search";
import Toast from "@/components/ui/Toast";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { FileDown } from "lucide-react";
import exportToExcel from "@/utils/exportToExcel";

export default function Location() {
  const [userList, setUserList] = useState<any[]>([]);
  const [filteredUserList, setFilteredUserList] = useState<any[]>([]);

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
      setUserList(data.filter((user: any) => user.Role !== 'Super Admin'));
      setFilteredUserList(data.filter((user: any) => user.Role !== 'Super Admin'));
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
          <SearchInput placeholder='Locations' onChange={filterUserList} />
        </div>
        <div>
          <Button color="foreground" icon={<FileDown className='w-5' />} text='Export' onClick={handleExportData} />
        </div>
      </div>
      <table className="bg-background w-full">
        <thead className="bg-foreground">
          <tr>
            <th className="py-2 px-4 text-left border-b border-b-border">Check Ins</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Missed Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">In Progress Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">On Hold Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Escalated Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Total Call Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Longest Call Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Shortest Call Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Average Call Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Calls Not Held</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Orphaned Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Error Calls</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Total Wait Time</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Total Wait Time</th>
          </tr>
        </thead>
        {
          filteredUserList.filter(call => call.Role !== "Guest").length !== 0 ? (
            <tbody>
              
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
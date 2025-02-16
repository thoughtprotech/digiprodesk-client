/* eslint-disable @typescript-eslint/no-explicit-any */
import Toast from "@/components/ui/Toast";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { FileDown } from "lucide-react";
import exportToExcel from "@/utils/exportToExcel";
import DateRangeSelect from "@/components/ui/DateRangeSelect";
import SearchInput from "@/components/ui/Search";

interface CallReportData {
  CallPlacedByLocationID: number;
  LocationName: string;
  TotalCalls: number;
  TotalCallDuration: string;
  AverageCallDuration: string;
  LongestCallDuration: number;
  ShortestCallDuration: number;
  TransferredCalls: string;
  MissedCalls: string;
  TotalHoldTime: string;
  TotalWaitTime: string;
  CallsWithOnHold: number;
  CallsWithoutOnHold: number;
}


export default function Calls() {
  const [callData, setCallData] = useState<CallReportData[]>([])
  const [filteredCallData, setFilteredCallData] = useState<CallReportData[]>([]);

  const fetchCallData = async (startDate?: string, endDate?: string) => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    let queryParams = '';

    if (startDate && endDate) {
      // Construct query parameters if startDate and endDate are provided
      queryParams = `?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/calls${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application',
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      console.log({ data });
      setCallData(data);
      setFilteredCallData(data);
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
    exportToExcel(filteredCallData, `calls-${new Date().toISOString()}.xlsx`);
  };

  const filterCallList = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value
    const filteredUserList = callData.filter(user => user.LocationName.toLowerCase().includes(searchValue.toLowerCase()))
    setFilteredCallData(filteredUserList)
  }
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log("Start Date:", startDate, "End Date:", endDate);
    fetchCallData(startDate, endDate);
  };

  useEffect(() => {
    fetchCallData();
  }, [])

  return (
    <div className='w-full h-full flex flex-col gap-2 bg-background p-2 rounded-md'>
      <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
        <div className='w-64 flex gap-1'>
          <SearchInput placeholder='Location' onChange={filterCallList} />
          <DateRangeSelect callBack={(startDate, endDate) => handleDateRangeChange(startDate, endDate)} />
        </div>
        <div>
          <Button color="foreground" icon={<FileDown className='w-5' />} text='Export' onClick={handleExportData} />
        </div>
      </div>
      <table className="bg-background w-full">
        <thead className="bg-foreground">
          <tr>
            <th className="py-2 px-4 text-left border-b border-b-border">Location</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Check-Ins</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Missed</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Escalated</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Held</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Not Held</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Tot. Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Avg. Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Max. Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Min. Duration</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Hold Time</th>
            <th className="py-2 px-4 text-left border-b border-b-border">Wait Time</th>
          </tr>
        </thead>
        {
          filteredCallData.length !== 0 ? (
            <tbody>
              {filteredCallData.map((row, index) => (
                <tr key={row.CallPlacedByLocationID} className={`${index !== filteredCallData.length - 1 ? 'border-b border-b-border' : ''}`}>
                  <td className="py-2 px-4 font-medium">{row.LocationName}</td>
                  <td className="py-2 px-4">
                    {row.TotalCalls}
                  </td>
                  <td className="py-2 px-4">
                    {row.MissedCalls}
                  </td>
                  <td className={`py-2 px-4`}>
                    {row.TransferredCalls}
                  </td>
                  <td className={`py-2 px-4`}>
                    {row.CallsWithOnHold}
                  </td>
                  <td className={`py-2 px-4`}>
                    {row.CallsWithoutOnHold}
                  </td>
                  <td className="py-2 px-4 font-medium">{row.TotalCallDuration}</td>
                  <td className={`py-2 px-4 font-medium`}>
                    {row.AverageCallDuration}
                  </td>
                  <td className={`py-2 px-4 font-medium`}>
                    {row.LongestCallDuration}
                  </td>
                  <td className={`py-2 px-4 font-medium`}>
                    {row.ShortestCallDuration}
                  </td>
                  <td className={`py-2 px-4 font-medium`}>
                    {row.TotalHoldTime}
                  </td>
                  <td className={`py-2 px-4 font-medium`}>
                    {row.TotalWaitTime}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="w-full py-2 px-4 text-center" colSpan={12}>
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
import Layout from '@/components/Layout'
import { Phone } from 'lucide-react'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Select from '@/components/ui/Select'
import SearchInput from '@/components/ui/Search';

const mockCardData: {
  location: string;
  calls: number;
}[] = [
    {
      location: "Olive Indiranagar",
      calls: 7,
    },
    {
      location: "Olive Koramangala",
      calls: 5,
    },
    {
      location: "Olive HSR Layout",
      calls: 3,
    },
    {
      location: "Olive Whitefield",
      calls: 2,
    },
    {
      location: "Olive Jayanagar",
      calls: 1,
    },
  ]

export default function Index() {
  // const [searchParam, setSearchParam] = useState<string>('')
  const [checkInList, setCheckInList] = useState<{
    location: string;
    calls: number;
  }[]>([])

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setSearchParam(event.target.value)
  // }

  const router = useRouter();

  const handleCallClick = () => {
    router.push(`/admin/checkIns/checkIn/1234`)
  }

  const handleSearchCall = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const filteredData = mockCardData.filter((data) => data.location.toLowerCase().includes(event.target.value.toLowerCase()));
    setCheckInList(filteredData);
  }

  useEffect(() => {
    setCheckInList(mockCardData);
  }, [])

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
      <div className='w-full h-full flex flex-col gap-2 bg-background px-2'>
        <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
          <div className='w52'>
            <SearchInput placeholder='Locations' onChange={handleSearchCall} />
          </div>
          <div className='flex gap-2'>
            {/* <div>
              <Input type='date' placeholder='Search Call Logs' value={searchParam} onChange={handleSearchChange} />
            </div> */}
            <div>
              <Select options={[
                {
                  label: "Today",
                  value: "toady"
                },
                {
                  label: "Last 7 Days",
                  value: "sevenDays"
                },
                {
                  label: "Last 15 Days",
                  value: "fifteenDays"
                },
                {
                  label: "Last 30 Days",
                  value: "thirtyDays"
                },
                {
                  label: "Last 60 Days",
                  value: "sixtyDays"
                },
                {
                  label: "Custom",
                  value: "custom"
                },
              ]}
                placeholder="Select Range" onChange={(value) => console.log(value)}
                defaultValue='toady'
              />
            </div>
          </div>
        </div>
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
          {checkInList.map((data, index) => (
            <div key={index} onClick={handleCallClick}>
              <div className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-highlight duration-300 p-2 cursor-pointer'>
                <div>
                  <h1 className='font-bold text-xl'>{data.location}</h1>
                </div>
                <div className="w-full flex flex-col gap-1 justify-between">
                  <div className="w-full flex items-center gap-1 justify-between">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 text-textAlt" />
                      <h1 className="font-semibold text-sm text-textAlt">{data.calls} Check Ins</h1>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <FileText className="w-4 text-textAlt" />
                      <h1 className="font-semibold text-sm text-textAlt">08:00 AM</h1>
                    </div> */}
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
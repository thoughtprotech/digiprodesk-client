import Layout from '@/components/Layout'
import Input from '@/components/ui/Input';
import { Backpack, Phone } from 'lucide-react'
import { useRouter } from 'next/router';
import { useState } from 'react';
import Select from '@/components/ui/Select'

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
  const [searchParam, setSearchParam] = useState<string>('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchParam(event.target.value)
  }

  const router = useRouter();

  const handleCallClick = () => {
    router.push(`/admin/calls/call/1234`)
  }

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <Backpack />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>Check In</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2'>
        <div className='w-full flex gap-2 items-end'>
        </div>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold text-2xl'>Locations</h1>
          <div className='flex gap-2'>
            <div>
              <Input type='date' placeholder='Search Call Logs' value={searchParam} onChange={handleSearchChange} />
            </div>
            <div>
              <Select options={[
                {
                  label: "Today",
                  value: "olive-indiranagar"
                },
                {
                  label: "Last 7 Days",
                  value: "olive-koramangala"
                },
                {
                  label: "Last 15 Days",
                  value: "olive-hsr-layout"
                },
                {
                  label: "Last 30 Days",
                  value: "olive-whitefield"
                },
                {
                  label: "Last 60 Days",
                  value: "olive-jayanagar"
                },
                {
                  label: "Custom",
                  value: "olive-jayanagar"
                },
              ]}
                placeholder="Select Location" onChange={(value) => console.log(value)}
              />
            </div>
          </div>
        </div>
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
          {mockCardData.map((data, index) => (
            <div key={index} onClick={handleCallClick}>
              <div className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-background duration-300 p-2 cursor-pointer'>
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
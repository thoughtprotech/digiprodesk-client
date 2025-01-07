import Layout from '@/components/Layout'
import { FileText } from 'lucide-react'
import CallCard from './_components/CallCard'
import Input from '@/components/ui/Input'
import { useState } from 'react'
import Select from '@/components/ui/Select'

export default function Index() {
  const [searchParam, setSearchParam] = useState<string>('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParam(event.target.value)
  }

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <FileText />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>CALL LOGS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2'>
        <div className='w-full flex gap-2 items-end'>
          <div>
            <Input type='text' placeholder='Search Call Logs' value={searchParam} onChange={handleSearchChange} />
          </div>
          <div>
            <Select options={[
              {
                label: "Olive Indiranagar",
                value: "olive-indiranagar"
              },
              {
                label: "Olive Koramangala",
                value: "olive-koramangala"
              },
              {
                label: "Olive HSR Layout",
                value: "olive-hsr-layout"
              },
              {
                label: "Olive Whitefield",
                value: "olive-whitefield"
              },
              {
                label: "Olive Jayanagar",
                value: "olive-jayanagar"
              },
            ]}
              placeholder="Select Location" onChange={(value) => console.log(value)}
            />
          </div>
        </div>
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2'>
          {
            // Create an array of 10 cards
            Array.from({ length: 10 }, (_, i) => (
              <div key={i} className='w-full h-full flex flex-col gap-2 bg-background'>
                <CallCard />
              </div>
            ))
          }
        </div>
      </div>
    </Layout>
  )
}
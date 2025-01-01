import Layout from '@/components/Layout'
import { MapPin } from 'lucide-react'

export default function Index() {
  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <MapPin />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>LOCATIONS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2 bg-background p-2'>
        <div>
          <h1 className='font-bold'>Location Configuration Coming Soon</h1>
        </div>
      </div>
    </Layout>
  )
}
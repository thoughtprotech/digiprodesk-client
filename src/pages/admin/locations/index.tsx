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
      <div className='w-full h-screen flex overflow-hidden bg-background'>
        <div className='w-60 h-full flex flex-col bg-background border-r-2 border-r-border p-2 pr-4'>
          <div className='border-b border-b-border'>
            <h1 className='font-bold text-lg'>Configure Locations</h1>
          </div>
          <div className='w-full h-fit px-2 flex items-center gap-2 rounded hover:bg-foreground duration-300 cursor-pointer'>
            <h1 className='font-medium text-lg'>Olive Indiranagar</h1>
          </div>
        </div>
        <div className='w-full h-full flex flex-col bg-background p-2'>
          <h1 className='font-bold'>Location Configuration Coming Soon</h1>
        </div>
      </div>
    </Layout>
  )
}
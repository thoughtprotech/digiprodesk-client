import Layout from '@/components/Layout'
import { Settings } from 'lucide-react'

export default function Index() {
  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <Settings />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>SETTINGS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2 bg-background p-2'>
        <div>
          <h1 className='font-bold'>User Settings Coming Soon</h1>
        </div>
      </div>
    </Layout>
  )
}
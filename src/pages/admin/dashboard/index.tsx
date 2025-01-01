import Layout from '@/components/Layout'
import { LayoutDashboard } from 'lucide-react'

export default function Index() {
  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <LayoutDashboard />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>DASHBOARD</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2 bg-background p-2'>
        <div>
          <h1 className='font-bold'>Dashboard Analytics Coming Soon</h1>
        </div>
      </div>
    </Layout>
  )
}
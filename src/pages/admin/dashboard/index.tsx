import Layout from '@/components/Layout'

export default function Index() {
  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-xl'>DASHBOARD</h1>
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
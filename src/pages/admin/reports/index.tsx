import Layout from '@/components/Layout'
import Tabs from '@/components/ui/Tabs';
import Calls from './_components/calls/Calls';
import Users from './_components/users/Users';

export default function Index() {
  const tabData = [
    { label: "Calls", content: <Calls /> },
    { label: "Users", content: <Users /> },
  ];

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <h1 className='font-bold text-lg'>REPORTS</h1>
        </div>
      </div>
    }>
      <div className='w-full min-h-screen h-fit px-2'>
        <Tabs tabs={tabData} />
      </div>
    </Layout>
  )
}
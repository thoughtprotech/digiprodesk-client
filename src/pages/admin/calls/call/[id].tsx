import Layout from '@/components/Layout'
import { Calendar, Clock, NotebookPen, Pause, Phone, PhoneCall, PhoneIncoming, PhoneOff, Play, Ticket } from 'lucide-react';
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <PhoneCall />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>CALL #{router.query.id}</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] flex flex-col-reverse gap-2'>
        <div className='w-full h-2/4 flex gap-2'>
          <div className='w-1/3 h-full max-h-[50vh] p-2 rounded-md bg-foreground flex flex-col gap-2 overflow-auto relative'>
            <div className='w-full border-b border-b-border pb-2 sticky top-0 z-50 bg-foreground'>
              <div>
                <h1 className='text-2xl font-bold'>Olive Indiranagar</h1>
              </div>
              <div className="w-full flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 text-textAlt" />
                  <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">01-01-2025</h1>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 text-textAlt" />
                  <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">08:00 AM</h1>
                </div>
                <div className="flex items-center gap-1">
                  <Ticket className="w-4 text-textAlt" />
                  <h1 className="font-semibold text-sm text-textAlt whitespace-nowrap">BKID123456</h1>
                </div>
              </div>
            </div>
            <div className='w-full h-full flex flex-col gap-2'>
              <div>
                <h1 className='font-bold text-xl'>Timeline</h1>
              </div>
              <div className='w-full h-full flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                    <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:00 AM</h1>
                  </div>
                  <div className='w-fit flex flex-col bg-sky-700/30 p-1 px-2 rounded-md'>
                    <div className='w-fit flex justify-center items-center gap-2'>
                      <PhoneIncoming className='w-4 ' />
                      <h1 className='font-bold text-sm'>Call Inbound</h1>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                    <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:00 AM</h1>
                  </div>
                  <div className='w-fit flex flex-col bg-green-700/30 p-1 px-2 rounded-md'>
                    <div className='w-fit flex justify-center items-center gap-2'>
                      <Phone className='w-4 ' />
                      <h1 className='font-bold text-sm'>Call Accepted</h1>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                    <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:02 AM</h1>
                  </div>
                  <div className='w-fit flex flex-col bg-indigo-700/30 p-1 px-2 rounded-md'>
                    <div className='w-fit flex justify-center items-center gap-2'>
                      <Pause className='w-4 ' />
                      <h1 className='font-bold text-sm'>Call Put On Hold</h1>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                    <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:02 AM</h1>
                  </div>
                  <div className='w-fit flex flex-col bg-purple-700/30 p-1 px-2 rounded-md'>
                    <div className='w-fit flex justify-center items-center gap-2'>
                      <Play className='w-4 ' />
                      <h1 className='font-bold text-sm'>Call Resumed</h1>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <div className='w-1/4 h-full flex items-center border-r-2 border-r-border border-dashed pr-2'>
                    <h1 className='text-sm text-textAlt font-bold whitespace-nowrap'>8:05 AM</h1>
                  </div>
                  <div className='w-fit flex flex-col bg-red-700/30 p-1 px-2 rounded-md'>
                    <div className='w-fit flex justify-center items-center gap-2'>
                      <PhoneOff className='w-4 ' />
                      <h1 className='font-bold text-sm'>Call Ended</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='w-full h-full rounded-md bg-foreground flex flex-col gap-2 overflow-auto relative'>
            <div className='w-full border-b border-b-border pb-2 sticky top-0 bg-foreground p-2'>
              <div>
                <h1 className='text-2xl font-bold'>Documents</h1>
              </div>
              <div className="flex items-center gap-1">
                <NotebookPen className="w-4 text-textAlt" />
                <h1 className="font-semibold text-sm text-textAlt border-r border-r-border pr-2">Notes</h1>
                <div>
                  <h1 className='text-xs text-textAlt'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id odio beatae dignissimos nostrum </h1>
                </div>
              </div>
            </div>
            <div className='p-2'>
              {/* Grid of black boxes */}
              <div className='w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                {
                  Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className='w-full h-32 rounded-md flex flex-col gap-2 bg-black'>

                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <div className='w-full h-full bg-black rounded-md'>

        </div>
      </div>
    </Layout >
  )
}
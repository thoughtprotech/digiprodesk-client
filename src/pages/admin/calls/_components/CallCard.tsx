import { Calendar, Clock, Ticket } from "lucide-react";

export default function CallCard() {
  return (
    <div className='w-full h-full flex flex-col gap-2 bg-foreground p-2 rounded-md'>
      <div>
        <div>
          <h1 className='font-bold'>Olive Indiranagar</h1>
        </div>
        <div className="w-full flex flex-col gap-1 justify-between">
          <div className="w-full flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 text-textAlt" />
              <h1 className="font-semibold text-sm text-textAlt">01-01-2025</h1>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 text-textAlt" />
              <h1 className="font-semibold text-sm text-textAlt">08:00 AM</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Ticket className="w-4 text-textAlt" />
            <h1 className="font-semibold text-sm text-textAlt">BKID123456</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
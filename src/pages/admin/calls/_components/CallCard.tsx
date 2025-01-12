import { Calendar, Clock, User } from "lucide-react";

interface CallCardProps {
  name: string;
  date: string;
  time: string;
  ticket: string;
  onClick?: () => void;
}

export default function CallCard({
  name,
  date,
  time,
  ticket,
  onClick,
}: CallCardProps) {
  return (
    <div className='w-full h-fit flex flex-col gap-2 bg-background border border-border hover:bg-foreground duration-300 p-2 rounded-md cursor-pointer' onClick={onClick}>
      <div className="w-full flex items-center justify-between">
        <div className="w-full flex flex-col items-start">
          <div className="flex items-center gap-1">
            <Calendar className="w-[0.7rem] text-textAlt" />
            <h1 className="text-[0.6rem] text-textAlt">{date}</h1>
          </div>
          <div>
            <h1 className='font-bold'>{ticket}</h1>
          </div>
        </div>
        <div className="w-full flex flex-col items-end justify-end">
          <div className="flex items-center gap-1">
            <Clock className="w-3 text-textAlt" />
            <h1 className="text-xs text-textAlt">{time}</h1>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 text-textAlt" />
            <h1 className="text-xs text-textAlt">{name}</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
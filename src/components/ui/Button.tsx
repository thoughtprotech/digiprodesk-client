/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Button({ text, color, icon, className, onClick }: {
  text?: string;
  color?: string
  icon?: any;
  className?: string;
  onClick: any;
}) {
  return (
    <div className={className ? className : `w-full bg-${color}-500/30 border-2 border-${color}-500 hover:bg-${color}-500 rounded-md px-4 py-2 flex items-center justify-center space-x-1 duration-300 cursor-pointer`} onClick={onClick}>
      <div className="flex items-center justify-center space-x-2">
        {icon ? icon : null}
        {text ? <h1 className="text-text font-bold whitespace-nowrap">{text}</h1> : null}
      </div>
    </div>
  );
}
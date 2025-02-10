import { useEffect, useState } from "react";

export default function ElapsedTime({ startTime }: { startTime: string | Date }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsedTime = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsed(
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
      );
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="w-fit rounded-md px-2 py-1 bg-foreground">
      <h1 className="font-bold text-xs" >
        {elapsed}
      </h1>
    </div>
  );
}
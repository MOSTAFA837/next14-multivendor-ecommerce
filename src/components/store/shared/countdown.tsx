import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const diffrence = targetTime - now;

      if (diffrence > 0) {
        const days = Math.floor(diffrence / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffrence / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffrence / (1000 * 60)) % 60);
        const seconds = Math.floor((diffrence / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);

    // Initial calculation to avoid delay
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={cn("text-orange-background leading-4")}>
      <div className={cn("inline-block text-xs")}>
        <span className="mr-1">Ends in:</span>

        <div className="inline-block">
          <span
            className={cn(
              "bg-orange-background text-white min-w-5 p-0 rounded-[2px] inline-block min-h-4 text-center"
            )}
          >
            {timeLeft.days.toString().padStart(2, "0")}
          </span>
          <span className="mx-1">:</span>
          <span
            className={cn(
              "bg-orange-background text-white min-w-5 p-0 rounded-[2px] inline-block min-h-4 text-center"
            )}
          >
            {timeLeft.hours.toString().padStart(2, "0")}
          </span>
          <span className="mx-1">:</span>
          <span
            className={cn(
              "bg-orange-background text-white min-w-5 p-0 rounded-[2px] inline-block min-h-4 text-center"
            )}
          >
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className="mx-1">:</span>
          <span
            className={cn(
              "bg-orange-background text-white min-w-5 p-0 rounded-[2px] inline-block min-h-4 text-center"
            )}
          >
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

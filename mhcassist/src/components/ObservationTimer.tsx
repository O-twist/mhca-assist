import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { cn } from '../lib/utils';

interface ObservationTimerProps {
  deadline: Date;
  className?: string;
}

export const ObservationTimer = ({ deadline, className }: ObservationTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = differenceInSeconds(deadline, new Date());
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isUrgent = hours < 6;
  const isOverdue = timeLeft === 0;

  return (
    <div className={cn(
      "font-mono text-lg font-bold p-2 rounded-md border",
      isOverdue ? "bg-red-100 text-red-700 border-red-300" :
      isUrgent ? "bg-orange-100 text-orange-700 border-orange-300 animate-pulse" :
      "bg-green-100 text-green-700 border-green-300",
      className
    )}>
      {isOverdue ? "OVERDUE" : `${hours}h ${minutes}m ${seconds}s`}
    </div>
  );
};

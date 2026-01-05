import { useState, useEffect } from 'react';

const TIME_WINDOWS = {
  breakfast: { start: '20:00', end: '21:30' },
  lunch: { start: '08:00', end: '09:30' },
  dinner: { start: '11:30', end: '14:00' }
};

export const useTimeWindow = (mealType) => {
  const [isInWindow, setIsInWindow] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!mealType) return;

    const checkWindow = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const window = TIME_WINDOWS[mealType];
      if (!window) return;

      const [startHour, startMin] = window.start.split(':').map(Number);
      const [endHour, endMin] = window.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      // Handle overnight windows (breakfast)
      let inWindow;
      if (mealType === 'breakfast' && startTime > endTime) {
        inWindow = currentTime >= startTime || currentTime <= endTime;
      } else {
        inWindow = currentTime >= startTime && currentTime <= endTime;
      }

      setIsInWindow(inWindow);

      if (inWindow) {
        let minutesLeft;
        if (mealType === 'breakfast' && currentTime < endTime) {
          minutesLeft = endTime - currentTime;
        } else {
          minutesLeft = endTime - currentTime;
        }

        const hours = Math.floor(minutesLeft / 60);
        const minutes = minutesLeft % 60;
        setTimeRemaining(
          hours > 0 
            ? `${hours}h ${minutes}m remaining` 
            : `${minutes}m remaining`
        );
      } else {
        setTimeRemaining('Window closed');
      }
    };

    checkWindow();
    const interval = setInterval(checkWindow, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [mealType]);

  return { isInWindow, timeRemaining, windows: TIME_WINDOWS };
};
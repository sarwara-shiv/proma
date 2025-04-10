import React, { useState, useEffect } from 'react';

interface ArgsType{
    size?:"xs"|"sm"|"md"|"lg";
    showSeconds?:boolean;
}

const DigitalClock: React.FC<ArgsType> = ({size='xs', showSeconds=false}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  
  const widthMap = {
    xs: 'w-4', // 5 units width for xs
    sm: 'w-5', // 12 units width for sm
    md: 'w-5', // 16 units width for md
    lg: 'w-5', // 20 units width for lg
  };

  // Function to format time as HH:MM:SS
  const formatTime = (date: Date) => {
    const _hours = String(date.getHours()).padStart(2, '0');
    const _minutes = String(date.getMinutes()).padStart(2, '0');
    const _seconds = String(date.getSeconds()).padStart(2, '0');
    setHours(_hours);
    setMinutes(_minutes);
    setSeconds(_seconds);
    return `${_hours}:${_minutes}:${_seconds}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatTime(now)); // Update time every second
    }, 1000);

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`text-${size} p-1 text-center flex justify-center items-center font-mono`}>
      {/* {currentTime} */}
      <span className={`${widthMap[size]} text-center`}>{hours}</span>
      <span className='px-[0px] animate-blink'>:</span>
      <span className={`${widthMap[size]} text-center`}>{minutes}</span>
      {showSeconds && <>
        <span className='px-[0px] animate-blink'>:</span>
        <span className={`${widthMap[size]} text-center`}>{seconds}</span>
      </>
      }
    </div>
  );
};

export default DigitalClock;

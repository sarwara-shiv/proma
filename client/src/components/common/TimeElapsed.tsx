import { useEffect, useState } from 'react';
import { format, differenceInMilliseconds } from 'date-fns';

interface TimeElapsedProps {
  startDate?: string | Date | null;
  showSeconds?: boolean;
  size?:"xs"|"sm"|"md"|"lg";
    showText?:boolean
}

const TimeElapsed: React.FC<TimeElapsedProps> = ({ startDate, showSeconds = false, showText=false, size="sm" }) => {
  const [timeDiff, setTimeDiff] = useState<string>('00:00');
  const [timeDiffSeperate, setTimeDiffSeperated] = useState<{hours:string, minutes:string, seconds:string}>({hours:'00', minutes:'00', seconds:'00'});

  const widthMap = {
    xs: 'w-4', // 5 units width for xs
    sm: 'w-5', // 12 units width for sm
    md: 'w-5', // 16 units width for md
    lg: 'w-5', // 20 units width for lg
  };

  useEffect(() => {
    const updateTimeDiff = () => {
      if (startDate) {
        const now = new Date();
        const start = new Date(startDate);
        const diffMs = differenceInMilliseconds(now, start);

        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');

        setTimeDiffSeperated({hours, minutes, seconds});

        setTimeDiff(showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`);
      }
    };

    updateTimeDiff(); // Run initially
    const interval = setInterval(updateTimeDiff, showSeconds ? 1000 : 60000); // Based on mode

    return () => clearInterval(interval);
  }, [startDate, showSeconds]);

  return (
    <div>
      {startDate && (
        <>
        {showText ? 
            <div>
                <div>Start Time: {format(new Date(startDate), 'HH:mm')}</div>
                <div>Elapsed Time: {timeDiff}</div>
            </div>
            :
            <div className={`text-${size} px-1 text-center flex justify-center items-center font-mono`}>
                {/* {currentTime} */}
                <span className={`${widthMap[size]} text-center`}>{timeDiffSeperate.hours}</span>
                <span className='px-[0px] animate-blink'>:</span>
                <span className={`${widthMap[size]} text-center`}>{timeDiffSeperate.minutes}</span>
                {showSeconds && <>
                    <span className='px-[0px] animate-blink'>:</span>
                    <span className={`${widthMap[size]} text-center`}>{timeDiffSeperate.seconds}</span>
                </>
                }
            </div>
        }
          
        </>
      )}
    </div>
  );
};

export default TimeElapsed;

import React, { useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from 'react-icons/md';

interface CustomTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  minTime?: string;
  maxTime?: string;
  is24Hour?: boolean;
  popup?: boolean;
  size?:'sm' | 'md' | 'lg' | 'xl'
}

const pad = (num: number) => String(num).padStart(2, '0');

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const from12To24 = (hour: number, isAM: boolean) => {
  if (isAM) return hour === 12 ? 0 : hour;
  return hour === 12 ? 12 : hour + 12;
};

const from24To12 = (hour: number) => ({
  hour: hour === 0 ? 12 : hour > 12 ? hour - 12 : hour,
  isAM: hour < 12,
});

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  minTime,
  maxTime,
  is24Hour = true,
  popup = true,
  size='sm'
}) => {
  // State for hour, minute, and AM/PM for 12-hour format
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);

  const inputW = size === 'sm' ? 'w-7' : 
                  size === 'md' ? 'w-8' :
                  size === 'lg' ? 'w-12' :
                 'w-16';
  const btnW = size === 'sm' ? 'text-lg' : 
                  size === 'md' ? 'text-xl' :
                  size === 'lg' ? 'text-2xl' :
                 'text-3xl';

  // Set default time to current time if no value is provided
  const getCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (is24Hour) {
      return `${pad(currentHour)}:${pad(currentMinute)}`;
    } else {
      const { hour, isAM } = from24To12(currentHour);
      return `${pad(hour)}:${pad(currentMinute)} ${isAM ? 'AM' : 'PM'}`;
    }
  };

  useEffect(() => {
    // Set default value if no value is provided
    const defaultValue = value || getCurrentTime();
    const [h, m] = defaultValue.split(':').map(Number);
    if (!is24Hour) {
      const { hour: h12, isAM } = from24To12(h);
      setHour(pad(h12));
      setAmpm(isAM ? 'AM' : 'PM');
    } else {
      setHour(pad(h));
    }
    setMinute(pad(m));
  }, [value, is24Hour]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        validateAndSubmit();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateAndSubmit = () => {
    let h = parseInt(hour) || 0;
    let m = parseInt(minute) || 0;

    if (!is24Hour) {
      h = from12To24(h, ampm === 'AM');
    }

    h = Math.min(23, Math.max(0, h)); // Validate hour
    m = Math.min(59, Math.max(0, m)); // Validate minute

    const formatted = `${pad(h)}:${pad(m)}`;

    if (minTime && toMinutes(formatted) < toMinutes(minTime)) {
      setError(`Minimum time is ${minTime}`);
      return;
    }

    if (maxTime && toMinutes(formatted) > toMinutes(maxTime)) {
      setError(`Maximum time is ${maxTime}`);
      return;
    }

    setError('');
    onChange(formatted);
  };

  const handleInputChange = (type: 'hour' | 'minute', value: string) => {
    let cleaned = value.replace(/\D/g, '').slice(0, 2); // Only allow up to 2 digits
    console.log(value);
    // Allow "00" for hour or minute input
    if (cleaned === '00') {
      cleaned = '00';
    }
  
    // Ensure hour is in the correct range
    if (type === 'hour') {
      if (is24Hour) {
        // If 24-hour format, ensure hour is between 00-23
        cleaned = Math.min(23, Math.max(0, parseInt(cleaned) || 0)).toString();
      } else {
        // If 12-hour format, ensure hour is between 01-12
        cleaned = Math.min(12, Math.max(1, parseInt(cleaned) || 1)).toString();
      }
      console.log(value,': ', cleaned);  

      if(value.length === 2 && value === "00") cleaned = "00";
      if(value.length === 2 && parseInt(value) === parseInt(cleaned)) cleaned = value;
      setHour(cleaned);
      if(value.length === 2) setTimeout(() => {minutesInputRef.current?.focus(); minutesInputRef.current?.select()}, 0);
    } else {
      // Ensure minutes are between 00-59
      cleaned = Math.min(59, Math.max(0, parseInt(cleaned) || 0)).toString();
      if(value.length === 2 && value === "00") cleaned = "00";
      if(value.length === 2 && parseInt(value) === parseInt(cleaned)) cleaned = value;
      // Allow "00" for minutes
      setMinute(cleaned);
    }
  };
  
  

  const handleBlur = () => {
    // Ensure both hour and minute are formatted with leading zeros on blur
    // This ensures even if the user enters a single digit number like '1' or '5', it gets converted to '01' or '05' respectively
    const formattedHour = pad(parseInt(hour) || 0);
    const formattedMinute = pad(parseInt(minute) || 0);
    
    // Update states only if necessary
    if (hour !== formattedHour) {
      setHour(formattedHour);
    }
  
    if (minute !== formattedMinute) {
      setMinute(formattedMinute);
    }
  
    validateAndSubmit();
  };

  const adjustTime = (type: 'hour' | 'minute', delta: number) => {
    let h = parseInt(hour || '0', 10);
    let m = parseInt(minute || '0', 10);

    if (type === 'hour') h = (h + delta + 24) % 24;
    else m = (m + delta + 60) % 60;

    const result = `${pad(h)}:${pad(m)}`;
    if (minTime && toMinutes(result) < toMinutes(minTime)) return;
    if (maxTime && toMinutes(result) > toMinutes(maxTime)) return;

    setHour(pad(h));
    setMinute(pad(m));
    validateAndSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'hour' | 'minute') => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustTime(type, 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustTime(type, -1);
    } else if (e.key === 'Enter') {
      validateAndSubmit();
      if (popup) setIsOpen(false);
    }
  };

  const handleWheel = (e: React.WheelEvent, type: 'hour' | 'minute') => {
    // e.preventDefault(); // Prevent page scroll behavior

    if (e.deltaY > 0) {
      adjustTime(type, -1); // Scroll down -> decrease
    } else {
      adjustTime(type, 1); // Scroll up -> increase
    }
  };

  const renderInputs = () => (
    <div className={`flex items-center space-x-0 text-${size}`}>
      {/* Hour Input */}
      <div className='flex flex-col'>
        <button onClick={() => adjustTime('hour', 1)} className={`${btnW} flex justify-center items-center`}><MdOutlineKeyboardArrowUp/></button>
          <input
            ref={hoursInputRef}
            value={hour}
            onChange={(e) => handleInputChange('hour', e.target.value)}
            onBlur={handleBlur}
            onWheel={(e) => handleWheel(e, 'hour')}
            onKeyDown={(e) => handleKeyDown(e, 'hour')}
            className={`${inputW} text-center rounded p-1 shadow-none border focus:shadow-lg focus:outline-none focus:border-white`}
            maxLength={2}
            placeholder="HH"
          />
          <button onClick={() => adjustTime('hour', -1)} className={`${btnW} flex justify-center items-center`}><MdOutlineKeyboardArrowDown/></button>
      </div>
      <span>:</span>
      {/* Minute Input */}
      <div className='flex flex-col'>
        <button onClick={() => adjustTime('minute', 1)} className={`${btnW} flex justify-center items-center`}><MdOutlineKeyboardArrowUp/></button>
        <input
          ref={minutesInputRef}
          value={minute}
          onChange={(e) => handleInputChange('minute', e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'minute')}
          onWheel={(e) => handleWheel(e, 'minute')}
          onBlur={handleBlur}
          className={`${inputW} text-center rounded p-1 shadow-none border focus:shadow-lg focus:outline-none focus:border-white`}
          maxLength={2}
          placeholder="MM"
        />
        <button onClick={() => adjustTime('minute', -1)} className={`${btnW} flex justify-center items-center`}><MdOutlineKeyboardArrowDown/></button>
      </div>

      {/* AM/PM Toggle */}
      {!is24Hour && (
        <select
          value={ampm}
          onChange={(e) => setAmpm(e.target.value as 'AM' | 'PM')}
          className="border rounded p-1"
        >
          <option>AM</option>
          <option>PM</option>
        </select>
      )}

      {/* OK Button */}
      {popup && (
        <button
          onClick={() => {
            validateAndSubmit();
            setIsOpen(false);
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          OK
        </button>
      )}
    </div>
  );

  return popup ? (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border px-4 py-2 rounded hover:bg-gray-100"
      >
        {`${pad(parseInt(hour))}:${pad(parseInt(minute))}`}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 p-3 bg-white border rounded shadow-md">
          {renderInputs()}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      )}
    </div>
  ) : (
    <div ref={wrapperRef}>
      {renderInputs()}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default CustomTimePicker;

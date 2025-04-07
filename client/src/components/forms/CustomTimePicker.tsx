import React, { useState } from 'react';

const CustomTimePicker = () => {
  const [time, setTime] = useState<string>('00:00'); // Default to '00:00' (midnight)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Generate time options in 24-hour format with 15-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const handleTimeSelect = (selectedTime: string) => {
    setTime(selectedTime);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      {/* Button to toggle the time dropdown */}
      <button 
        type="button"
        onClick={toggleDropdown}
        className="w-full p-2 border rounded-md text-gray-800"
      >
        {time}
      </button>

      {/* Custom dropdown for time selection */}
      {isDropdownOpen && (
        <div className="absolute bg-white shadow-lg rounded-md w-full mt-2 max-h-60 overflow-y-auto min-w-[80px]">
          <ul className="p-2">
            {generateTimeOptions().map((timeOption) => (
              <li
                key={timeOption}
                onClick={() => handleTimeSelect(timeOption)}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {timeOption}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;

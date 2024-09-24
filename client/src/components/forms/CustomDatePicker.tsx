// CustomDateTimePicker.tsx

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS file for styling

interface CustomDateTimePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null, name:string) => void;
  showTimeSelect: boolean;
  label?:string;
  placeholder?:string;
  required?: boolean;
  name?:string;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  selectedDate,
  onDateChange,
  showTimeSelect,
  name="",
  placeholder,
  required=false,
  label
}) => {
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);

  const handleChange = (date: Date | null) => {
    setStartDate(date);
    onDateChange(date, name);
  };

  return (
    <div className="relative inline-block w-full">
         {label && (
                <div className='flex items-center'>
                    <label className='text-gray-400 flex items-center'>
                        {label}
                    </label>
                </div>
            )}
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        dateFormat="dd.MM.YYYY"
        timeFormat={showTimeSelect ? 'HH:mm' : undefined} // Conditionally add time format
        showTimeSelect={showTimeSelect} // Conditionally show time picker
        timeIntervals={15} // Time intervals for the time picker
        placeholderText={placeholder || "Select a date"}
        className="w-fullbg-gray-50 border  text-gray-900 text-sm rounded-sm focus:outline-none block w-full p-2.5 dark:bg-gray-700"
      />
    </div>
  );
};

export default CustomDateTimePicker;

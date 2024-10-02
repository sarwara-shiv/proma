import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../assets/styles/datepicker.css';
import { format, parse } from 'date-fns'; // Import parse to manually parse the date input
import { ObjectId } from 'mongodb';
import { FaCalendarAlt } from 'react-icons/fa'; // Importing a calendar icon from react-icons

interface CustomDateTimePickerProps {
  selectedDate: Date | null;
  onDateChange?: (recordId: string | ObjectId, date: Date | null, name: string) => void;
  onChange?: (recordId: string | ObjectId, value: Date | null, name: string) => void;
  showTimeSelect?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  recordId?: string | ObjectId;
  name?: string;
  disable?:boolean;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  selectedDate,
  onDateChange,
  onChange,
  showTimeSelect = false,
  name = "",
  placeholder = '__.__.____', // Default placeholder showing the format
  required = false,
  recordId = '',
  label,
  disable=false
}) => {
  const [dateValue, setDateValue] = useState<Date | null>(selectedDate);
  const [manualInput, setManualInput] = useState<string>(selectedDate ? format(selectedDate, 'dd.MM.yyyy') : '');
  const datePickerRef = useRef<any>(null); // Create a reference to control DatePicker

  useEffect(()=>{
    console.log(dateValue);
    if(selectedDate){
      setDateValue(selectedDate);
      setManualInput(format(selectedDate, 'dd.MM.yyyy') );
    }
  },[selectedDate])

  // Function to handle the manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Automatically add dots to the date (dd.MM.yyyy)
    if (input.length === 2 || input.length === 5) {
      input += '.';
    }

    setManualInput(input);

    // Validate and update the date if it's in the correct format
    if (input.length === 10) {
      const parsedDate = parse(input, 'dd.MM.yyyy', new Date());

      if (!isNaN(parsedDate.getTime())) {
        setDateValue(parsedDate);
        if (onDateChange) onDateChange(recordId, parsedDate, name);
        if (onChange) onChange(recordId, parsedDate, name);
      }
    }
  };

  // Handle when the DatePicker changes
  const handleDateChange = (date: Date | null) => {
    setDateValue(date);
    setManualInput(date ? format(date, 'dd.MM.yyyy') : ''); // Update the manual input field
    if (onDateChange) onDateChange(recordId, date, name);
    if (onChange) onChange(recordId, date, name);
  };

  const openDatePicker = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(true); // Open the date picker programmatically
    }
  };

  return (
    <div className="relative inline-block w-full">
      {label && (
        <div className="flex items-center mb-0">
          <label className="text-gray-400 flex items-center text-sm">{label}</label>
        </div>
      )}

      <div className={`
        relative flex items-center w-full
          ${disable ? 'pointer-events-none opacity-60': ''}
        `}>
        <input
          type="text"
          value={manualInput}
          onChange={handleInputChange} // Handle manual input
          placeholder={placeholder} // Show "__.__.____" format as placeholder
          className="w-full bg-gray-50 border text-gray-900 text-sm rounded-sm focus:outline-none block p-2.5 pr-10 dark:bg-gray-700"
        />

        <button
          type="button"
          onClick={openDatePicker} // Open date picker when button is clicked
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
        >
          <FaCalendarAlt size={18} />
        </button>
      </div>

      {/* DatePicker is hidden but connected to the input field */}
      <DatePicker
        selected={dateValue}
        onChange={handleDateChange}
        dateFormat="dd.MM.yyyy"
        timeFormat={showTimeSelect ? 'HH:mm' : undefined}
        showTimeSelect={showTimeSelect}
        timeIntervals={15}
        ref={datePickerRef} // Ref to control the DatePicker
        className="hidden absolute" // Hide the default date picker
      />
    </div>
  );
};

export default CustomDateTimePicker;

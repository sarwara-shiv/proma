import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../assets/styles/datepicker.css';
import { format } from 'date-fns';
import { ObjectId } from 'mongodb';
import { FaCalendarAlt } from 'react-icons/fa'; // Importing a calendar icon from react-icons

interface CustomDateTimePickerProps {
  selectedDate: Date | null;
  onDateChange?: (recordId: string | ObjectId, date: Date | null, name: string) => void;
  onChange?: (recordId: string | ObjectId, value: Date | null, name: string) => void;
  showTimeSelect: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  recordId?: string | ObjectId;
  name?: string;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  selectedDate,
  onDateChange,
  onChange,
  showTimeSelect,
  name = "",
  placeholder,
  required = false,
  recordId = '',
  label,
}) => {
  const [dateValue, setDateValue] = useState<Date | null>(selectedDate);
  const datePickerRef = useRef<any>(null); // Create a reference to control DatePicker

  const handleChange = (date: Date | null) => {
    setDateValue(date);
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

      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={dateValue ? format(new Date(dateValue), 'dd.MM.yyyy') : ''}
          placeholder={placeholder || 'Select a date'}
          className="w-full bg-gray-50 border text-gray-900 text-sm rounded-sm focus:outline-none block p-2.5 pr-10 dark:bg-gray-700"
          readOnly
          onClick={openDatePicker} // Open date picker when input is clicked
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
        onChange={handleChange}
        dateFormat="dd.MM.yyyy"
        timeFormat={showTimeSelect ? 'HH:mm' : undefined}
        showTimeSelect={showTimeSelect}
        timeIntervals={15}
        ref={datePickerRef} // Ref to control the DatePicker
        className="hidden" // Hide the default date picker
      />
    </div>
  );
};

export default CustomDateTimePicker;

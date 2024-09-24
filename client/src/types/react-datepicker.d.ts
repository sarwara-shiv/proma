// src/types/react-datepicker.d.ts
declare module 'react-datepicker' {
    import * as React from 'react';
  
    export interface DatePickerProps {
      selected?: Date | null;
      onChange?: (date: Date | null) => void;
      dateFormat?: string;
      timeFormat?: string;
      showTimeSelect?: boolean;
      timeIntervals?: number;
      placeholderText?: string;
      className?: string;
    }
  
    export default class DatePicker extends React.Component<DatePickerProps> {}
  }
  
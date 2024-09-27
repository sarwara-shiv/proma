// src/utils/dateUtils.ts
import { format, compareAsc } from 'date-fns';  // Optionally use date-fns or native JS Date

/**
 * Format a date string to a specified format
 * @param date - The date string to format
 * @param dateFormat - The format to use (default 'dd.MM.yyyy')
 */
export const formatDate = (date: string| Date, dateFormat: string = 'dd.MM.yyyy'): string => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid Date';
  }
  return format(parsedDate, dateFormat);
};

/**
 * Compare two date strings and return a comparison result
 * @param date1 - The first date string
 * @param date2 - The second date string
 * @returns {number} - 1 if date1 is after date2, -1 if date1 is before date2, 0 if equal
 */
export const compareDates = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error('Invalid Date Format');
  }

  return compareAsc(d1, d2); // -1, 0, or 1 depending on comparison
};

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (date: string): boolean => {
  const today = new Date();
  const inputDate = new Date(date);
  
  return inputDate < today;
};

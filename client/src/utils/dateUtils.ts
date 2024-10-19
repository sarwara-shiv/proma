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
 * Compare two date strings and return a difference
 * @param date1 - The first date string
 * @param date2 - The second date string
 * @returns {number} - 1 if date1 is after date2, -1 if date1 is before date2, 0 if equal
 */
export const getDatesDifference = (date1: string | Date, date2: string | Date): { years: number, months: number, days: number, totalDays: number } => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error('Invalid Date Format');
  }

  let years: number = d2.getFullYear() - d1.getFullYear();
  let months: number = d2.getMonth() - d1.getMonth();
  let days: number = d2.getDate() - d1.getDate();

  // Adjust if the day difference is negative
  if (days < 0) {
    months -= 1;
    const lastMonth = new Date(d2.getFullYear(), d2.getMonth(), 0); // Get last day of the previous month
    days += lastMonth.getDate(); // Adjust the days by adding the days of the previous month
  }

  // Adjust if the month difference is negative
  if (months < 0) {
    years -= 1;
    months += 12; // Adjust the months by adding 12 months
  }

  // Calculate the total difference in days as a signed integer
  const diffTime = d2.getTime() - d1.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days (signed)

  return { years, months, days, totalDays };
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

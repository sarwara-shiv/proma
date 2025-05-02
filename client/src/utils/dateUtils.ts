// src/utils/dateUtils.ts
import { format, compareAsc } from 'date-fns';  // Optionally use date-fns or native JS Date
import { WORK_START_HOUR, WORKING_DAYS, WORKING_HOURS_PER_DAY } from "../constants/calendar";

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
 * 
 * GET DATE DIFFERENCE IN DAYS
 * 
 */
export function getDatesDifferenceInDays(fromDate: Date | string, toDate: Date | string = new Date()) {
  const d1 = new Date(fromDate);
  const d2 = new Date(toDate);

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffInMs = d1.getTime() - d2.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const status =
    diffInDays > 0
      ? `due`
      : diffInDays < 0
      ? `overdue`
      : 'dueToday';

  return {
    days: diffInDays,
    status,
  };
}



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

/**
 * 
 * Generate date Range
 * @param data[] - {startDate, endData}
 *  
 * 
 */

export const generateDateRange = (dataA: {startDate:Date, endDate:Date}[]): Date[] => {
  const validateData = dataA.filter(
    (data) => data.startDate && data.endDate
  );
  console.log("Valid Sprints:", validateData); // Debug filtered sprints

  if (validateData.length === 0) {
    return [];
  }

  const minStartDate = Math.min(
    ...validateData.map((data) => new Date(data.startDate!).getTime())
  );
  const maxEndDate = Math.max(
    ...validateData.map((data) => new Date(data.endDate!).getTime())
  );

  const dates: Date[] = [];
  let currentDate = minStartDate;

  while (currentDate <= maxEndDate) {
    dates.push(new Date(currentDate));
    currentDate += 1000 * 60 * 60 * 24;
  }

  return dates;
};
/**
 * Adds working hours to a given start date, skipping non-working days.
 * @param startDate The date to start from
 * @param hours The number of working hours to add
 * @returns A new Date after the working hours have been added
 */
export const addWorkingHours = (startDate: Date, hours: number): Date => {
  const date = new Date(startDate);
  let remainingHours = hours;

  while (remainingHours > 0) {
    const day = date.getDay();

    if (WORKING_DAYS.includes(day)) {
      const hoursToAdd = Math.min(remainingHours, WORKING_HOURS_PER_DAY);
      date.setHours(date.getHours() + hoursToAdd);
      remainingHours -= hoursToAdd;
    }

    if (remainingHours > 0) {
      date.setDate(date.getDate() + 1);
      date.setHours(WORK_START_HOUR, 0, 0, 0);
    }
  }

  return date;
};
/**
 * Get expectedTime based on startDate and endDate(dueDate) skipping weekends
 * @param startDate The date to start from
 * @param endDate The date to start from
 * @returns expectedTime in hours
 */
export const calculateWorkingHours = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalHours = 0;

  // Ensure start is before end
  if (start > end) return 0;

  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();

    if (WORKING_DAYS.includes(day)) {
      const isSameDay = current.toDateString() === end.toDateString();

      const startHour = current.getHours();
      const endHour = isSameDay ? end.getHours() : WORK_START_HOUR + WORKING_HOURS_PER_DAY;

      const workHours = Math.min(
        Math.max(endHour - Math.max(startHour, WORK_START_HOUR), 0),
        WORKING_HOURS_PER_DAY
      );

      totalHours += workHours;
    }

    current.setDate(current.getDate() + 1);
    current.setHours(WORK_START_HOUR, 0, 0, 0);
  }

  return totalHours;
};



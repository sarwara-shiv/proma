import moment from "moment/moment.js";
import { WORKING_DAYS, WORKING_HOURS_PER_DAY, WORK_START_HOUR, WORK_END_HOUR } from "../constants/calendar.js";

const parseDateRange = (startDate, endDate) => {
    const start = moment(startDate).startOf('day').toDate();
    const end = endDate ? moment(endDate).endOf('day').toDate() : moment(startDate).endOf('day').toDate();
    return { start, end };
  };
/**
 * Adds working hours to a given start date, skipping non-working days.
 * @param startDate The date to start from
 * @param hours The number of working hours to add
 * @returns A new Date after the working hours have been added
 */

function addWorkingHours(startDate, hours) {
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
}

/**
 * Get expectedTime based on startDate and endDate(dueDate) skipping weekends
 * @param startDate The date to start from
 * @param endDate The date to start from
 * @returns expectedTime in hours
 */

function calculateWorkingHours(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalHours = 0;

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
}

  
export { parseDateRange, calculateWorkingHours,  addWorkingHours};
import moment from "moment/moment.js";

const parseDateRange = (startDate, endDate) => {
    const start = moment(startDate).startOf('day').toDate();
    const end = endDate ? moment(endDate).endOf('day').toDate() : moment(startDate).endOf('day').toDate();
    return { start, end };
  };
  
  export { parseDateRange };
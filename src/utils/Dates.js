import moment from "moment";

const getMonthName = () => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  const d = new Date()
  return monthNames[d.getMonth()]
}

export const monthsBetween = (startingMonth, endingMonth) => {
  const start = moment(startingMonth).utcOffset('+02:00').startOf('month');
  const end = moment(endingMonth).utcOffset('+02:00').endOf('month');
  const months = [];

  while (start.isBefore(end) || start.isSame(end, 'month')) {
    months.push(start.format('YYYY-MM'));
    start.add(1, 'month');
  }

  return months;
};

export default getMonthName

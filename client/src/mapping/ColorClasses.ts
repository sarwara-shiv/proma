// Define a mapping of statuses to Tailwind CSS classes
export const statusClasses: { [key: string]: string } = {
    completed: 'bg-completed text-completed-dark',
    due: 'bg-completed text-completed-dark',
  inProgress: 'bg-inProgress text-inProgress-dark',
  onHold: 'bg-onHold text-onHold-dark',
  cancelled: 'bg-cancelled text-cancelled-dark',
  toDo: 'bg-toDo text-toDo-dark',
  blocked: 'bg-blocked text-blocked-dark',
  pendingReview: 'bg-pendingReview text-pendingReview-dark',
  open: 'bg-open text-open-dark',
  closed: 'bg-closed text-closed-dark',
  overDue: 'bg-danger text-danger-dark',
  overdue: 'bg-danger text-danger-dark',
  dueToday: 'bg-closed text-closed-dark',
  answered: 'bg-answered text-answered-dark',
  waiting: 'bg-waiting text-waiting-dark',
  notAnswered: 'bg-notAnswered text-notAnswered-dark',
  high: 'bg-high text-high-dark',
  low: 'bg-low text-low-dark',
  medium: 'bg-medium text-medium-dark',
  notStarted: 'bg-notStarted text-notStarted-dark',
  warning: 'bg-warning text-warning-dark',
  danger: 'bg-danger text-danger-dark',
  info: 'bg-info text-info-dark',
  success: 'bg-success text-success-dark',
  fail: 'bg-fail text-fail-dark',
  active: 'bg-active text-active-dark',
  notActive: 'bg-notActive text-notActive-dark',
  default:'bg-default text-default-dark',
  color1: 'bg-color1 text-color1-dark',
  color2: 'bg-color2 text-color2-dark',
  color3: 'bg-color3 text-color3-dark',
  color4: 'bg-color4 text-color4-dark',
  color5: 'bg-color5 text-color5-dark',
  color6: 'bg-color6 text-color6-dark',
  color7: 'bg-color7 text-color7-dark',
  color8: 'bg-color8 text-color8-dark',
  color9: 'bg-color9 text-color9-dark',
  color10: 'bg-color10 text-color10-dark',
  color11: 'bg-color11 text-color11-dark',
  color12: 'bg-color12 text-color12-dark',
  color13: 'bg-color13 text-color13-dark',
  color14: 'bg-color14 text-color14-dark',
  color15: 'bg-color15 text-color15-dark'

  };
export const colorClasses: { [key: string]: string } = {
  default:'bg-default text-default-dark',
  color1: 'bg-color1 text-color1-dark',
  color2: 'bg-color2 text-color2-dark',
  color3: 'bg-color3 text-color3-dark',
  color4: 'bg-color4 text-color4-dark',
  color5: 'bg-color5 text-color5-dark',
  color6: 'bg-color6 text-color6-dark',
  color7: 'bg-color7 text-color7-dark',
  color8: 'bg-color8 text-color8-dark',
  color9: 'bg-color9 text-color9-dark',
  color10: 'bg-color10 text-color10-dark',
  color11: 'bg-color11 text-color11-dark',
  color12: 'bg-color12 text-color12-dark',
  color13: 'bg-color13 text-color13-dark',
  color14: 'bg-color14 text-color14-dark',
  color15: 'bg-color15 text-color15-dark'

};

  // Optionally, you can also define a function to get the class
export const getColorClasses = (status: string): string => {
    return statusClasses[status] || 'bg-default text-default-dark'; // Fallback class
};
// Define a mapping of statuses to Tailwind CSS classes
export const statusClasses: { [key: string]: string } = {
    completed: 'bg-completed text-completed-dark',
  inProgress: 'bg-inProgress text-inProgress-dark',
  onHold: 'bg-onHold text-onHold-dark',
  cancelled: 'bg-cancelled text-cancelled-dark',
  toDo: 'bg-toDo text-toDo-dark',
  blocked: 'bg-blocked text-blocked-dark',
  pendingReview: 'bg-pendingReview text-pendingReview-dark',
  open: 'bg-open text-open-dark',
  closed: 'bg-closed text-closed-dark',
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
  };

  // Optionally, you can also define a function to get the class
export const getColorClasses = (status: string): string => {
    return statusClasses[status] || 'text-slate-500'; // Fallback class
};
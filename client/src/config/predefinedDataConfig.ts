const ProjectStatuses = [
    {_id: 'notStarted', name:'Not Started'},
    {_id: 'inProgress', name:'In Progress'},
    {_id: 'completed', name:'Completed'},
    {_id: 'onHold', name:'On Hold'},
    {_id: 'cancelled', name:'Cancelled'},
]
const TaskCategory = [
    {_id: 'dev', name:'Development'},
    {_id: 'qa', name:'QA'},
    {_id: 'content', name:'Content'}, 
    {_id: 'uiux', name:'UI/UX'},
]
const DynamicFieldsTypes = [
    {_id: 'dropdown', name:'Dropdown'},
    {_id: 'string', name:'String'},
    {_id: 'number', name:'Number'},
    {_id: 'date', name:'Date'},
    {_id: 'status', name:'Status'},
]
const milestoneStatuses = [
    {_id: 'notStarted', name:'Not Started'},
    {_id: 'inProgress', name:'In Progress'},
    {_id: 'completed', name:'Completed'},
]
const ProjectType = [
    {_id: 'inhouse', name:'inhouse', label:'In House'},
    {_id: 'client', name:'client', label:"Client"},
]
const MilestoneStatus = [
    {_id: 'completed', name:'inhouse'},
    {_id: 'inProgress', name:'inProgress'},
    {_id: 'onHold', name:'onHold'},
    {_id: 'notStared', name:'notStared'},
]
const TaskStatuses = [
    {_id: 'toDo', name:'TODO'},
    {_id: 'inProgress', name:'In Progress'},
    {_id: 'blocked', name:'Blocked'},
    {_id: 'pendingReview', name:'In Review'},
    {_id: 'completed', name:'Completed'},
]
const Priorities = [
    {_id: 'high', name:'High'},
    {_id: 'medium', name:'Medium'},
    {_id: 'low', name:'Low'},
]
const TicketStatuses = [
    {_id: 'open', name:'Open'},
    {_id: 'closed', name:'Closed'},
    {_id: 'inProgress', name:'In Progress'},
]
const QuestionsStatuses = [
    {_id: 'answered', name:'Answered'},
    {_id: 'pending', name:'Pending'},
    {_id: 'waiting', name:'Waiting'},
    {_id: 'notAnswered', name:'Not Answered'},
]

export {DynamicFieldsTypes, milestoneStatuses, ProjectType, ProjectStatuses, TaskStatuses, Priorities, TicketStatuses, QuestionsStatuses, TaskCategory}
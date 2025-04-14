const ProjectStatuses = [
    {_id: 'notStarted', name:'Not Started', color:'notStarted'},
    {_id: 'inProgress', name:'In Progress', color:'inProgress'},
    {_id: 'completed', name:'Completed', color:'completed'},
    {_id: 'onHold', name:'On Hold', color:'onHold'},
    {_id: 'cancelled', name:'Cancelled', color:'cancelled'},
]
const TaskCategory = [
    {_id: 'dev', name:'Development'},
    {_id: 'qa', name:'QA'},
    {_id: 'content', name:'Content'}, 
    {_id: 'uiux', name:'UI/UX'},
]
const KickoffStatus = [
    {_id: 'inReview', name:'In Review', color:'toDo'},
    {_id: 'rejected', name:'Rejected', color:'fail'},
    {_id: 'approved', name:'Approved', color:'success'}, 
    {_id: 'needWork', name:'Need Work', color:'medium'},
    {_id: 'notRequired', name:'Not Required', color:'medium'},
]
const ApprovalStatus = [
    {_id: 'inReview', name:'In Review', color:'toDo'},
    {_id: 'rejected', name:'Rejected', color:'fail'},
    {_id: 'approved', name:'Approved', color:'success'}, 
    {_id: 'needWork', name:'Need Work', color:'medium'},
    {_id: 'notRequired', name:'Not Required', color:'medium'},
]
const SprintStatus = [
    {_id: 'active', name:'In Review', color:'toDo'},
    {_id: 'delayed', name:'Rejected', color:'fail'},
    {_id: 'completed', name:'Approved', color:'success'}, 
    {_id: 'upcoming', name:'Not Required', color:'medium'},
]
const DynamicFieldsTypes = [
    {_id: 'dropdown', name:'Dropdown'},
    {_id: 'string', name:'String'},
    {_id: 'number', name:'Number'},
    {_id: 'date', name:'Date'},
    {_id: 'status', name:'Status'},
]
const milestoneStatuses = [
    {_id: 'notStarted', name:'Not Started', color:'notStarted'},
    {_id: 'inProgress', name:'In Progress', color:'inProgress'},
    {_id: 'completed', name:'Completed', color:'completed'},
]
const dailyReportTasksStatus = [
    {_id: 'pending', name:'Pending', color:'pending'},
    {_id: 'inProgress', name:'In Progress', color:'inProgress'},
    {_id: 'completed', name:'Completed', color:'completed'},
]
const ProjectType = [
    {_id: 'inhouse', name:'In House', label:'In House'},
    {_id: 'client', name:'Client', label:"Client"},
]
const MilestoneStatus = [
    {_id: 'completed', name:'inhouse', color:'completed'},
    {_id: 'inProgress', name:'inProgress', color:'inProgress'},
    {_id: 'onHold', name:'onHold', color:'onHold'},
    {_id: 'notStared', name:'notStared', color:'notStared'},
]
const TaskStatuses = [
    {_id: 'toDo', name:'TODO', color:'toDo'},
    {_id: 'inProgress', name:'In Progress', color:'inProgress'},
    {_id: 'onHold', name:'On Hold', color:'onHold'},
    {_id: 'blocked', name:'Blocked', color:'blocked'},
    {_id: 'pendingReview', name:'In Review', color:'pendingReview'},
    {_id: 'completed', name:'Completed', color:'completed'},
]
const Priorities = [
    {_id: 'high', name:'High', color:'high'},
    {_id: 'medium', name:'Medium', color:'medium'},
    {_id: 'low', name:'Low', color:'low'},
]
const TicketStatuses = [
    {_id: 'open', name:'Open', color:'open'},
    {_id: 'closed', name:'Closed', color:'closed'},
    {_id: 'inProgress', name:'In Progress', color:'inProgress'},
]
const QuestionsStatuses = [
    {_id: 'answered', name:'Answered', color:'answered'},
    {_id: 'pending', name:'Pending', color:'pending'},
    {_id: 'waiting', name:'Waiting', color:'waiting'},
    {_id: 'notAnswered', name:'Not Answered', color:'notAnswered'},
]
// 'todo','errors', 'missingRequirements', 'clientFeedback', 'feedback'
const AssignedReason = [
    {_id: 'todo', name:'todo'},
    {_id: 'errors', name:'errors'},
    {_id: 'missingRequirements', name:'missingRequirements'},
    {_id: 'clientFeedback', name:'clientFeedback'},
    {_id: 'feedback', name:'feedback'},
]
const AssignedType = [
    {_id: 'initial', name:'initial' },
    {_id: 'rework', name:'rework'},
]

export {SprintStatus, AssignedReason, AssignedType, dailyReportTasksStatus, KickoffStatus, ApprovalStatus, DynamicFieldsTypes, milestoneStatuses, ProjectType, ProjectStatuses, TaskStatuses, Priorities, TicketStatuses, QuestionsStatuses, TaskCategory}
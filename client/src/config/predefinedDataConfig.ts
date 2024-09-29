const ProjectStatuses = [
    {_id: 'notStarted', name:'notStarted'},
    {_id: 'inProgress', name:'inProgress'},
    {_id: 'completed', name:'completed'},
    {_id: 'onHold', name:'onHold'},
    {_id: 'cancelled', name:'cancelled'},
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
    {_id: 'toDo', name:'toDo'},
    {_id: 'inProgress', name:'inProgress'},
    {_id: 'blocked', name:'blocked'},
    {_id: 'pendingReview', name:'pendingReview'},
    {_id: 'completed', name:'completed'},
]
const Priorities = [
    {_id: 'high', name:'high'},
    {_id: 'medium', name:'medium'},
    {_id: 'low', name:'low'},
]
const TicketStatuses = [
    {_id: 'open', name:'open'},
    {_id: 'closed', name:'closed'},
    {_id: 'inProgress', name:'inProgress'},
]
const QuestionsStatuses = [
    {_id: 'answered', name:'answered'},
    {_id: 'pending', name:'pending'},
    {_id: 'waiting', name:'waiting'},
    {_id: 'notAnswered', name:'notAnswered'},
]

export {ProjectType, ProjectStatuses, TaskStatuses, Priorities, TicketStatuses, QuestionsStatuses}
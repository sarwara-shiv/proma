const ProjectStatuses = [
    {_id: 'notStarted', name:'notStarted'},
    {_id: 'inProgress', name:'inProgress'},
    {_id: 'completed', name:'completed'},
    {_id: 'onHold', name:'onHold'},
    {_id: 'cancelled', name:'cancelled'},
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

export {ProjectStatuses, TaskStatuses, Priorities, TicketStatuses, QuestionsStatuses}
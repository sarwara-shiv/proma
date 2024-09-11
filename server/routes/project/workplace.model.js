import mongoose, { Schema } from 'mongoose';

// Dynamic Fields Schema
const DynamicFieldSchema = new Schema({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
});

// Permissions Schema
const PermissionSchema = new Schema({
  person: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  canCreate: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

// Predefined Enums
const predefinedTaskStatuses = ['toDo', 'inProgress', 'completed', 'blocked', 'pendingReview'];
const predefinedPriorities = ['high', 'medium', 'low'];
const predefinedProjectStatuses = ['notStarted', 'inProgress', 'completed', 'onHold', 'cancelled'];

// Task Status Schema
const TaskStatusSchema = new Schema({
  statusName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

// Task Priority Schema
const TaskPrioritySchema = new Schema({
  priorityName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

// Task Schema
const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: predefinedTaskStatuses, default: 'toDo' },
  customStatus: { type: Schema.Types.ObjectId, ref: 'TaskStatus' },
  priority: { type: String, enum: predefinedPriorities, default: 'medium' },
  customPriority: { type: Schema.Types.ObjectId, ref: 'TaskPriority' },
  responsiblePerson: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  otherPersonsInvolved: [{
    person: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    role: { type: String, required: true },
  }],
  customFields: [DynamicFieldSchema],
  subTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  permissions: [PermissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Kickoff Question Schema
const KickoffQuestionSchema = new Schema({
  question: { type: String, required: true },
  askedBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  shouldBeAnsweredBy: {
    type: String,
    enum: ['Person', 'Client', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['answered', 'pending', 'waiting', 'notAnswered'],
    default: 'pending'
  },
  answerDate: { type: Date },
  answer: { type: String },
});

// Kickoff Responsibility Schema
const KickoffResponsibilitySchema = new Schema({
  person: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  work: { type: String, required: true },
  role: { type: String, required: true },
  additionalDetails: { type: String }
});

// Kickoff Schema
const KickoffSchema = new Schema({
  description: { type: String },
  date: { type: Date, required: true },
  customFields: [DynamicFieldSchema],
  questions: [KickoffQuestionSchema],
  projectTimeline: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    keyMilestones: [{
      milestone: { type: String, required: true },
      milestoneDate: { type: Date, required: true },
    }],
  },
  projectGoals: [{ type: String }],
  attendees: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  notes: { type: String },
  actionItems: [{
    item: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    dueDate: { type: Date },
  }],
  responsibilities: [KickoffResponsibilitySchema],
});

// Project Status Schema
const ProjectStatusSchema = new Schema({
  statusName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

// Project Priority Schema
const ProjectPrioritySchema = new Schema({
  priorityName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

// Project Schema
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: predefinedProjectStatuses, default: 'notStarted' },
  customStatus: { type: Schema.Types.ObjectId, ref: 'ProjectStatus' },
  priority: { type: String, enum: predefinedPriorities, default: 'medium' },
  customPriority: { type: Schema.Types.ObjectId, ref: 'ProjectPriority' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  kickoff: KickoffSchema,
  documentation: [{ type: Schema.Types.ObjectId, ref: 'Documentation' }],
  personsInvolved: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  customFields: [DynamicFieldSchema],
  permissions: [PermissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Documentation Schema
const DocumentationSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String, required: true },
  customFields: [DynamicFieldSchema],
  subDocuments: [{ type: Schema.Types.ObjectId, ref: 'Documentation' }],
  permissions: [PermissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create Models
const TaskStatus = mongoose.model('TaskStatus', TaskStatusSchema);
const TaskPriority = mongoose.model('TaskPriority', TaskPrioritySchema);
const ProjectStatus = mongoose.model('ProjectStatus', ProjectStatusSchema);
const ProjectPriority = mongoose.model('ProjectPriority', ProjectPrioritySchema);
const Task = mongoose.model('Task', TaskSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Documentation = mongoose.model('Documentation', DocumentationSchema);

export { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation };

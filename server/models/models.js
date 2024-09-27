import mongoose, { Schema } from 'mongoose';
export * from './userRolesModel.js'
export * from './userGroupModel.js'

const CounterSchema = new Schema({
  _id: { type: String, required: true },  // e.g., 'project', 'task', 'question'
  sequence_value: { type: Number, required: true },
});

// Dynamic Fields Schema
const DynamicFieldSchema = new Schema({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
});

// Ticket Schema
const TicketSchema = new Schema({
  title: { type: String, required: true },
  _cid:{type:String},
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the ticket
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // Tasks associated with the ticket
  status: { type: String, enum: ['open', 'closed'], default: 'open' }, // Ticket status
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }, 
});



// Page-Level Permissions Schema
const PagePermissionSchema = new Schema({
  page: { type: String, required: true },  // Page or Section name
  canCreate: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canView: { type: Boolean, default: false },
});

// Permissions Schema
const PermissionSchema = new Schema({
  person: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  permissions: [PagePermissionSchema],  // Array of permissions for different pages
});

// Predefined Enums
const predefinedTaskStatuses = ['toDo', 'inProgress', 'completed', 'blocked', 'pendingReview'];
const predefinedPriorities = ['high', 'medium', 'low'];
const predefinedProjectStatuses = ['notStarted', 'inProgress', 'completed', 'onHold', 'cancelled'];

// Task Status Schema
const TaskStatusSchema = new Schema({
  statusName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Task Priority Schema
const TaskPrioritySchema = new Schema({
  priorityName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Update Task Schema to reference Ticket
const TaskSchema = new Schema({
  _cid:{type:String},
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: predefinedTaskStatuses, default: 'toDo' },
  customStatus: { type: Schema.Types.ObjectId, ref: 'TaskStatus' },
  priority: { type: String, enum: predefinedPriorities, default: 'medium' },
  customPriority: { type: Schema.Types.ObjectId, ref: 'TaskPriority' },
  responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  otherPersonsInvolved: [
    {
      role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
      persons: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    },
  ],
  customFields: [DynamicFieldSchema],
  subTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  permissions: [PermissionSchema],
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' }, // Reference to the Ticket
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Close ticket when all tasks are completed
TicketSchema.methods.checkCompletion = async function () {
  const ticket = this;
  const tasks = await mongoose.model('Task').find({ _id: { $in: ticket.tasks } });
  const allCompleted = tasks.every(task => task.status === 'completed');

  if (allCompleted) {
    ticket.status = 'closed';
    await ticket.save();
  }
};

// Kickoff Question Schema
const KickoffQuestionSchema = new Schema({
  question: { type: String, required: true },
  askedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  person: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  work: { type: String, required: true },
  role: { type: String, required: true },
  additionalDetails: { type: String }
});

// Kickoff Schema
const KickoffSchema = new Schema({
  _cid:{type:String},
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
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notes: { type: String },
  actionItems: [{
    item: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
  }],
  responsibilities: [KickoffResponsibilitySchema],
});

// Project Status Schema
const ProjectStatusSchema = new Schema({
  statusName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Project Priority Schema
const ProjectPrioritySchema = new Schema({
  priorityName: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Project Schema
const ProjectSchema = new Schema({ 
  _cid:{type:String},
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
  personsInvolved: [
    {
      role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
      persons: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    },
  ],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  customFields: [DynamicFieldSchema],
  permissions: [PermissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Documentation Schema
const DocumentationSchema = new Schema({
  _cid:{type:String},
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String, required: true },
  customFields: [DynamicFieldSchema],
  subDocuments: [{ type: Schema.Types.ObjectId, ref: 'Documentation' }],
  permissions: [PermissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});


// PASSWORD RESET SCHEMA
const PasswordReset = new Schema({
  email:{type:String, required:true, unique:true},
  email:{type:String, required:true, unique:true},
})



// Create Models
const TaskStatus = mongoose.model('TaskStatus', TaskStatusSchema);
const TaskPriority = mongoose.model('TaskPriority', TaskPrioritySchema);
const ProjectStatus = mongoose.model('ProjectStatus', ProjectStatusSchema);
const ProjectPriority = mongoose.model('ProjectPriority', ProjectPrioritySchema);
const Task = mongoose.model('Task', TaskSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Documentation = mongoose.model('Documentation', DocumentationSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Counter = mongoose.model('Counter', CounterSchema);



export { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, Ticket, Counter };

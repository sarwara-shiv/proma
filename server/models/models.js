import mongoose, { Schema } from 'mongoose';
export * from './userRolesModel.js'
export * from './userGroupModel.js'
export * from './chatModel.js'


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
const predefinedTaskStatuses = ['toDo', 'inProgress', 'completed', 'onHold','blocked', 'pendingReview'];
const taskAssignReasons = ['todo','errors', 'missingRequirements', 'clientFeedback', 'feedback'];
const predefinedPriorities = ['high', 'medium', 'low'];
const predefinedProjectStatuses = ['notStarted', 'inProgress', 'completed', 'onHold', 'cancelled'];

const CounterSchema = new Schema({
  _id: { type: String, required: true },  // e.g., 'project', 'task', 'question'
  sequence_value: { type: Number, required: true },
});

const ChangeLogSchema = new Schema({
  collectionName: { type: String, required: true },  // Name of the collection (e.g., 'tasks', 'users')
  documentId: { type: Schema.Types.ObjectId, required: true },  // The ID of the document that was changed
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Who made the change
  changedAt: { type: Date, default: Date.now },  // Timestamp of the change
  changes: [
    {
      field: { type: String, required: true },  // Field that was changed
      oldValue: { type: Schema.Types.Mixed },  // Old value
      newValue: { type: Schema.Types.Mixed },  // New value
    }
  ]
}, { collection: 'change_logs' });


// Dynamic Fields Schema
const DynamicFieldSchema = new Schema({
  key: { type: String, required: true },
  type:{type:String, enum:['dropdown', 'status', 'string', 'number', 'date'], default:'string'},
  value: { type: Schema.Types.Mixed},
  selectedValue: { type: Schema.Types.Mixed},
}, { _id: false });

const DefaultFieldColors = new Schema({
  field:{ type: String, required: true },
  color:{ type: String, required: true }
}, { _id: false });

// custom data
const DynamicCustomField = new Schema({
  name: {type:String, required:true},
  value:{type:String}
})

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

// DAILY REPORT SCHEMA
const DailyReportSchema = new Schema({
  _cid: { type: String }, 
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User for whom the report is
  totalDuration: { type: Number, default: 0 }, // Total duration for the day in minutes
  notes: { type: String, default: '' }, // Notes for the daily report
  workLogs: [{ type: Schema.Types.ObjectId, ref: 'WorkLog' }], // Work logs connected to this report
  status: { type: String, enum: ['open', 'closed'], default: 'open' }, // Ticket status
  endDate:{type:Date},
  startDate:{type: Date, default: Date.now, required: true, index: true  },
}, { timestamps: true });

DailyReportSchema.index({ user: 1, startDate: 1, endDate:1 });  
DailyReportSchema.index({ user: 1, status: -1 });  
DailyReportSchema.index({ user: 1, startDate: 1, status: 1 });

DailyReportSchema.pre('save', function (next) {
  if (this.endDate) {
    this.totalDuration = Math.round((this.endTime - this.createdDate) / (1000 * 60)); // Convert ms to minutes
  }
  next();
});

// WORK LOG SCHEMA
const WorkLogSchema = new Schema({
  _cid: { type: String },
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true }, // Who worked
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, // Project association
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: true }, // Task worked on
  startTime: { type: Date, required: true, default: Date.now  }, // Work start time
  endTime: { type: Date }, // Work end time, null if task still active
  duration: { type: Number }, // Auto-calculated (in minutes)
  notes: { type: String }, // Optional notes for the log
  reason:{type:String, enum:taskAssignReasons, default:'todo'},
  isRework:{type:Boolean, default:false},
  status: { type: String, enum: ['active', 'completed'], default: 'active' }, // Task status
}, { timestamps: true });

WorkLogSchema.index({ user: 1, project: 1, task: 1, startTime: 1 }); // Optimized for task & user queries
WorkLogSchema.index({ project: 1, startTime: 1 }); // Query work logs by project
WorkLogSchema.index({ task: 1, startTime: 1 }); // Query work logs by task
WorkLogSchema.index({ user: 1, startTime: 1 }); // Track daily/weekly work by user
WorkLogSchema.index({ user: 1, status: 1 }); // Track daily/weekly work by user

WorkLogSchema.pre('save', function (next) {
  if (this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert ms to minutes
  }
  next();
});





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
const NoteSchema = new Schema({
  text: { type: String, required: true},
  createdAt: { type: Date},
});


const testCaseSchema = new Schema({
  title: { type: String, required: true },  // Name of the test case
  description: { type: String },            // Details of the test case
  status: { type: String, enum: ['pending', 'passed', 'failed'], required: true },  // Status of the test case
  runDate: { type: Date, default: Date.now },  // Date the test case was run
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },  // User who executed the test case
  customFields: { type: Map, of: Schema.Types.Mixed }  // Custom fields as key-value pairs
});

const bugSchema = new Schema({
  description: { type: String, required: true },  // Description of the bug
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },  // Severity level of the bug
  status: { type: String, enum: ['open', 'in progress', 'closed'], required: true },  // Current status of the bug
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },  // User who reported the bug
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },  // User assigned to fix the bug
  createdAt: { type: Date, default: Date.now },  // Bug creation timestamp
  updatedAt: { type: Date, default: Date.now },  // Last update timestamp
  customFields: { type: Map, of: Schema.Types.Mixed }  // Custom fields for bugs as key-value pairs
});

const TasksColWidth = new Schema({
  _tid:{type: Schema.Types.ObjectId},  
  width:[
    {
      index: { type: Number, required:true},
      width: { type: Number, required:true},
    },
  ]
})



// Update Task Schema to reference Ticket
// const TaskSchema = new Schema({
//   _cid:{type:String},
//   _pid: { type: Schema.Types.ObjectId, ref: 'Project', required: true },  // Project this QA task belongs to
//   title: { type: String, required: true },
//   description: { type: String },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   sortOrder: { type: Number},
//   status: { type: String, enum: predefinedTaskStatuses, default: 'toDo' },
//   customStatus: { type: Schema.Types.ObjectId, ref: 'TaskStatus' },
//   priority: { type: String, enum: predefinedPriorities, default: 'medium' },
//   customPriority: { type: Schema.Types.ObjectId, ref: 'TaskPriority' },
//   responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   otherPersonsInvolved: [
//     {
//       role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
//       persons: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
//     },
//   ],
//   customFields: [DynamicFieldSchema],
//   subTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
//   permissions: [PermissionSchema],
//   ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' }, // Reference to the Ticket
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

const BaseTaskSchema = new Schema({
  _cid: { type: String }, // task id
  _mid: { type: Schema.Types.ObjectId, ref: 'MainTask', required: true },  // Main Task this task belongs to
  name: { type: String, required: true },
  startDate: { type: Date },
  dueDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: { type: String },
  note: { type: String },
  level:{ type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sortOrder: { type: Number },
  priority: { type: String, enum: predefinedPriorities, default: 'low' },
  customPriority: { type: Schema.Types.ObjectId, ref: 'TaskPriority' },  // Custom priority reference
  status: { type: String, enum: predefinedTaskStatuses, default: 'toDo' },
  assignNote: { type: String},
  difficultyLevel: { type: Number, enum:['easy','medium','hight'], default:'medium'},
  customStatus: { type: Schema.Types.ObjectId, ref: 'TaskStatus' },  // Custom status reference
  responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User'},
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User'},
  isRework:{type:Boolean, default:false},
  assignedDate: { type: Date, default: Date.now  },
  reason:{type:String, enum:taskAssignReasons,default:'todo'},
  revisions:[{
    assignedBy:{ type: Schema.Types.ObjectId, ref: 'User'},
    reason:{type:String, enum:taskAssignReasons,default:'todo'},
    timestamp:{type:Date, default:Date.now}
  }],
  customFields: [DynamicFieldSchema],  // Custom fields array
  defaultFieldColors: [DefaultFieldColors],
  subtasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],  // Subtasks reference to tasks
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },  // Reference to the Ticket
  permissions: [PermissionSchema],  // Permissions for task
}, {
  discriminatorKey: 'taskType',  // Discriminator key for different task types
  collection: 'tasks',  // Collection name
  timestamps: true  // Automatically update createdAt and updatedAt fields
});

BaseTaskSchema.pre('save', function (next) {
  if (this.isModified('responsiblePerson')) {
    this.assignedDate = new Date();
  }
  next();
});

// QA Task Schema extending BaseTaskSchema
const QaTaskSchema = BaseTaskSchema.discriminator('QaTask', new Schema({
  testCases: [testCaseSchema],  // Array of test cases
  bugs: [bugSchema],  // Array of reported bugs
}, { _id: false }));

// Task Schema for normal tasks
const TaskSchema = BaseTaskSchema.discriminator('Task', new Schema({
  otherPersonsInvolved: [
        {
          role: { type: Schema.Types.ObjectId, ref: 'UserGroups', required: true },
          persons: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        },
      ],
}, { _id: false }));

const MainTaskSchema = new Schema({
  _pid:{type:String, required:true, ref:'Project'}, // Project ObjectId
  name:{type:String, required:true},
  category:{type:String, required:true}, 
  startDate: { type: Date},
  dueDate: { type: Date},
  endDate: { type: Date},
  responsiblePerson:{type:Schema.Types.ObjectId, ref:'User', required:true},
  note:[NoteSchema],
  subtasks:[{type:Schema.Types.ObjectId, ref: 'Task' }],
  sortOrder:{type:Number},
  customFields: [DynamicFieldSchema],
  status: {
    type: String,
    enum: ['toDo', 'inProgress', 'completed', 'blocked', 'pendingReview'],
    default: 'toDo'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User'},
  assignedDate: { type: Date, default: Date.now  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

MainTaskSchema.pre('save', function (next) {
  if (this.isModified('responsiblePerson')) {
    this.assignedDate = new Date();
  }
  next();
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
  askedDate:{type:Date},
  answerDate: { type: Date },
  answer: { type: String },
});

// Kickoff Responsibility Schema
const KickoffResponsibilitySchema2 = new Schema({
  person: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  work: { type: String, required: true },
  role: { type: String, required: true },
  additionalDetails: { type: String }
});
const KickoffResponsibilitySchema = new Schema({
    details:{type:String},
    work:{type:String},
    role: { type: Schema.Types.ObjectId, ref: 'UserGroups', required: true },
    persons: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
});

// Kickoff Schema
const KickoffSchema = new Schema({
  _cid:{type:String},
  context: { type: String },
  customFields: [DynamicFieldSchema],
  questions: [KickoffQuestionSchema],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  milestones: [{
    name: { type: String, required: true },
    description: { type: String},
    dueDate: { type: Date, required: true }, 
    status: { type: String, 
      enum: ['completed', 'inProgress', 'onHold', 'notStarted'],
      default:'notStarted'
    },
  }],
  goals: [{ type: String }],
  keyDeliverables: [{ type: String }],
  inScope: [{ type: String }],
  outOfScope: [{ type: String }],
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notes: [NoteSchema],
  actionItems: [{
    item: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
  }],
  mainTasks:[{ type: Schema.Types.ObjectId, ref: 'MainTask' }],
  responsibilities: [KickoffResponsibilitySchema],
  status: {
    type: String,
    enum: ['notRequired', 'inReview', 'rejected', 'approved', 'needWork'],
    default: 'inReview'
  },
  approval:[{
    user:{ type: Schema.Types.ObjectId, ref: 'User' },
    note:{ type: String },
    status:{ type: String,
      enum: ['notRequired', 'inReview', 'rejected', 'approved', 'needWork'],
      default: 'inReview'}
  }]

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
  client:{type: Schema.Types.ObjectId, ref: 'User',required:false}, 
  endDate: { type: Date },
  projectType:{type: String, enum:['client', 'inhouse'] , default: 'client'},
  kickoff: KickoffSchema,
  documentation: [{ type: Schema.Types.ObjectId, ref: 'Documentation' }],
  personsInvolved: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  ],
  teamMembers: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  mainTasks:[{ type: Schema.Types.ObjectId, ref: 'MainTask' }],
  customFields: [DynamicCustomField],
  permissions: [PermissionSchema],
  userGroup:[{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Documentation Schema
const DocumentationSchema = new Schema({
  _cid:{type:String},
  _pid:{type:String},
  name: { type: String, required: true },
  level:{ type: Number},
  description: { type: String },
  customFields: [DynamicCustomField],
  subDocuments: [{ type: Schema.Types.ObjectId, ref: 'Documentation' }],
  privacy: {type: String, enum:['public', 'private'] , default: 'private'},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});
// Documentation Schema
const ProjectContent = new Schema({
  _cid:{type:String},
  _pid:{type:String},
  name: { type: String, required: true },
  level:{ type: Number},
  description: { type: String },
  customFields: [DynamicCustomField],
  subDocuments: [{ type: Schema.Types.ObjectId, ref: 'ProjectContent' }],
  privacy: {type: String, enum:['public', 'private'] , default: 'private'},
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
const QaTask = mongoose.models.QaTask || mongoose.model('QaTask', QaTaskSchema);  // QA Task model
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);  // General Task model

const MainTask = mongoose.model('MainTask', MainTaskSchema);  // Main Task model
const Project = mongoose.model('Project', ProjectSchema);
const Documentation = mongoose.model('Documentation', DocumentationSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Counter = mongoose.model('Counter', CounterSchema);
const ChangeLog = mongoose.model('ChangeLog', ChangeLogSchema);
const DailyReport = mongoose.model('DailyReport', DailyReportSchema); 
const WorkLog = mongoose.model('WorkLog', WorkLogSchema);



export { WorkLog,DailyReport, ChangeLog, QaTask, MainTask, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, Ticket, Counter };

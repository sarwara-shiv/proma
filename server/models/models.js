import mongoose, { Schema } from 'mongoose';
import { calculateWorkingHours, addWorkingHours } from '../utils/DateUtil.js';
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
const predefinedTaskStatuses = ['toDo', 'inProgress', 'completed', 'onHold','blocked', 'pendingReview', 'approved'];
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
  _cid: { type: String }, // Unique Ticket ID
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'inProgress', 'resolved', 'closed'], default: 'open' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }, // Assigned person (can be null if unassigned)
  createdDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  comments: [{
    commentBy: { type: Schema.Types.ObjectId, ref: 'User' },
    commentText: { type: String },
    commentDate: { type: Date, default: Date.now },
  }],
}, { timestamps: true });


// Close ticket when all tasks are completed
TicketSchema.methods.checkCompletion = async function () { 
  const ticket = this;

  try {
    // Fetch all tasks linked to this ticket
    const tasks = await mongoose.model('Task').find({ ticket: ticket._id });

    // Check if all tasks have been completed
    const allCompleted = tasks.every(task => task.status === 'completed');

    if (allCompleted) {
      // If all tasks are completed, close the ticket
      ticket.status = 'closed';
      await ticket.save();
      console.log('Ticket status updated to closed');
    } else {
      console.log('Not all tasks are completed yet');
    }
  } catch (err) {
    console.error('Error while checking ticket completion:', err);
  }
};

const PausedIntervalSchema = new Schema({
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: false,
  },
},{ _id: false });

// DAILY REPORT SCHEMA
const DailyReportSchema = new Schema({
  _cid: { type: String }, 
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User for whom the report is
  totalDuration: { type: Number, default: 0 }, // Total duration for the day in minutes
  notes: { type: String, default: '' }, // Notes for the daily report
  workLogs: [{ type: Schema.Types.ObjectId, ref: 'WorkLog' }], // Work logs connected to this report
  status: { type: String, enum: ['open', 'closed', 'paused'], default: 'open' }, // Ticket status
  paused:[PausedIntervalSchema],
  endDate:{type:Date},
  startDate:{type: Date, default: Date.now, required: true, index: true  },
}, { timestamps: true });

DailyReportSchema.index({ user: 1, startDate: 1, endDate:1 });  
DailyReportSchema.index({ user: 1, status: -1 });  
DailyReportSchema.index({ user: 1, startDate: 1, status: 1 });

DailyReportSchema.pre('save', function (next) {
  if (this.endDate) {
    // Calculate total time from start to end (in ms)
    const totalTimeMs = new Date(this.endDate).getTime() - new Date(this.startDate).getTime();

    // Calculate total paused time (in ms)
    const totalPausedTimeMs = this.paused.reduce((acc, pausedInterval) => {
      const start = new Date(pausedInterval.startTime).getTime();
      const end = pausedInterval.endTime ? new Date(pausedInterval.endTime).getTime() : Date.now(); // Use current time if endTime is not set
      return acc + (end - start);
    }, 0);

    // Subtract paused time from total time and convert to minutes
    this.totalDuration = Math.round((totalTimeMs - totalPausedTimeMs) / (1000 * 60));
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

/**
 * 
 * STORY POINTS MEANING
 * 1. XS  - Very trivial task (like text change etc)
 * 2. S   - Easy Task 
 * 3. M   - Requires some thought, may be one component in api
 * 5. L   - Multi step Task
 * 8. XL  - Complex Task, new fetures, integration with multiple systems
 * 13 XXL - Too big, should be broken down into smaller tasks or stories
 * 
 */

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
  expectedTime: {type:Number, default:0},
  note: { type: String },
  level:{ type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sortOrder: { type: Number },
  priority: { type: String, enum: predefinedPriorities, default: 'low' },
  customPriority: { type: Schema.Types.ObjectId, ref: 'TaskPriority' },  // Custom priority reference
  status: { type: String, enum: predefinedTaskStatuses, default: 'toDo' },
  assignNote: { type: String},
  difficultyLevel: { type: String, enum:['easy','medium','high'], default:'medium'}, // not in use
  sprintId:{type:String, ref:'Sprint'},
  storyPoints:{type:Number, enum:[1,2,3,5,8,13], default:2}, // 
  customStatus: { type: Schema.Types.ObjectId, ref: 'TaskStatus' },  // Custom status reference
  responsiblePerson: { type: Schema.Types.ObjectId, ref: 'User'},
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User'},
  isRework:{type:Boolean, default:false},
  assignedDate: { type: Date, default: Date.now  },
  reason:{type:String, enum:taskAssignReasons,default:'todo'},
  requiresApproval: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', null], default: null },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  dependencies:[{tasks:{type:String, ref:'Task'}}],
  approvedAt: { type: Date },
  approver: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectedReason: { type: String },
  observers:[{ type: Schema.Types.ObjectId, ref: 'User'}],
  approvals: [{
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approved: { type: Boolean },
    reviewedAt: { type: Date, default: Date.now },
    comment: { type: String },
  }],
  revisions:[{
    assignedBy:{ type: Schema.Types.ObjectId, ref: 'User'},
    reason:{type:String, enum:taskAssignReasons,default:'todo'},
    timestamp:{type:Date, default:Date.now}
  }],
  sprintHistory:[{
    sprintId:{type:String, ref:'Sprint'},
    assignedOn:{type:Date},
    removedOn:{type:Date},
    statusAtRemoval:{type:String, enum: predefinedTaskStatuses,}
  }],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task', // Reference to the dependent task(s)
    required: false
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
  if (this.isModified('approvalStatus')) {
    // If client approval status is updated
    const isApproved = this.approvalStatus === 'approved';
    const isRejected = this.approvalStatus === 'rejected';

    // Check if status has changed to "approved" or "rejected"
    if (isApproved || isRejected) {
      // Add an approval or rejection entry to the clientApprovals array
      this.approvals.push({
        reviewedBy: this.clientApprovedBy, // the user who reviewed it
        approved: isApproved, // boolean indicating approval or rejection
        reviewedAt: new Date(), // the date of review
        comment: this.rejectedReason || '', // rejection reason or an empty string if approved
      });

      // Set the approval/rejection details
      if (isApproved) {
        this.clientApprovedAt = new Date(); // Set approval date
      } else if (isRejected) {
        this.clientApprovedAt = null; // Clear approval date if rejected
      }
    }
  }
  // Set default approver if approval is required but no approver is set
  if (this.requiresApproval && !this.approver) {
    try {
      if (this.assignedBy) {
        this.approver = this.assignedBy;
      } else {
        this.approver = this.createdBy;
      }
    } catch (err) {
      return next(err);
    }
  }

  next();
});

BaseTaskSchema.pre('save', function (next) {
  // Auto-calculate expectedTime if missing
  if (this.expectedTime === 0 && this.startDate && this.dueDate) {
    this.expectedTime = calculateWorkingHours(this.startDate, this.dueDate);
  }

  // Auto-calculate dueDate if missing and expectedTime is given
  if (!this.dueDate && this.startDate && this.expectedTime > 0) {
    this.dueDate = addWorkingHours(this.startDate, this.expectedTime);
  }

  this.updatedAt = new Date();
  next();
});

BaseTaskSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (!docToUpdate) return next();

  // Pull from update if set, else fall back to existing doc
  const startDate = update.startDate
    ? new Date(update.startDate)
    : docToUpdate.startDate;
  const dueDate = update.dueDate
    ? new Date(update.dueDate)
    : docToUpdate.dueDate;
  const expectedTime =
    update.expectedTime !== undefined
      ? update.expectedTime
      : docToUpdate.expectedTime;

  // If expectedTime is missing or 0 but both dates are present, calculate it
  if ((!expectedTime || expectedTime === 0) && startDate && dueDate) {
    update.expectedTime = calculateWorkingHours(startDate, dueDate);
    console.log('-------------', calculateWorkingHours(startDate, dueDate));
  }

  // If dueDate is missing but startDate and expectedTime exist, calculate it
  if ((!dueDate || update.dueDate === null) && startDate && expectedTime > 0) {
    update.dueDate = addWorkingHours(startDate, expectedTime);
  }

  update.updatedAt = new Date();
  this.setUpdate(update);
  next();
});


BaseTaskSchema.methods.canStartTask = async function () {
  if (this.dependencies && this.dependencies.length > 0) {
    // Check if all dependent tasks are completed
    const dependenciesCompleted = await Task.find({ 
      _id: { $in: this.dependencies },
      status: { $in: ['completed', 'approved'] } // Adjust based on your task status
    });

    if (dependenciesCompleted.length !== this.dependencies.length) {
      return false; // Not all dependencies are completed
    }
  }
  return true; // No dependencies, or all dependencies are completed
};

/**
 * DEMO UPDATE TASK USE METHOD
 * 
 */
// async function updateTaskStatus(taskId, newStatus) {
//   const task = await Task.findById(taskId);

//   if (task && await task.canStartTask()) {
//     task.status = newStatus;
//     await task.save();
//   } else {
//     throw new Error('Cannot start task. Dependencies not completed.');
//   }
// }

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
  _pid:{type:String, ref:'Project'}, // Project ObjectId
  name:{type:String, required:true},
  milestone:{type:Schema.Types.ObjectId, required:false},
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
    enum: ['draft','toDo', 'inProgress', 'completed', 'blocked', 'pendingReview'],
    default: 'toDo'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User'},
  assignedDate: { type: Date, default: Date.now  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
   // Client approval fields
   clientApprovalRequired: { type: Boolean, default: false },
   clientApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected', null], default: null },
   clientApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
   clientApprovedAt: { type: Date },
   clientRejectedReason: { type: String },
   clientApprovals: [{
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approved: { type: Boolean },
    reviewedAt: { type: Date, default: Date.now },
    comment: { type: String },
  }],
})

MainTaskSchema.pre('save', function (next) {
  if (this.isModified('responsiblePerson')) {
    this.assignedDate = new Date();
  }
  if (this.isModified('clientApprovalStatus')) {
    // If client approval status is updated
    const isApproved = this.clientApprovalStatus === 'approved';
    const isRejected = this.clientApprovalStatus === 'rejected';

    // Check if status has changed to "approved" or "rejected"
    if (isApproved || isRejected) {
      // Add an approval or rejection entry to the clientApprovals array
      this.clientApprovals.push({
        reviewedBy: this.clientApprovedBy, // the user who reviewed it
        approved: isApproved, // boolean indicating approval or rejection
        reviewedAt: new Date(), // the date of review
        comment: this.clientRejectedReason || '', // rejection reason or an empty string if approved
      });

      // Set the approval/rejection details
      if (isApproved) {
        this.clientApprovedAt = new Date(); // Set approval date
      } else if (isRejected) {
        this.clientApprovedAt = null; // Clear approval date if rejected
      }
    }
  }
  next();
});



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

// TASK TEMPLATES
const TaskTemplateSchema = new Schema({
  _cid:{type:String},
  name: { type: String, required: true }, // Task name
  description: { type: String },          // Task description
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, // Task priority
  difficultyLevel: { type: String, enum: ['easy', 'medium', 'high'], default: 'medium' },
  storyPoints: { type: Number, enum: [1, 2, 3, 5, 8, 13], default: 1 }, // Story point for tasks
  status: { type: String, enum: ['toDo', 'inProgress', 'completed', 'blocked'], default: 'toDo' }, // Task status
  type: { type: String, enum: ['mainTask', 'task', 'subtask', 'qaTask'], required: true }, // Define type of task
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'task_templates',
  timestamps: true
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
  dueDate: { type: Date },
  expectedTime: {type:Number, default:0},
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

ProjectSchema.pre('save', function (next) {
  // Auto-calculate expectedTime if missing
  if (this.expectedTime === 0 && this.startDate && this.dueDate) {
    this.expectedTime = calculateWorkingHours(this.startDate, this.dueDate);
  }

  // Auto-calculate dueDate if missing and expectedTime is given
  if (!this.dueDate && this.startDate && this.expectedTime > 0) {
    this.dueDate = addWorkingHours(this.startDate, this.expectedTime);
  }

  this.updatedAt = new Date();
  next();
});

ProjectSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (!docToUpdate) return next();

  // Pull from update if set, else fall back to existing doc
  const startDate = update.startDate
    ? new Date(update.startDate)
    : docToUpdate.startDate;
  const dueDate = update.dueDate
    ? new Date(update.dueDate)
    : docToUpdate.dueDate;
  const expectedTime =
    update.expectedTime !== undefined
      ? update.expectedTime
      : docToUpdate.expectedTime;

  // If expectedTime is missing or 0 but both dates are present, calculate it
  if ((!expectedTime || expectedTime === 0) && startDate && dueDate) {
    update.expectedTime = calculateWorkingHours(startDate, dueDate);
  }

  // If dueDate is missing but startDate and expectedTime exist, calculate it
  if ((!dueDate || update.dueDate === null) && startDate && expectedTime > 0) {
    update.dueDate = addWorkingHours(startDate, expectedTime);
  }

  update.updatedAt = new Date();
  this.setUpdate(update);
  next();
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

// SPRINT SCHEMA
const SprintSchema = new Schema({
  _cid: { type: String }, // Sprint ID
  _pid: { type: String, required: true, ref: 'Project' }, // Project ID the sprint is tied to
  name: { type: String, required: true, unique:true },
  goal: { type: String }, // Sprint Goal (Objective)
  startDate: { type: Date, required: true },
  expectedTime:{type:Number, default:0},
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }, // If sprint is active or finished
  status:{type:String, enum:['active', 'completed', 'delayed', 'upcoming'], default:'upcoming'},
  createdBy: { type: String, required: true }, // Creator (could be a manager, product owner, etc.)
  totalStoryPoints: { type: Number, default: 0 },
  completedStoryPoints: { type: Number, default: 0 },
   burnDown: [{
    date: { type: Date },
    remainingPoints: { type: Number }
  }],
  backlog: [{type: Schema.Types.ObjectId, ref: 'Task' }], // List of tasks assigned to the sprint,
  velocity: { type: Number, default: 0 },
  sprintRetrospective: {
    date: { type: Date },
    feedback: { type: String },
    improvements: { type: String },
    actionItems: [{ type: String }]
  },
  history: [{
    changeType: String, // e.g., 'reopened', 'extended', 'closed'
    timestamp: Date,
    changedBy: String,
    reason: String // Optional reason for the change
  }],
  notes: [{ type: String }],    
}, {
  timestamps: true, // Automatically track createdAt/updatedAt
});

SprintSchema.pre('save', async function(next) {
  if (this.isModified('backlog') || this.isNew) {
    // Fetch all tasks in the backlog and calculate totalStoryPoints and completedStoryPoints
    const tasks = await Task.find({ _id: { $in: this.backlog } });

    // Calculate total and completed story points
    this.totalStoryPoints = tasks.reduce((total, task) => total + task.storyPoints ? task.storyPoints : 1, 0);
    this.completedStoryPoints = tasks.filter(task => task.status === 'completed')
                                     .reduce((total, task) => total + task.storyPoints ? task.storyPoints : 1, 0);
  }

  next();
});

SprintSchema.pre('save', async function(next) {
  if (this.isModified('completedStoryPoints') || this.isNew) {
    this.velocity = this.completedStoryPoints; // You can change this logic based on your needs
  }

  next();
});

SprintSchema.pre('save', async function(next) {
  if (this.isModified('backlog') || this.isNew) {
    const tasks = await Task.find({ _id: { $in: this.backlog } });

    // Calculate remaining points
    const remainingPoints = tasks.filter(task => task.status !== 'completed')
                                  .reduce((total, task) => total + task.storyPoints ? task.storyPoints : 1, 0);

    // Add the current remaining points to the burnDown chart
    this.burnDown.push({
      date: new Date(),
      remainingPoints: remainingPoints
    });
  }

  next();
});

SprintSchema.pre('save', function (next) {
  // Auto-calculate expectedTime if missing
  if (this.expectedTime === 0 && this.startDate && this.dueDate) {
    this.expectedTime = calculateWorkingHours(this.startDate, this.dueDate);
  }

  // Auto-calculate dueDate if missing and expectedTime is given
  if (!this.dueDate && this.startDate && this.expectedTime > 0) {
    this.dueDate = addWorkingHours(this.startDate, this.expectedTime);
  }

  this.updatedAt = new Date();
  next();
});

SprintSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const docToUpdate = await this.model.findOne(this.getQuery());

  if (!docToUpdate) return next();

  // Pull from update if set, else fall back to existing doc
  const startDate = update.startDate
    ? new Date(update.startDate)
    : docToUpdate.startDate;
  const dueDate = update.dueDate
    ? new Date(update.dueDate)
    : docToUpdate.dueDate;
  const expectedTime =
    update.expectedTime !== undefined
      ? update.expectedTime
      : docToUpdate.expectedTime;

  // If expectedTime is missing or 0 but both dates are present, calculate it
  if ((!expectedTime || expectedTime === 0) && startDate && dueDate) {
    update.expectedTime = calculateWorkingHours(startDate, dueDate);
    console.log('-------------', calculateWorkingHours(startDate, dueDate));
  }

  // If dueDate is missing but startDate and expectedTime exist, calculate it
  if ((!dueDate || update.dueDate === null) && startDate && expectedTime > 0) {
    update.dueDate = addWorkingHours(startDate, expectedTime);
  }

  update.updatedAt = new Date();
  this.setUpdate(update);
  next();
});


// Create Models
const TaskStatus = mongoose.model('TaskStatus', TaskStatusSchema);
const TaskPriority = mongoose.model('TaskPriority', TaskPrioritySchema);
const ProjectStatus = mongoose.model('ProjectStatus', ProjectStatusSchema);
const ProjectPriority = mongoose.model('ProjectPriority', ProjectPrioritySchema);
const QaTask = mongoose.models.QaTask || mongoose.model('QaTask', QaTaskSchema);  // QA Task model
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);  // General Task model

const Sprint = mongoose.model('Sprint', SprintSchema);  // SPRINT
const TaskTemplate = mongoose.model('TaskTemplate', TaskTemplateSchema);  
const MainTask = mongoose.model('MainTask', MainTaskSchema);  // Main Task model
const Project = mongoose.model('Project', ProjectSchema);
const Documentation = mongoose.model('Documentation', DocumentationSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Counter = mongoose.model('Counter', CounterSchema);
const ChangeLog = mongoose.model('ChangeLog', ChangeLogSchema);
const DailyReport = mongoose.model('DailyReport', DailyReportSchema); 
const WorkLog = mongoose.model('WorkLog', WorkLogSchema);



export { WorkLog,DailyReport, TaskTemplate, ChangeLog, QaTask, Sprint, MainTask, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, Ticket, Counter };

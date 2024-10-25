import { ReactNode } from "react";
import { ObjectId } from 'mongodb';
import Kickoff from "@/pages/common/kickoff/Kickoff";

export interface RelatedUpdates{
  collection:string;
  field:string;
  type:'array' | 'string',
  value?:string | ObjectId 
  ids?:(string | ObjectId)[]
}
export interface DeleteRelated{
  collection:string;
  ids?:(string | ObjectId)[]
}


export interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}
// Dynamic Fields Interface
export interface DynamicField {
    key: string;
    type?:'dropdown' |'string'|'number'|'date' | 'status';
    value?:any;
    selectedValue?: any; // Since `Schema.Types.Mixed` can accept any type
  }

  export interface DynamicCustomField{
    name?:string,
    value?:string
  }
  
  export interface PermissionsMap {
    [page: string]: PagePermission;
}
  
  // Page-Level Permissions Interface
  export interface PagePermission {
    page: string;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  }
  
  // Permissions Interface
  export interface Permission {
    person: string; // Refers to User objectId
    permissions: PagePermission[];
  }
  
  // Task Status Interface
  export interface TaskStatus {
    statusName: string;
    createdBy: string; // Refers to User objectId
  }
  
  // Task Priority Interface
  export interface TaskPriority {
    priorityName: string;
    createdBy: string; // Refers to User objectId
  }
  
  // Other Persons Involved in Task
  export interface PersonsInvolved {
    role: ObjectId; // Reference to user groups
    persons?: ObjectId[]; // Array of User references
}



export interface BaseTask {
  _id?:string;
  _cid?: string;  // Optional Client or Company ID
  _mid: ObjectId;  // Main task id
  name: string;
  startDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  assignedDate?:Date;
  createdAt?: Date;
  updatedAt?: Date;
  level?:number;
  description?: string;
  note?: string;
  createdBy: ObjectId;  // User reference
  sortOrder?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Assuming these are your predefined priorities
  customPriority?:ObjectId;  // Custom priority reference
  status: 'toDo' | 'inProgress' | 'done' | 'onHold' | 'inReview' | 'blocked';  // Assuming these are your predefined statuses
  customStatus?: ObjectId;  // Custom status reference
  responsiblePerson: ObjectId;  // User reference
  customFields: DynamicField[];  // Array of custom fields
  subtasks: ObjectId[];  // Array of references to subtasks (Tasks)
  ticket?: ObjectId;  // Reference to Ticket
  permissions: Permission[];  // Array of permissions
  defaultFieldColors?:{field:String, color:String}[]
}

export interface TestCase {
  testCaseId: string;
  description: string;
  result: 'pass' | 'fail';  // Assuming test case result types
}

export interface Bug {
  bugId: string;
  description: string;
  status: 'open' | 'closed' | 'inProgress';  // Assuming bug status types
}

export interface QaTask extends BaseTask {
  testCases: TestCase[];  // Array of test cases
  bugs: Bug[];  // Array of bugs
}

  
  // Task Interface
  export interface Task extends BaseTask {
    otherPersonsInvolved: PersonsInvolved[];
  }
  
  // export interface Task {
  //   _id?:ObjectId;
  //   _cid?:string;
  //   title: string;
  //   description?: string;
  //   createdBy: string; // Refers to User objectId
  //   startDate: Date;
  //   endDate: Date;
  //   sortOrder?:number;
  //   status: 'toDo' | 'inProgress' | 'completed' | 'blocked' | 'pendingReview';
  //   customStatus?: string; // Refers to TaskStatus objectId
  //   priority: 'high' | 'medium' | 'low';
  //   customPriority?: string; // Refers to TaskPriority objectId
  //   responsiblePerson: string; // Refers to User objectId
  //   otherPersonsInvolved: PersonsInvolved[];
  //   customFields: DynamicField[];
  //   subTasks: string[]; // Array of Task objectIds
  //   permissions?: Permission[];
  //   createdAt?: Date;
  //   updatedAt?: Date;
  // }
  
  // Kickoff Question Interface
  export interface KickoffQuestion {
    question: string;
    _cid?:string;
    askedBy: string; // Refers to User objectId
    shouldBeAnsweredBy: 'Person' | 'Client' | 'Other';
    status: 'answered' | 'pending' | 'waiting' | 'notAnswered';
    answerDate?: Date;
    askedDate?: Date;
    answer?: string;
  }
  
  // Kickoff Responsibility Interface
  export interface KickoffResponsibility2 {
    person: string; // Refers to User objectId
    work: string;
    role: string;
    additionalDetails?: string;
  }
  export interface KickoffResponsibility {
    persons?: ObjectId[];
    work?: string;
    role: ObjectId;
    details?: string;
  }


  export interface NoteSchema {
    text: string;
    createdAt:Date;
  };

  export interface MainTask{
    _id?:ObjectId;
    _pid:string;
    name:string;
    category:string;
    startDate?:Date | null;
    dueDate?:Date | null;
    endDate?:Date | null;
    responsiblePerson:ObjectId | null;
    note?:NoteSchema[];
    sortOrder?:number;
    customFields?: DynamicField[];
    subtasks?:Task[];
    status: 'toDo' | 'inProgress' | 'completed' | 'onHold' | 'blocked' | 'pendingReview';
    createdBy?:ObjectId,
    createdAt?:Date,
    updatedAt?: Date,
  }

  export interface Milestone{
    name:string,
    dueDate:Date | null,
    description?:string,
    status: 'completed' | 'inProgress' |'onHold' | 'notStarted';
  }
  export interface approval{
    name:string,
    dueDate:Date | null,
    description?:string,
    status: 'completed' | 'inProgress' |'onHold' | 'notStarted';
  }

  export interface KickoffApproval{
    user:string|ObjectId | null, 
    status:'notRequired'|'inReview' | 'rejected' |'approved' | 'needWork', 
    note?:string
  }
  
  // Kickoff Interface
  export interface Kickoff {
    _id?:ObjectId;
    _cid?:string;
    context?: string;
    customFields?: DynamicField[];
    questions?: KickoffQuestion[];
    milestones?: Milestone[];
    startDate?: Date | null;
    endDate?: Date | null;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
    keyDeliverables?: string[];
    attendees?: string[]; // Array of User objectIds
    notes?: NoteSchema[];
    actionItems?: {
      item: string;
      assignedTo: string; // Refers to User objectId
      dueDate?: Date;
    }[];
    status?: 'notRequired' | 'inReview' | 'rejected' |'approved' | 'needWork';
    responsibilities?: KickoffResponsibility[];
    mainTasks?:MainTask[];
    approval?:KickoffApproval[]
  }
  
  // Project Status Interface
  export interface ProjectStatus {
    statusName: string;
    createdBy: string; // Refers to User objectId
  }
  
  // Project Priority Interface
  export interface ProjectPriority {
    priorityName: string;
    createdBy: string; // Refers to User objectId
  }
  
  // Project Interface
  export interface Project {
    _id?:ObjectId;
    _cid?:string;
    name: string;
    description?: string;
    status: 'notStarted' | 'inProgress' | 'completed' | 'onHold' | 'cancelled';
    customStatus?: string; // Refers to ProjectStatus objectId
    priority: 'high' | 'medium' | 'low';
    customPriority?: string; // Refers to ProjectPriority objectId
    startDate: Date;
    endDate?: Date;
    projectType?:'inhouse' | 'client';
    kickoff?: Kickoff;
    documentation?: string[]; // Array of Documentation objectIds
    personsInvolved: (string | ObjectId)[];
    teamMembers?: (string | ObjectId)[];
    tasks: string[]; // Array of Task objectIds
    mainTasks?:ObjectId[];
    customFields?: DynamicCustomField[];
    permissions?: Permission[];
    userGroup?:(string | ObjectId)[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: ObjectId | null 
  }
  
  // Documentation Interface
  export interface Documentation {
    _id?:string;
    _cid?:string;
    _pid?:string;
    name: string;
    level?:number;
    description?: string;
    customFields?: DynamicCustomField[];
    subDocuments?: string[]; // Array of Documentation objectIds
    createdAt?: Date;
    privacy:'private' | 'public';
    updatedAt?: Date;
    createdBy?:(string|ObjectId)
  }
  
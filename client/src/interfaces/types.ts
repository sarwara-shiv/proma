import { ReactNode } from "react";
import { ObjectId } from 'mongodb';
export interface NavItem {
  link: string;
  title: string;
  icon?: ReactNode;
}
// Dynamic Fields Interface
export interface DynamicField {
    key: string;
    value: any; // Since `Schema.Types.Mixed` can accept any type
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
    role: ObjectId; // Reference to Role
    persons?: ObjectId[]; // Array of User references
}
  
  // Task Interface
  export interface Task {
    title: string;
    description?: string;
    createdBy: string; // Refers to User objectId
    startDate: Date;
    endDate: Date;
    status: 'toDo' | 'inProgress' | 'completed' | 'blocked' | 'pendingReview';
    customStatus?: string; // Refers to TaskStatus objectId
    priority: 'high' | 'medium' | 'low';
    customPriority?: string; // Refers to TaskPriority objectId
    responsiblePerson: string; // Refers to User objectId
    otherPersonsInvolved: PersonsInvolved[];
    customFields: DynamicField[];
    subTasks: string[]; // Array of Task objectIds
    permissions: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Kickoff Question Interface
  export interface KickoffQuestion {
    question: string;
    askedBy: string; // Refers to User objectId
    shouldBeAnsweredBy: 'Person' | 'Client' | 'Other';
    status: 'answered' | 'pending' | 'waiting' | 'notAnswered';
    answerDate?: Date;
    answer?: string;
  }
  
  // Kickoff Responsibility Interface
  export interface KickoffResponsibility {
    person: string; // Refers to User objectId
    work: string;
    role: string;
    additionalDetails?: string;
  }
  
  // Kickoff Interface
  export interface Kickoff {
    description?: string;
    date: Date;
    customFields: DynamicField[];
    questions: KickoffQuestion[];
    projectTimeline: {
      startDate: Date;
      endDate: Date;
      keyMilestones: {
        milestone: string;
        milestoneDate: Date;
      }[];
    };
    projectGoals: string[];
    attendees: string[]; // Array of User objectIds
    notes?: string;
    actionItems: {
      item: string;
      assignedTo: string; // Refers to User objectId
      dueDate?: Date;
    }[];
    responsibilities: KickoffResponsibility[];
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
    name: string;
    description: string;
    status: 'notStarted' | 'inProgress' | 'completed' | 'onHold' | 'cancelled';
    customStatus?: string; // Refers to ProjectStatus objectId
    priority: 'high' | 'medium' | 'low';
    customPriority?: string; // Refers to ProjectPriority objectId
    startDate: Date;
    endDate?: Date;
    kickoff?: Kickoff;
    documentation?: string[]; // Array of Documentation objectIds
    personsInvolved: PersonsInvolved[]; // Array of User objectIds
    tasks: string[]; // Array of Task objectIds
    customFields?: DynamicField[];
    permissions?: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Documentation Interface
  export interface Documentation {
    title: string;
    description?: string;
    link: string;
    customFields: DynamicField[];
    subDocuments: string[]; // Array of Documentation objectIds
    permissions: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
  }
  
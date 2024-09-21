import { ObjectId } from 'mongodb';

export interface DynamicField {
    key: string;
    value: any;
}

export interface Ticket {
    title: string;
    description?: string;
    createdBy: ObjectId;
    tasks: ObjectId[];
    status: 'open' | 'closed';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PagePermission {
    page: string;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
    canView?: boolean;
}

export interface Permission {
    person: ObjectId;
    permissions: PagePermission[];
}

export interface TaskStatus {
    statusName: string;
    createdBy: ObjectId;
}

export interface TaskPriority {
    priorityName: string;
    createdBy: ObjectId;
}

export interface OtherPersonInvolved {
    person: ObjectId;
    role: string;
}

export interface Task {
    title: string;
    description?: string;
    createdBy: ObjectId;
    startDate: Date;
    endDate: Date;
    status: 'toDo' | 'inProgress' | 'completed' | 'blocked' | 'pendingReview';
    customStatus?: ObjectId;
    priority: 'high' | 'medium' | 'low';
    customPriority?: ObjectId;
    responsiblePerson: ObjectId;
    otherPersonsInvolved: OtherPersonInvolved[];
    customFields: DynamicField[];
    subTasks: ObjectId[];
    permissions: Permission[];
    ticket?: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface KickoffResponsibility {
    person: ObjectId;
    work: string;
    role: string;
    additionalDetails?: string;
}

export interface ProjectTimeline {
    startDate: Date;
    endDate: Date;
    keyMilestones: {
      milestone: string;
      milestoneDate: Date;
    }[];
}

export interface ActionItem {
    item: string;
    assignedTo: ObjectId;
    dueDate?: Date;
}

interface KickoffQuestion {
    question: string;
    askedBy: ObjectId;
    shouldBeAnsweredBy: 'Person' | 'Client' | 'Other';
    status: 'answered' | 'pending' | 'waiting' | 'notAnswered';
    answerDate?: Date;
    answer?: string;
}

export interface Kickoff {
    description?: string;
    date: Date;
    customFields: DynamicField[];
    questions: KickoffQuestion[];
    projectTimeline: ProjectTimeline;
    projectGoals: string[];
    attendees: ObjectId[];
    notes?: string;
    actionItems: ActionItem[];
    responsibilities: KickoffResponsibility[];
}

export interface ProjectStatus {
    statusName: string;
    createdBy: ObjectId;
}

export interface ProjectPriority {
    priorityName: string;
    createdBy: ObjectId;
}

export interface Project {
    name: string;
    description: string;
    status: 'notStarted' | 'inProgress' | 'completed' | 'onHold' | 'cancelled';
    customStatus?: ObjectId;
    priority: 'high' | 'medium' | 'low';
    customPriority?: ObjectId;
    startDate: Date;
    endDate?: Date;
    kickoff: Kickoff;
    documentation: ObjectId[];
    personsInvolved: ObjectId[];
    tasks: ObjectId[];
    customFields: DynamicField[];
    permissions: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: ObjectId;
}

export interface Documentation {
    title: string;
    description?: string;
    link: string;
    customFields: DynamicField[];
    subDocuments: ObjectId[];
    permissions: Permission[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: ObjectId;
}

export interface PasswordReset {
    email: string;
}
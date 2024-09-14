import {FaUsers, FaUserTie} from 'react-icons/fa';
import { MdOutlineInstallDesktop } from "react-icons/md";
import { IconType } from 'react-icons';
// Define the type for page actions
export type PageAction = 'canView' | 'canCreate' | 'canUpdate' | 'canDelete';

// Define the structure for a single page's permissions
export interface PagePermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// Define the structure for a page configuration
export interface PageConfig {
  name: string;       // Internal name for the page
  displayName: string; // User-friendly name for the page
  actions: PageAction[]; // List of actions available for the page
  root:string;
  access?:string[];
  icon?:IconType;
  
}

// Create an object to hold all your pages' configurations
const PagesConfig: Record<string, PageConfig> = {
  USERS: {
    name: 'users',
    root:"auth",
    displayName: 'Users',
    icon:FaUsers,
    access:['admin', 'manager'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
  },
  USER_ROLES: {
    name: 'roles',
    root:"roles",
    icon:FaUserTie,
    displayName: 'User Roles',
    access:['admin', 'manager'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
  },
  PROJECTS: {
    name: 'projects',
    displayName: 'Projects',
    root:"projects",
    icon:MdOutlineInstallDesktop,
    access:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
  },
  TASKS: {
    name: 'tasks',
    displayName: 'Tasks',
    root:"tasks",
    access:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
  },
  DOCUMENTATION: {
    name: 'documentation',
    displayName: 'Documentation',
    root:"documentation",
    access:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
  },
  // Add more pages here as needed
};

export default PagesConfig;

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
export interface UserPageConfig {
  name: string;       // Internal name for the page
  displayName: string; // User-friendly name for the page
  actions: PageAction[]; // List of actions available for the page
  root:string;
  access?:string[];
  nav?:string[];
  icon?:IconType;
  subMenu?:UserPageConfig;
  sortOrder:number
}

// Create an object to hold all your pages' configurations
const UserPagesConfig: Record<string, UserPageConfig> = {
  USERS: {
    name: 'users',
    root:"users",
    displayName: 'Users',
    icon:FaUsers,
    access:['admin', 'manager'],
    nav:['admin', 'manager'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:2
  },
  USER_ROLES: {
    name: 'roles',
    root:"roles",
    icon:FaUserTie,
    displayName: 'User Roles',
    access:['admin', 'manager'],
    nav:['admin', 'manager'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:1
  },
  PROJECTS: {
    name: 'projects',
    displayName: 'Projects',
    root:"projects",
    icon:MdOutlineInstallDesktop,
    access:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:4
  },
  USER_GROUPS: {
    name: 'groups',
    displayName: 'User Groups',
    root:"groups",
    nav:['admin', 'manager'],
    icon:MdOutlineInstallDesktop,
    access:['admin', 'manager'], 
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:2
  },
  TASKS: {
    name: 'tasks',
    displayName: 'Tasks',
    root:"tasks",
    access:['all'],
    nav:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:6
  },
  DOCUMENTATION: {
    name: 'documentation',
    displayName: 'Documentation',
    root:"documentation",
    access:['all'],
    nav:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:7
  },
  MAIN_TASKS: {
    name: 'maintasks',
    displayName: 'Main Tasks',
    root:"maintasks",
    access:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:5
  },
  MY_TASKS: {
    name: 'mytasks',
    displayName: 'My Tasks',
    root:"mytasks",
    access:['all'],
    nav:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:6
  },
  // Add more pages here as needed
};

export {UserPagesConfig}
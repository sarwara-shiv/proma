import {FaUsers, FaUserTie} from 'react-icons/fa';
import { MdAdb, MdAdd, MdDashboard, MdOutlineInstallDesktop } from "react-icons/md";
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
  nav?:string[];
  icon?:IconType;
  subMenu?:Record<string, PageConfig> ;
  sortOrder:number
}

// Create an object to hold all your pages' configurations
const PagesConfig: Record<string, PageConfig> = {
  DASHBOARD: {
    name: 'dashboard',
    root:"dashboard",
    displayName: 'Dashboard',
    icon:MdDashboard,
    access:['all'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:1
  },
  USERS: {
    name: 'users',
    root:"users",
    displayName: 'Users',
    icon:FaUsers,
    access:['admin', 'manager'],
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    // subMenu:{
    //   USERS_ADD: {
    //     name: 'addNew',
    //     root:"add",
    //     displayName: 'Users Add',
    //     icon:MdAdd,
    //     access:['admin', 'manager'],
    //     actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    //     sortOrder:1
    //   }
    // },
    sortOrder:2
  },
  USER_ROLES: {
    name: 'roles',
    root:"roles",
    icon:FaUserTie,
    displayName: 'User Roles',
    access:['admin', 'manager'],
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
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:6
  },
  DOCUMENTATION: {
    name: 'documentation',
    displayName: 'Documentation',
    root:"documentation",
    access:['all'],
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
    actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    sortOrder:6
  }
  // Add more pages here as needed
};


export const UserPagesConfig: Record<string, PageConfig> = {
  DASHBOARD: {
    name: 'dashboard',
    root:"dashboard",
    displayName: 'Dashboard',
    icon:MdDashboard,
    access:['all'],
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

export default PagesConfig;

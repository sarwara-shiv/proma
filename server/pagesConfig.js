// pagesConfig.js

const Pages = {
    USERS: {
      name: 'users',
      displayName: 'Users',
      model:"Users",
      access:['admin', 'manager'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    AUTH: {
      name: 'users',
      displayName: 'Users',
      model:"Users",
      access:['admin', 'manager'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    USER_ROLES: {
      name: 'roles',
      displayName: 'UserRoles',
      model:"UserRoles",
      access:['admin', 'manager'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    PROJECTS: {
      name: 'projects',
      displayName: 'Projects',
      model:"Projects",
      access:['admin', 'manager', 'FrontendDev', 'fullstackDev', 'uiux', 'ecommerceMgr'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    TASKS: {
      name: 'tasks',
      displayName: 'Tasks',
      model:"Tasks",
      access:['admin', 'manager', 'FrontendDev', 'fullstackDev', 'uiux', 'ecommerceMgr'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    DOCUMENTATION: {
      name: 'documentation',
      displayName: 'Documentation',
      model:"Documentation",
      access:['all'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    // Add more pages here
  }; 
  
  export default Pages;
  
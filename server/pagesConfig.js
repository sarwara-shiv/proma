// pagesConfig.js

const Pages = {
    USERS: {
      name: 'users', // store in permissions object as page
      displayName: 'Users',
      model:"Users", // MongoDb schema model name
      access:['admin', 'manager'], // default access to
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete'] // actions
    },
    AUTH: {
      name: 'auth',
      displayName: 'auth',
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
    USER_GROUPS: {
      name: 'groups',
      displayName: 'UserGroups',
      model:"UserGroups",
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
  
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
    SKILLS: {
      name: 'skills',
      displayName: 'skills',
      model:"Skill",
      access:['admin', 'manager'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    TOKEN: {
      name: 'tokens',
      displayName: 'tokens',
      model:"Token",
      access:['admin', 'manager', 'FrontendDev', 'fullstackDev', 'uiux', 'ecommerceMgr'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    SPRINT: {
      name: 'sprints',
      displayName: 'sprints',
      model:"Sprint",
      access:['admin', 'manager', 'FrontendDev', 'fullstackDev', 'uiux', 'ecommerceMgr'],
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
    MAIN_TASKS: {
      name: 'maintasks',
      displayName: 'Main Tasks',
      model:"MainTask",
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
    WORKLOGS: {
      name: 'worklogs',
      displayName: 'Work Logs',
      model:"WorkLog",
      access:['all'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    DAILY_REPORTS: {
      name: 'dailyreports',
      displayName: 'Daily Reports',
      model:"DailyReport",
      access:['all'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    MYTASKS: {
      name: 'mytasks',
      displayName: 'My Tasks',
      model:"MyTasks",
      access:['all'],
      actions: ['canView', 'canCreate', 'canUpdate', 'canDelete']
    },
    // Add more pages here
  }; 
  
  export default Pages;
  
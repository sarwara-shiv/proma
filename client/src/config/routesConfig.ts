// Define the interface for route configuration
interface RouteConfig {
  path: string;
  element: string; // This should be ReactElement
  page: string;
  params?: string[];
  access:string[];
}

// Create an array to hold all your routes' configurations
const routes: RouteConfig[] = [
  {
    path: '/users',
    element: "Users", 
    page: "users",
    params: ['action', 'id'], 
    access:['admin']
  },
  {
    path: '/roles',
    element: "UserRoles", 
    page: "roles",
    params: ['action', 'id'], 
    access:['admin'] 
  },
  {
    path: '/groups',
    element: "UserGroups", 
    page: "groups",
    params: ['action', 'id'], 
    access:['admin'] 
  },
  {
    path: '/taskstracker',
    element: "TasksTracker", 
    page: "taskstracker",
    params: ['action', 'id'], 
    access:['admin'] 
  },
  {
    path: '/projects',
    element: "Projects",
    page: "projects",
    params: ['action', 'id'], 
    access:['all']
  },
  {
    path: '/worklog',
    element: "WorkLog",
    page: "worklog",
    params: ['action', 'id'], 
    access:['all']
  },
  {
    path: '/tasks',
    element: "Tasks",
    page: "tasks",
    params: ['action', 'id'], 
    access:['all']
  },
  {
    path: '/maintasks',
    element: "MainTasks",
    page: "maintasks",
    params: ['action', 'id'], 
    access:['all']
  },
  {
    path: '/documentation',
    element: "Documentation",
    page: "documentation",
    params: ['action', 'id'], 
    access:['all']
  },
  // {
  //   path: '/kickoff',
  //   element: "Kickoff",
  //   page: "kickoff",
  //   params: ['action', 'id'], 
  //   access:['all']
  // },
];

export default routes;

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
    path: '/projects',
    element: "Projects",
    page: "projects",
    params: ['action', 'id'], 
    access:['all']
  },
];

export default routes;

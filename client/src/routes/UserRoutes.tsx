import Users from "../pages/admin/users/Users";
import UserLayouot from "../components/layout/UserLayouot";
import { Routes, Route } from "react-router-dom";
import UserRoles from "../pages/admin/roles/UserRoles";
import Projects from '../pages/common/projects/Workspace';
import routes from '../config/routesConfig';
import { ReactElement } from 'react';

const routeComponents: Record<string, ReactElement> = {
  Users: <Users />,
  UserRoles: <UserRoles />,
  Projects: <Projects />,
};
const UserRoutes = () => {
  return (
    <Routes>
    <Route path="/" element={<UserLayouot />}>
    {routes.map(({ path, element, params, access }) => {

          const Component = routeComponents[element];
          if (!Component) {
            console.error(`Component ${element} not found`);
            return null;
          }
          return (<>
            {(access.includes('all') || access?.includes('user') || access?.includes('users')) && 
              <Route
              key={path}
              path={generateRoutePath(path, params)}
              element={Component} // Use the mapped component
              />
            }
            </>
          );
        })}
    </Route>
  </Routes>
  )
}

// Function to generate route paths, accommodating optional parameters
const generateRoutePath = (basePath: string, params?: string[]) => {
  if (!params || params.length === 0) {
    return basePath; // No params, return the base path as is
  }
  const paramRoutes = params.map(param => `:${param}?`).join('/'); // '?' makes the param optional
  return `${basePath}/${paramRoutes}`;
};


export default UserRoutes

import Users from "../pages/admin/users/Users";
import { Routes, Route } from "react-router-dom";
import UserRoles from "../pages/admin/roles/UserRoles";
import Projects from '../pages/common/projects/Workspace';
import routes from '../config/routesConfig';
import { ReactElement } from 'react';
import UserGroups from "../pages/admin/groups/UserGroups";
import Documentation from "../pages/common/documentation/Documentation";
import Kickoff from "../pages/common/kickoff/Kickoff";
import Tasks from "../pages/common/tasks/components/Tasks";
import MyTasks from "../pages/common/myTasks/MyTasks";
import MainTasks from "../pages/common/tasks/MainTasks";
import WorkLog from "../pages/common/myTasks/components/WorkLog";
import Layout from "../components/layout/Layout";

const routeComponents: Record<string, ReactElement> = {
  Users: <Users />,
  UserRoles: <UserRoles />,
  Projects: <Projects />,
  Documentation: <Documentation />,
  Kickoff: <Kickoff />,
  Tasks: <Tasks />,
  MyTasks: <MyTasks />,
  MainTasks: <MainTasks />,
  UserGroups: <UserGroups />,
  WorkLog: <WorkLog />,
};
const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
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

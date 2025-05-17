import { Routes, Route } from "react-router-dom";
import Users from '../pages/admin/users/Users';
import UserRoles from '../pages/admin/roles/UserRoles';
import Projects from '../pages/common/projects/Workspace';
import routes from '../config/routesConfig';
import { ReactElement } from 'react';
import UserGroups from '../pages/admin/groups/UserGroups';
import Kickoff from '../pages/common/kickoff/Kickoff';
import Tasks from '../pages/common/tasks/components/Tasks';
import MyTasks from '../pages/common/myTasks/MyTasks';
import MainTasks from '../pages/common/tasks/MainTasks';
import Documentation from '../pages/common/documentation/Documentation';
import WorkLog from '../pages/common/myTasks/components/WorkLog';
import Dashboard from '../pages/dashboard/Dashboard';
import Layout from '../layout/Layout';
import Positions from "../pages/admin/positions/positions";
import Settings from "../pages/admin/settings/Settings";

const routeComponents: Record<string, ReactElement> = {
  Users: <Users />,
  UserRoles: <UserRoles />,
  Projects: <Projects />,
  Documentation: <Documentation />,
  Kickoff: <Kickoff />,
  Tasks: <Tasks />,
  Settings: <Settings />,
  Positions: <Positions />,
  MyTasks: <MyTasks />,
  MainTasks: <MainTasks />,
  UserGroups: <UserGroups />,
  WorkLog: <WorkLog />,
  Dashboard: <Dashboard />,
};

console.log(routes);

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
      {routes.map(({ path, element, params,access }) => {
          const Component = routeComponents[element];
          if (!Component) {
            console.error(`Component ${element} not found`);
            return null;
          }
          return ( 
            <Route
              key={path}
              path={generateRoutePath(path, params)}
              element={Component} // Use the mapped component 
            />
          );
        })}
      </Route>
    </Routes>
  );
};

// Function to generate route paths, accommodating optional parameters
const generateRoutePath = (basePath: string, params?: string[]) => {
  if (!params || params.length === 0) {
    return basePath; // No params, return the base path as is
  }
  const paramRoutes = params.map(param => `:${param}?`).join('/'); // '?' makes the param optional
  return `${basePath}/${paramRoutes}`;
};

export default AdminRoutes;
import React from 'react';
import { Routes, Route } from "react-router-dom";
import AdminLayout from '../components/layout/AdminLayout';
import Users from '../pages/admin/users/Users';
import UserRoles from '../pages/admin/roles/UserRoles';
import Workspace from '../pages/admin/Workspace';
import UserGroups from '../pages/admin/groups/userGroups';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  params?: string[];
}

const routes: RouteConfig[] = [
  {
    path: '/users',
    element: <Users />,
    params: ['action', 'id'], 
  },
  {
    path: '/roles',
    element: <UserRoles />,
    params: ['action', 'id'], 
  },
  {
    path: '/groups',
    element: <UserGroups />,
    params: ['action', 'id'], 
  },
  {
    path: '/workspace',
    element: <Workspace />,
    params: ['action', 'id'], 
  },
];

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {routes.map(({ path, element, params }) => (
          <Route
            key={path}
            path={generateRoutePath(path, params)}
            element={element}
          />
        ))}
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
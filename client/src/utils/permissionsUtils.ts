/**
 * ------------------------
 *          TODO
 * ------------------------
 * - Get Side navigation pages function
 * - hasPermissions page
 * 
 * 
 */
import { FaUser } from "react-icons/fa";
import { IconType } from "react-icons";
import { DecodedToken, PagePermission, User, UserGroup, UserRole } from "@/interfaces";

export interface IPages {
  name: string;
  root: string;
  icon?: IconType;
}


interface IPagePermission {
    page: string;
    permissions: string[];
  }

// Static nav items
const fixedSideNavPages = [
  "dashboard",
  "projects",
  "documentation"
];


// Role-based nav items
const roleBasedSideNavPages = [
  "users",
  "roles",
  "groups",
  "positions",
  "settings"
];

// Simplified page permission map by role
const rolePermissions: Record<string, { page: string; permissions: string[] }[]> = {
  manager: [
    { page: "users", permissions: ["view"] },
    { page: "roles", permissions: ["view"] },
    { page: "groups", permissions: ["view"] },
    { page: "positions", permissions: ["view"] },
    { page: "projects", permissions: ["view"] },
    { page: "kickoff", permissions: ["view", "create", "update"] },
    { page: "maintasks", permissions: ["view", "create", "update", "delete"] },
    { page: "tasks", permissions: ["view", "create", "update", "delete"] },
    { page: "sprints", permissions: ["view", "create", "update", "delete"] },
    { page: "documentation", permissions: ["view", "create", "update"] },
  ],
  employee: [
    { page: "users", permissions: ["view"] },
    { page: "roles", permissions: ["view"] },
    { page: "groups", permissions: ["view"] },
    { page: "positions", permissions: ["view"] },
    { page: "projects", permissions: ["view"] },
    { page: "kickoff", permissions: ["view", "create", "update"] },
    { page: "maintasks", permissions: ["view", "update"] },
    { page: "tasks", permissions: ["view", "create", "update", "delete"] },
    { page: "sprints", permissions: ["view", "create", "update", "delete"] },
    { page: "documentation", permissions: ["view", "create", "update"] },
  ],
  client: [
    { page: "users", permissions: ["view"] },
    { page: "roles", permissions: ["view"] },
    { page: "groups", permissions: ["view"] },
    { page: "positions", permissions: ["view"] },
    { page: "projects", permissions: ["view"] },
    { page: "kickoff", permissions: ["view"] },
    { page: "maintasks", permissions: ["view"] },
    { page: "tasks", permissions: [] },
    { page: "sprints", permissions: ["view", "update"] },
    { page: "documentation", permissions: [] },
  ],
};

// Define page details
const pagesDetails: Record<string, IPages> = {
  users: { name: "users", root: "users", icon: FaUser },
  roles: { name: "roles", root: "roles", icon: FaUser },
  groups: { name: "groups", root: "groups", icon: FaUser },
  positions: { name: "positions", root: "positions", icon: FaUser },
  settings: { name: "settings", root: "settings", icon: FaUser },
  dashboard: { name: "dashboard", root: "dashboard", icon: FaUser },
  projects: { name: "projects", root: "projects", icon: FaUser },
  documentation: { name: "documentation", root: "documentation", icon: FaUser },
  messenger: { name: "messenger", root: "messenger", icon: FaUser },
};

// Get pages always shown in sidebar
export const getFixedPages = (): IPages[] => {
  return fixedSideNavPages
    .map(page => pagesDetails[page])
    .filter(Boolean);
};

// Get pages shown based on role permission & nav inclusion
export const getRoleBasedPages = (role: string): IPages[] => {
  const allowedPages = rolePermissions[role]
    ?.filter(perm => perm.permissions.includes("view") && roleBasedSideNavPages.includes(perm.page))
    .map(perm => pagesDetails[perm.page])
    .filter(Boolean) || [];

  return allowedPages;
};


// Combine both for a full sidebar
export const getSidebarPages = (role: string): IPages[] => {
  const fixed = getFixedPages();
  const roleBased = getRoleBasedPages(role);
  const combined = [...fixed, ...roleBased];

  // Optional: sort or remove duplicates
  const unique = Array.from(new Map(combined.map(p => [p.name, p])).values());

  return unique;
};



// import { FaUser } from "react-icons/fa";
// import { IconType } from "react-icons";

// export interface IPages {
//   name: string;
//   root: string;
//   icon?: IconType;
// }

// interface PagePermission {
//   page: string;
//   permissions: string[];
// }

// interface UserGroup {
//   name: string;
//   permissions: PagePermission[];
// }

// interface User {
//   role: string;
//   groups?: UserGroup[];
// }

// // Static sidebar
// const fixedSideNavPages = ["dashboard", "projects", "documentation"];
// const roleBasedSideNavPages = ["users", "roles", "groups", "positions", "settings"];

// // Define default permissions by role
// const rolePermissions: Record<string, PagePermission[]> = {
//   manager: [
//     { page: "users", permissions: ["view"] },
//     { page: "roles", permissions: ["view"] },
//     { page: "groups", permissions: ["view"] },
//     { page: "positions", permissions: ["view"] },
//     { page: "projects", permissions: ["view"] },
//     { page: "kickoff", permissions: ["view", "create", "update"] },
//     { page: "maintasks", permissions: ["view", "create", "update", "delete"] },
//     { page: "tasks", permissions: ["view", "create", "update", "delete"] },
//     { page: "sprints", permissions: ["view", "create", "update", "delete"] },
//     { page: "documentation", permissions: ["view", "create", "update"] }
//   ],
//   employee: [
//     { page: "users", permissions: ["view"] },
//     { page: "roles", permissions: ["view"] },
//     { page: "groups", permissions: ["view"] },
//     { page: "positions", permissions: ["view"] },
//     { page: "projects", permissions: ["view"] },
//     { page: "kickoff", permissions: ["view", "create", "update"] },
//     { page: "maintasks", permissions: ["view", "update"] },
//     { page: "tasks", permissions: ["view", "create", "update", "delete"] },
//     { page: "sprints", permissions: ["view", "create", "update", "delete"] },
//     { page: "documentation", permissions: ["view", "create", "update"] }
//   ],
//   client: [
//     { page: "users", permissions: ["view"] },
//     { page: "roles", permissions: ["view"] },
//     { page: "groups", permissions: ["view"] },
//     { page: "positions", permissions: ["view"] },
//     { page: "projects", permissions: ["view"] },
//     { page: "kickoff", permissions: ["view"] },
//     { page: "maintasks", permissions: ["view"] },
//     { page: "tasks", permissions: [] },
//     { page: "sprints", permissions: ["view", "update"] },
//     { page: "documentation", permissions: [] }
//   ]
// };

// // Pages metadata
// const pagesDetails: Record<string, IPages> = {
//   users: { name: "users", root: "users", icon: FaUser },
//   roles: { name: "roles", root: "roles", icon: FaUser },
//   groups: { name: "groups", root: "groups", icon: FaUser },
//   positions: { name: "positions", root: "positions", icon: FaUser },
//   settings: { name: "settings", root: "settings", icon: FaUser },
//   dashboard: { name: "dashboard", root: "dashboard", icon: FaUser },
//   projects: { name: "projects", root: "projects", icon: FaUser },
//   documentation: { name: "documentation", root: "documentation", icon: FaUser },
//   messenger: { name: "messenger", root: "messenger", icon: FaUser }
// };

// // Utility to merge role and group permissions
// const getCombinedPermissions = (user: User): PagePermission[] => {
//   const rolePerms = rolePermissions[user.role] || [];
//   const groupPerms = user.groups?.flatMap(group => group.permissions) || [];

//   const map = new Map<string, Set<string>>();

//   for (const { page, permissions } of [...rolePerms, ...groupPerms]) {
//     if (!map.has(page)) map.set(page, new Set());
//     permissions.forEach(p => map.get(page)?.add(p));
//   }

//   return Array.from(map.entries()).map(([page, perms]) => ({
//     page,
//     permissions: Array.from(perms)
//   }));
// };

// // Function: Get visible sidebar pages based on all permissions
// export const getUserSidebarPages = (user: User): IPages[] => {
//   const combinedPerms = getCombinedPermissions(user);

//   const navPages = combinedPerms
//     .filter(p =>
//       p.permissions.includes("view") && roleBasedSideNavPages.includes(p.page)
//     )
//     .map(p => pagesDetails[p.page])
//     .filter(Boolean);

//   const fixed = fixedSideNavPages.map(p => pagesDetails[p]).filter(Boolean);

//   const all = [...fixed, ...navPages];
//   return Array.from(new Map(all.map(p => [p.name, p])).values());
// };

// // Function: Check if user has permission for a page + action
// export const hasPermission = (
//   user: User,
//   page: string,
//   action: "view" | "create" | "update" | "delete"
// ): boolean => {
//   const combinedPerms = getCombinedPermissions(user);
//   const pagePerm = combinedPerms.find(p => p.page === page);
//   return pagePerm?.permissions.includes(action) || false;
// };


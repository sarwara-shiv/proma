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
import { DecodedToken, PagePermission, User, UserGroup, UserRole, IPages } from "@/interfaces";




interface IPagePermission {
    page: string;
    canView:boolean;
    canUpdate:boolean;
    canCreate:boolean;
    canDelete:boolean;
  }


// Simplified page permission map by role
const rolePermissions = {
  manager: [
    { page: "users", canView:true , canUpdate:false, canCreate:false, canDelete:false },
    { page: "roles", canView:true, canUpdate:false, canCreate:false, canDelete:false },
    { page: "groups", canView:true, canUpdate:false, canCreate:false, canDelete:false },
    { page: "positions", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "projects", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "kickoff", canView:true, canCreate:true,canUpdate:true},
    { page: "maintasks", canView:true, canCreate:true,canUpdate:true, canDelete:true  },
    { page: "tasks", canView:true, canCreate:true,canUpdate:true, canDelete:true },
    { page: "sprints", canView:true, canCreate:true,canUpdate:true, canDelete:true  },
    { page: "documentation", canView:true, canCreate:true,canUpdate:true },
  ],
  employee: [
    { page: "users", canView:true , canUpdate:false, canCreate:false, canDelete:false },
    { page: "roles", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "groups", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "positions", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "projects", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "kickoff", canView:true, canCreate:true,canUpdate:true, canDelete:false},
    { page: "maintasks", canView:true, canCreate:true,canUpdate:false, canDelete:false },
    { page: "tasks", canView:true, canCreate:true,canUpdate:true, canDelete:true },
    { page: "sprints", canView:true, canCreate:true,canUpdate:true, canDelete:true},
    { page: "documentation", canView:true, canCreate:true,canUpdate:true, canDelete:true },
  ],
  client: [
    { page: "users", canView:true, canUpdate:false, canCreate:false, canDelete:false },
    { page: "roles", canView:true, canUpdate:false, canCreate:false, canDelete:false   },
    { page: "groups",canView:true, canUpdate:false , canCreate:false, canDelete:false  },
    { page: "positions", canView:true, canUpdate:false, canCreate:false, canDelete:false  },
    { page: "projects", canView:true, canUpdate:false, canCreate:false, canDelete:false   },
    { page: "kickoff", canView:true, canUpdate:false, canCreate:false, canDelete:false   },
    { page: "maintasks", canView:true, canUpdate:false, canCreate:false, canDelete:false   },
    { page: "tasks", canView:false, canUpdate:false, canCreate:false, canDelete:false   },
    { page: "sprints", canView:true, canUpdate:true, canCreate:false, canDelete:false  },
    { page: "documentation", canView:false, canUpdate:false, canCreate:false, canDelete:false  },
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

const pagesArray=[
  'dashboard','users', 'roles', 'groups', 'positions', 'settings','projects', 'messenger'
];


const navigationPages: Record<string, IPages> = {
  users: { name: "users", root: "users", icon: FaUser },
  roles: { name: "roles", root: "roles", icon: FaUser },
  groups: { name: "groups", root: "groups", icon: FaUser },
  positions: { name: "positions", root: "positions", icon: FaUser },
  settings: { name: "settings", root: "settings", icon: FaUser },
  projects: { name: "projects", root: "projects", icon: FaUser },
  messenger: { name: "messenger", root: "messenger", icon: FaUser },
};


// create pages config
export const getNavigation = (permissions: any[]): IPages[] => {
  const pagePermissions: Record<string, any> = {};

  // Normalize permissions (flatten and merge)
  permissions.forEach((item) => {
    if (item.page && typeof item.page === "string") {
      pagePermissions[item.page] = item;
    } else if (item[1]?.page) {
      pagePermissions[item[1].page] = item[1];
    }
  });

  // Filter and map to valid navigation pages
  return Object.entries(navigationPages)
    .filter(([key]) => {
      const perm = pagePermissions[key];
      return perm && (perm.canCreate || perm.canUpdate);
    })
    .map(([_, page]) => page);
};


// get effective permissions
export const getEffectivePermissions =  (
  permissions: PagePermission[],
  page: string,
  type: '' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canView' = ''
) => {
  const perm = permissions.find(p => p.page === page);

  if (!perm) {
    // No permissions found for this page
    return type ? false : {
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canView: false
    };
  }

  if (type) {
    return !!perm[type];
  }

  return {
    canCreate: !!perm.canCreate,
    canUpdate: !!perm.canUpdate,
    canDelete: !!perm.canDelete,
    canView: !!perm.canView
  };
};
// can create
export const UserCanCreate = (
  permissions: PagePermission[],
  page: string,
) => {
  const perm = permissions.find(p => p.page === page);

  if (!perm) {
    // No permissions found for this page
    return false
  }

  return !!perm['canCreate'];

};
export const UserCanUpdate =  (
  permissions: PagePermission[],
  page: string,
) => {
  const perm = permissions.find(p => p.page === page);

  if (!perm) {
    // No permissions found for this page
    return false
  }

  return !!perm['canUpdate'];

};
export const UserCanDelete =  (
  permissions: PagePermission[],
  page: string,
) => {
  const perm = permissions.find(p => p.page === page);

  if (!perm) {
    // No permissions found for this page
    return false
  }

  return !!perm['canUpdate'];

};
export const UserCanView =  (
  permissions: PagePermission[],
  page: string,
) => {
  const perm = permissions.find(p => p.page === page);

  if (!perm) {
    // No permissions found for this page
    return false
  }

  return !!perm['canView'];

};

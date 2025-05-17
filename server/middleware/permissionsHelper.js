
import { UserRolesModel } from '../models/userRolesModel.js';
import UserGroupModel  from '../models/userGroupModel.js';

// Helper function to merge user and role permissions
const getEffectivePermissions = async (user, page) => {
  // Get user-level permission for the page
  const userPagePermission = (user.permissions || []).find(p => p.page === page) || {};

  // Fetch roles
  const userRoles = await UserRolesModel.find({
    _id: { $in: user.roles }
  });

  // Fetch groups
  const userGroups = await UserGroupModel.find({
    _id: { $in: user.groups }
  });

  let rolePermissions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: false
  };

  let groupPermissions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: false
  };

  // Merge role permissions
  userRoles.forEach(role => {
    const rolePagePermissions = (role.permissions || []).find(p => p.page === page) || {};
    rolePermissions.canCreate = rolePermissions.canCreate || !!rolePagePermissions.canCreate;
    rolePermissions.canUpdate = rolePermissions.canUpdate || !!rolePagePermissions.canUpdate;
    rolePermissions.canDelete = rolePermissions.canDelete || !!rolePagePermissions.canDelete;
    rolePermissions.canView = rolePermissions.canView || !!rolePagePermissions.canView;
  });

  // Merge group permissions
  userGroups.forEach(group => {
    const groupPagePermissions = (group.permissions || []).find(p => p.page === page) || {};
    groupPermissions.canCreate = groupPermissions.canCreate || !!groupPagePermissions.canCreate;
    groupPermissions.canUpdate = groupPermissions.canUpdate || !!groupPagePermissions.canUpdate;
    groupPermissions.canDelete = groupPermissions.canDelete || !!groupPagePermissions.canDelete;
    groupPermissions.canView = groupPermissions.canView || !!groupPagePermissions.canView;
  });

  // Combine user + role + group permissions
  return {
    canCreate: !!userPagePermission.canCreate || rolePermissions.canCreate || groupPermissions.canCreate,
    canUpdate: !!userPagePermission.canUpdate || rolePermissions.canUpdate || groupPermissions.canUpdate,
    canDelete: !!userPagePermission.canDelete || rolePermissions.canDelete || groupPermissions.canDelete,
    canView: !!userPagePermission.canView || rolePermissions.canView || groupPermissions.canView,
  };
};


export { getEffectivePermissions };

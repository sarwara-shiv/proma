
import { UserRolesModel } from '../models/userRolesModel.js';

// Helper function to merge user and role permissions
const getEffectivePermissions = async (user, page) => {
  let userPermissions = user.permissions.get(page) || {};

  // Fetch roles
  const userRoles = await UserRolesModel.find({
    _id: { $in: user.roles }
  });

  let rolePermissions = {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: false
  };

  // Merge role permissions (allow if any role grants permission)
  userRoles.forEach(role => {
    const rolePagePermissions = role.permissions.find(p => p.page === page) || {};
    rolePermissions.canCreate = rolePermissions.canCreate || rolePagePermissions.canCreate;
    rolePermissions.canUpdate = rolePermissions.canUpdate || rolePagePermissions.canUpdate;
    rolePermissions.canDelete = rolePermissions.canDelete || rolePagePermissions.canDelete;
    rolePermissions.canView = rolePermissions.canView || rolePagePermissions.canView;
  });

  // Merge user and role permissions (user permissions override)
  return {
    canCreate: userPermissions.canCreate || rolePermissions.canCreate,
    canUpdate: userPermissions.canUpdate || rolePermissions.canUpdate,
    canDelete: userPermissions.canDelete || rolePermissions.canDelete,
    canView: userPermissions.canView || rolePermissions.canView
  };
};

export { getEffectivePermissions };

import UserModel from '../models/userModel.js';
import Pages from '../pagesConfig.js';
import { getEffectivePermissions } from './permissionsHelper.js';
import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  
  
  try {

    const SECRET_KEY = process.env.SECRET_KEY;
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
    
    // Check if the user exists
    const user = await UserModel.findById(decoded.id).populate('roles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page } = req.body; // page should match one of the `Pages` entries
    const pageConfig = Object.values(Pages).find(p => p.name === page);

    if (!pageConfig) {
      return res.status(400).json({ message: 'Invalid page' });
    }

    // Admin role automatically grants full permissions
    if (user.roles.some(role => role.name === 'admin' || role.name === 'Admin')) {
      console.log('--------- user admin');
      req.permissions = { canView: true, canCreate: true, canUpdate: true, canDelete: true };
      req.user = user;
      return next();
    }

    const permissions = await getEffectivePermissions(user, page);    

    // Check if the user has view permissions for the requested page 
    if (!permissions.canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.permissions = permissions;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export { verifyToken };

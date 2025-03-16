import UserModel from '../models/userModel.js';
import Pages from '../pagesConfig.js';
import { getEffectivePermissions } from './permissionsHelper.js';
import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  // const token = req.headers['authorization']; -- old
  const token = req.cookies?.token; // -- new
  if (!token) {
    return res.status(403).json({ message: 'No token provided' }); 
  }
  
  
  try {
    
    const SECRET_KEY = process.env.SECRET_KEY;
    // const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY); -- old
    const decoded = jwt.verify(token, SECRET_KEY); // --- new
    // Check if the user exists
    const user = await UserModel.findById(decoded._id).populate('roles').populate('groups');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let { page } = req.body; // page should match one of the `Pages` entries

    if (!page && req.query.page) {
      page = req.query.page; // This is for GET requests or other query-based requests
    }

    if (!page) {
      return res.status(400).json({ message: 'Page not given' });
    }

    const pageConfig = Object.values(Pages).find(p => p.name === page);

    if (!pageConfig) {
      return res.status(400).json({ message: 'Invalid page' });
    }

    // Admin role automatically grants full permissions
    if (user.roles.some(role => role.name === 'admin' || role.name === 'Admin')) {
  
      req.permissions = { canView: true, canCreate: true, canUpdate: true, canDelete: true };
      req.user = user;
      return next();
    }

    const permissions = await getEffectivePermissions(user, page);    

    // Check if the user has view permissions for the requested page 
    if (!permissions.canView) {
      if(page == 'auth'){
        const rpermissions = await getEffectivePermissions(user, 'users');
        if(!rpermissions.canView){
          return res.status(403).json({ message: 'Access denied' });
        }  
      }else{
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    req.permissions = permissions;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export { verifyToken };

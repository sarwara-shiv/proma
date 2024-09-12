import jwt from 'jsonwebtoken';
import { UserModel } from '../routes/users/users.model.js';
import { Project, Task, Documentation } from '../models/schemas';  // Adjust the import path as needed

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const SECRET_KEY = process.env.SECRET_KEY;
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
    
    // Check if the user exists
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for page-specific permissions
    const { page } = req.body; // Adjust based on where page info comes from
    const resourceId = req.params.id; // Adjust based on your resource ID source
    const resourceType = req.body.resourceType; // Adjust based on your resource type source

    let permissions = {};
    if (resourceType === 'project') {
      const project = await Project.findById(resourceId).populate('permissions.person');
      permissions = project.permissions.find(p => p.person.equals(user._id))?.permissions.find(p => p.page === page) || {};
    } else if (resourceType === 'task') {
      const task = await Task.findById(resourceId).populate('permissions.person');
      permissions = task.permissions.find(p => p.person.equals(user._id))?.permissions.find(p => p.page === page) || {};
    } else if (resourceType === 'documentation') {
      const documentation = await Documentation.findById(resourceId).populate('permissions.person');
      permissions = documentation.permissions.find(p => p.person.equals(user._id))?.permissions.find(p => p.page === page) || {};
    }

    if (!permissions.canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = user;
    req.permissions = permissions;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export { verifyToken };

import jwt from 'jsonwebtoken';
import { UserModel } from '../routes/users/users.model.js';

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const SECRET_KEY = process.env.SECRET_KEY;
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);  // Replace with your secret

    // Check if the user exists in the database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;  // Attach user to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export { verifyToken };
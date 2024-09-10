import express from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from './routes/users/users.model.js'; 
import { UserRolesModel } from './routes/roles/userRoles.model.js';

const router = express.Router();

const initializeDefaultData = async () => {
  try {
    // Step 1: Add Default Roles
    const roleCount = await UserRolesModel.countDocuments();
    
    if (roleCount === 0) {
      await UserRolesModel.insertMany([
        { name: 'Admin', shortName: "Admin", isEditable: false },
        { name: 'Manager', shortName: "Manager", isEditable: false },
        { name: 'Employee', shortName: "Employee", isEditable: false },
        { name: 'User', shortName: "User", isEditable: false }
      ]);
      console.log('Default roles created.');
    } else {
      console.log('Roles already exist.');
    }

    // Step 2: Check for Admin Users
    const adminRole = await UserRolesModel.findOne({ name: "Admin" });
    if (!adminRole) {
      console.log('Admin role does not exist. Cannot create admin user.');
      return;
    }

    const adminUser = await UserModel.findOne({ 'roles': adminRole._id });

    if (!adminUser) {
      // No user with Admin role found; create an admin user
      const hashedPassword = await bcrypt.hash('Pass@123', 10);
      const newAdminUser = new UserModel({
        username: 'admin',
        email: "admin@proma.de",
        password: hashedPassword,
        roles: [adminRole._id], 
      });

      await newAdminUser.save();
      console.log('Admin user created. email: admin@proma.de, pass: Pass@123');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error initializing default data:', error); 
  }
};

export default initializeDefaultData;

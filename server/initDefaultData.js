import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from './models/userModel.js';
import { UserRolesModel } from './models/userRolesModel.js';

const router = express.Router();

const initializeDefaultData = async () => {
  try {
    // Step 1: Add Default Roles
    const roleCount = await UserRolesModel.countDocuments();
    
    if (roleCount === 0) {
      await UserRolesModel.insertMany([
        {
          name: 'admin', 
          displayName: 'Admin', 
          isEditable: false, 
          type: 'default',
          permissions: [
            { page: 'dashboard', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'users', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'projects', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'tasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'documentation', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
            { page: 'roles', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
          ]
        },
        {
          name: 'manager', 
          displayName: 'Manager', 
          isEditable: false, 
          type: 'default',
          permissions: [
            { page: 'dashboard', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'users', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'projects', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'tasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'documentatios', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'roles', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
          ]
        },
        {
          name: 'FrontendDev', 
          displayName: 'Frontend Developer', 
          isEditable: false, 
          type: 'created',
          permissions: [
            { page: 'projects', canCreate: true, canUpdate: true, canDelete: false, canView: true },
            { page: 'tasks', canCreate: true, canUpdate: true, canDelete: false, canView: true },
          ]
        },
        {
          displayName: 'Fullstack Developer', 
          name: 'fullstackDev', 
          isEditable: false, 
          type: 'created',
          permissions: [
            { page: 'projects', canCreate: true, canUpdate: true, canDelete: false, canView: true },
            { page: 'tasks', canCreate: true, canUpdate: true, canDelete: false, canView: true },
          ]
        },
        {
          displayName: 'UI/UX Designer', 
          name: 'uiux', 
          isEditable: false, 
          type: 'created',
          permissions: [
            { page: 'projects', canCreate: false, canUpdate: true, canDelete: false, canView: true },
            { page: 'tasks', canCreate: false, canUpdate: true, canDelete: false, canView: true },
          ]
        },
        {
          displayName: 'Ecommerce Manager', 
          name: 'ecommerceMgr', 
          isEditable: false, 
          type: 'created',
          permissions: [
            { page: 'projects', canCreate: true, canUpdate: true, canDelete: false, canView: true },
            { page: 'tasks', canCreate: true, canUpdate: true, canDelete: false, canView: true },
          ]
        },
        {
          displayName: 'Guest', 
          name: 'guest', 
          isEditable: false, 
          type: 'default',
          permissions: [
            { page: 'documentation', canCreate: false, canUpdate: false, canDelete: false, canView: true },
          ]
        }
      ]);
      console.log('Default roles created.');
    } else {
      console.log('Roles already exist.');
    }

    // Step 2: Check for Admin Users
    const adminRole = await UserRolesModel.findOne({ name: "admin" });
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

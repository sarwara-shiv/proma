import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from './models/userModel.js';
import { UserRolesModel } from './models/userRolesModel.js';
import UserGroupModel from './models/userGroupModel.js' 
import { Counter } from './models/models.js';

const router = express.Router();

const initializeDefaultData = async () => {
  try {

    // INITIALIZE COUNTER
    const counter = await Counter.countDocuments();
    if(counter === 0){
      await Counter.insertMany([
        { _id: 'projects', sequence_value: 1000 },
        { _id: 'tasks', sequence_value: 1000 },
        { _id: 'users', sequence_value: 1000 },
        { _id: 'groups', sequence_value: 1000 }, 
        { _id: 'documentations', sequence_value: 1000 },
        { _id: 'questions', sequence_value: 1000 },
        { _id: 'tickets', sequence_value: 1000 },
      ])

      console.log('default counter created');
    }

    // Step 0: Add Default Roles
    const groupCount = await UserGroupModel.countDocuments(); 
    if(groupCount === 0){
      await UserGroupModel.insertMany([
        {
          name:'manager',
          displayName:'Manager',
          type: 'default',
          isEditable:false,
        },
        {
          name:'contentManager',
          displayName:'Content Manager',
          type: 'default',
          isEditable:false,
        },
        {
          name:'frontendDeveloper',
          displayName:'Frontend Developer', 
          type: 'default',
          isEditable:false,
        },
        {
          name:'backendDeveloper',
          displayName:'Backend Developer',
          type: 'default',
          isEditable:false,
        },
        {
          name:'uiux',
          displayName:'UI/UX',
          type: 'default',
          isEditable:false,
        },
        {
          name:'qa',
          displayName:'QA',
          type: 'default',
          isEditable:false,
        },
      ]);
      console.log('Default Groups created.');
    }else{
      console.log('Default groups exists');
    }

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
            { page: 'groups', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
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
            { page: 'groups', canCreate: true, canUpdate: true, canDelete: true, canView: true },   
          ]
        },
        {
          name: 'employee', 
          displayName: 'Employee', 
          isEditable: false, 
          type: 'default',
          permissions: [
            { page: 'dashboard', canCreate: false, canUpdate: false, canDelete: false, canView: true },
            { page: 'users', canCreate: false, canUpdate: false, canDelete: false, canView: true },
            { page: 'projects', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'tasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'documentatios', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'roles', canCreate: false, canUpdate: false, canDelete: false, canView: true },  
            { page: 'groups', canCreate: false, canUpdate: false, canDelete: false, canView: true },  
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

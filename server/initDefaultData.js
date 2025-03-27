import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from './models/userModel.js';
import { UserRolesModel } from './models/userRolesModel.js';
import UserGroupModel from './models/userGroupModel.js' 
import { Counter } from './models/models.js';
import { generateUniqueId } from './utils/idGenerator.js'

const router = express.Router();

const initializeDefaultData = async () => {
  try {

    // INITIALIZE COUNTER
    const counter = await Counter.countDocuments();
    if(counter === 0){
      await Counter.insertMany([
        { _id: 'projects', sequence_value: 1000 },
        { _id: 'tasks', sequence_value: 1000 },
        { _id: 'worklogs', sequence_value: 1000 },
        { _id: 'qatasks', sequence_value: 1000 },
        { _id: 'users', sequence_value: 1000 },
        { _id: 'roles', sequence_value: 1000 },
        { _id: 'groups', sequence_value: 1000 }, 
        { _id: 'documentations', sequence_value: 1000 },
        { _id: 'questions', sequence_value: 1000 },
        { _id: 'tickets', sequence_value: 1000 },  
        { _id: 'dailyreports', sequence_value: 1000 },  
      ])

      console.log('default counter created');
    }

    //------- unblock to create new counter
    // await Counter.create({ _id: 'dailyreports', sequence_value: 1000 })

    // Step 0: Add Default Roles
    const groupCount = await UserGroupModel.countDocuments();  
    if(groupCount === 0){
      await UserGroupModel.insertMany([
        {
          name:'manager',
          _cid:await generateUniqueId('groups'),
          displayName:'Manager',
          type: 'default',
          isEditable:false,
        },
        {
          name:'contentManager',
          _cid:await generateUniqueId('groups'),
          displayName:'Content Manager',
          type: 'default',
          isEditable:false,
        },
        {
          name:'frontendDeveloper',
          _cid:await generateUniqueId('groups'),
          displayName:'Frontend Developer', 
          type: 'default',
          isEditable:false,
        },
        {
          name:'backendDeveloper',
          _cid:await generateUniqueId('groups'),
          displayName:'Backend Developer',
          type: 'default',
          isEditable:false,
        },
        {
          name:'uiux',
          _cid:await generateUniqueId('groups'),
          displayName:'UI/UX',
          type: 'default',
          isEditable:false,
        },
        {
          name:'qa',
          _cid:await generateUniqueId('groups'),
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
          _cid:await generateUniqueId('roles'),
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
            { page: 'worklogs', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
            { page: 'dailyreports', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
            { page: 'mytasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
          ]
        },
        {
          name: 'manager', 
          displayName: 'Manager', 
          _cid:await generateUniqueId('roles'),
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
            { page: 'worklogs', canCreate: true, canUpdate: true, canDelete: true, canView: true },   
            { page: 'dailyreports', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
            { page: 'mytasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },   
          ]
        },
        {
          name: 'employee', 
          _cid:await generateUniqueId('roles'),
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
            { page: 'worklogs', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
            { page: 'dailyreports', canCreate: true, canUpdate: true, canDelete: true, canView: true },
            { page: 'mytasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },    
          ]
        },
        {
          displayName: 'Client', 
          _cid:await generateUniqueId('roles'),
          name: 'client', 
          isEditable: false, 
          type: 'default',
          permissions: [
            { page: 'projects', canCreate: false, canUpdate: true, canDelete: false, canView: true },
            { page: 'tasks', canCreate: false, canUpdate: false, canDelete: false, canView: true },
            { page: 'users', canCreate: false, canUpdate: false, canDelete: false, canView: true },
            { page: 'mytasks', canCreate: true, canUpdate: true, canDelete: true, canView: true },  
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
        name:'Admin',
        username: 'admin',
        _cid:await generateUniqueId('users'),
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

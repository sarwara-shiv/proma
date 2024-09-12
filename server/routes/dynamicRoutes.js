import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation } from '../models/models.js';

const router = express.Router();

const getModel = (resource) => {
    switch (resource) {
      case 'projects':
        return Project;
      case 'tasks':
        return Task;
      // Add more models as needed
      default:
        return null;
    }
};
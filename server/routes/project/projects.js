import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation } from './workplace.model.js';

const router = express.Router();
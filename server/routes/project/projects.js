import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { UserRolesModel } from './workplace.model.js';

const router = express.Router();
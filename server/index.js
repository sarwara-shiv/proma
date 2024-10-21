import 'dotenv/config';
import express from "express";
import cors from "cors";

import mongoose, { mongo } from 'mongoose';

import initializeDefaultData from './initDefaultData.js';

import {userRouter} from "./routes/users/users.js"; 
import { rolesRouter } from './routes/roles/userRoles.js';
import { resourceRouter } from './routes/dynamicRoutes.js';
import { groupsRouter } from './routes/groups/userGroups.js'; 
import { ChangeLog } from './models/models.js';


const app = express();

app.use(express.json());
app.use(cors());

//debugging data for development
mongoose.set('debug', true);

const DB_PASS = process.env.DB_PASS;
const mongoURI = process.env.DB_LOCAL_URL; 
const PORT = process.env.PORT || 3001; 

// ROUTES
app.use("/resource", resourceRouter);
app.use("/auth", userRouter);
app.use("/roles", rolesRouter);
app.use("/groups", groupsRouter);

// DB CONNECTION
mongoose.connect(mongoURI).then(()=>{
    initializeDefaultData();
}).catch(()=>{
    console.error('DB Connection Error');
})

const db = mongoose.connection; 
db.on('connected', () => {
    console.log('Mongoose connection established successfully.');
    const db = mongoose.connection.db;
    console.log('Connected to database:', db.databaseName);
    
    const { host, port, name } = mongoose.connection;
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Database Name:', name); 
});
  
db.on('error', (err) => {
    console.error('Mongoose connection error:', err); 
}); 

app.listen(PORT, ()=> console.log("SERVER STARTED"));

app.get('/changelog/:documentId', async (req, res) => {
    const { documentId } = req.params;
  
    try {
      // Fetch change logs for the specified document ID
      const changeLogs = await ChangeLog.find({ documentId });
  
      if (changeLogs.length === 0) {
        return res.status(404).json({ message: 'No change logs found for this document ID.' });
      }
  
      return res.json(changeLogs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while fetching change logs.' });
    }
  });
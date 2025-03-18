import 'dotenv/config';
import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import http from "http";
import mongoose, { mongo } from 'mongoose';

import initializeDefaultData from './initDefaultData.js';

import {userRouter} from "./routes/users/users.js"; 
import { rolesRouter } from './routes/roles/userRoles.js';
import { resourceRouter } from './routes/dynamicRoutes.js';
import { groupsRouter } from './routes/groups/userGroups.js'; 
import { ChangeLog } from './models/models.js';
import { worklogRouter } from './routes/worklog/workLog.js';
import { initializeSocket } from './socket.js';



const app = express();
app.use(express.json({ limit: "50mb" })); // Adjust size as needed
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const server = http.createServer(app); // Create HTTP server
// Initialize Socket.io
const io = initializeSocket(server);
app.set('socket', io);

app.use(cookieParser());
app.use(express.json());
// app.use(cors()); --- old
const allowedOrigins = [process.env.CLIENT_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // This is important to allow cookies and other credentials
};
app.use(cors(corsOptions));

//debugging data for development
mongoose.set('debug', true);

// const DB_PASS = process.env.DB_PASS;
const mongoURI = process.env.DB_LOCAL_URL; 
const PORT = process.env.PORT || 3001; 

// ROUTES
app.use("/resource", resourceRouter);
app.use("/auth", userRouter);
app.use("/roles", rolesRouter);
app.use("/groups", groupsRouter);
app.use("/worklog", worklogRouter);

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
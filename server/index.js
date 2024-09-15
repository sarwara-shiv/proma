import 'dotenv/config';
import express from "express";
import cors from "cors";

import mongoose, { mongo } from 'mongoose';

import initializeDefaultData from './initDefaultData.js';

import {userRouter} from "./routes/users/users.js"; 
import { rolesRouter } from './routes/roles/userRoles.js';
import { resourceRouter } from './routes/dynamicRoutes.js';
// import { groupsRouter } from './routes/groups/userGroups.js'; 


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
// app.use("/groups", groupsRouter); 
//app.use(userRouter);

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
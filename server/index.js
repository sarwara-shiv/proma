import 'dotenv/config';
import express from "express";
import cors from "cors";

import mongoose, { mongo } from 'mongoose';

import {userRouter} from "./routes/users.js"; 

const app = express();

app.use(express.json());
app.use(cors());

//debugging data for development
mongoose.set('debug', true);

const DB_PASS = process.env.DB_PASS;
const mongoURI = process.env.DB_URL;
const PORT = process.env.PORT || 3001; 
console.log(DB_PASS)
// ROUTES
app.use("/auth", userRouter);
//app.use(userRouter);

// DB CONNECTION
mongoose.connect(mongoURI); 

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
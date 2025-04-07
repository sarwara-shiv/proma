import 'dotenv/config';
import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import http from "http";
import mongoose from 'mongoose';

import initializeDefaultData from './initDefaultData.js';

import { userRouter } from "./routes/users/users.js";
import { rolesRouter } from './routes/roles/userRoles.js';
import { resourceRouter } from './routes/dynamicRoutes.js';
import { groupsRouter } from './routes/groups/userGroups.js';
import { worklogRouter } from './routes/worklog/workLog.js';
import { dailyReportRouter } from './routes/worklog/dailyReport.js'; 
import { initializeSocket } from './socket.js';
import { leadRoutes } from './routes/leadRoutes/leadRoutes.js';
import { dummyWorklogData, printIds } from './dummyData.js';

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const server = http.createServer(app); // Create HTTP server

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [process.env.CLIENT_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Initialize Socket.io
const io = initializeSocket(server, app);
app.set('socket',io);

// ROUTES
app.use("/resource", resourceRouter);
app.use("/auth", userRouter);
app.use("/roles", rolesRouter);
app.use("/groups", groupsRouter);
app.use("/worklog", worklogRouter);
app.use("/leads", leadRoutes);
app.use("/daily-report", dailyReportRouter);

// DB CONNECTION
const mongoURI = process.env.DB_LOCAL_URL;
const PORT = process.env.PORT || 3001;

mongoose.connect(mongoURI).then(() => {
    initializeDefaultData();
}).catch(() => {
    console.error('DB Connection Error');
});

const db = mongoose.connection;
db.on('connected', async () => {
    console.log('Mongoose connection established successfully.');
    const db = mongoose.connection.db;
    console.log('Connected to database:', db.databaseName);

    const { host, port, name } = mongoose.connection;
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Database Name:', name);

    // print ids for collection
    // printIds(db);
    // await dummyWorklogData(db);
    
});


db.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

server.listen(PORT, () => console.log("SERVER STARTED"));
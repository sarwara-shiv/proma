import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import  crypto from 'crypto';
import { UserModel } from '../models/users.model.js'; 
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

// REGISTER
router.post("/register", async(req, res)=>{
    const {username, password, email} = req.body;
    try{
        const userByName = await UserModel.findOne({username});
        const userByEmail = await UserModel.findOne({email});
        const data = (userByName && userByName) ? userByName : userByName ? userByName : userByEmail;
        if(userByName || userByEmail){
            const message = (userByName && userByEmail) ? "user_name_email_exists" : (userByEmail) ? "user_email_exists" : "user_name_exists" ;
            const code = (userByName && userByEmail) ? `User with Name: ${username} and email : ${email} exists` : (userByEmail) ? `User with email : ${email} exists` : `username: ${username} exists`;

            return res.json({status:"error", message, code, data});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({username, password:hashedPassword, email});
        await newUser.save();
        return res.status(201).json({ status:"success", message:"user created", code:"data_added"});
        //res.json(user);
    }catch(error){
        return res.status(500).json({status:"error", message:"user created", code:"unknown_error", error});
    }
});

// LOGIN
router.post("/login", async(req, res)=>{
    const {uername, email, password} = req.body;
    try{
        const user = await UserModel.findOne({email});
        console.log(user);

        if(!user){
            return res.json({status:"error", message:`user does not exists with username: ${email}`, code:"unknown_user"});
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({status:"error", message: "Invalid password", code:"invalid_password" });
        }
        // Generate a JWT token
        // const SECRET_KEY = process.env.SECRET_KEY;
        const SECRET_KEY = crypto.randomBytes(64).toString('hex');;
        console.log(SECRET_KEY);
        const token = jwt.sign({ id: user._id, email: user.email, username: user.username, role:"admin" }, SECRET_KEY, {  // change role later
            expiresIn: '10h',
        });

        res.json({status:"success", message: "Login successful", token, code:"loggedin", userID: user._id, role:"admin" }); // change role later

    }catch(error){
        return res.json({status:"error", message:"unknown error", code:"unknown_error", error});
    }
});


// LOGOUT
router.post("/logout", async(req, res)=>{
    res.clearCookie('token');
    // You can also respond with a success message
    res.status(200).json({ message: 'Logout successful', code:"loggedout" });
});


// VERIFY USER
router.get('/check-users', verifyToken, (req, res)=>{ 
    res.status(200).json(req.user);
})



export {router as userRouter};
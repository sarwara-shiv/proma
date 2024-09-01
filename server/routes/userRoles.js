import express from 'express';
import { UserModel } from '../models/users.model.js'; 
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

// CREATE
router.post("/create", async(req, res)=>{
    const {roleName, shortName,permissions=[], description } = req.body;
    try{
        const byName = await UserModel.findOne({roleName});
        const byShort = await UserModel.findOne({shortName});
        const data = (byName && byName) ? byName : byName ? byName : byShort;
        if(byName || byShort){
            const message = (byName && byShort) ? "exists" : (byShort) ? "short_name_exists" : "name_exists" ;
            const code = (byName && byShort) ? `Role with Name: ${roleName} and short name : ${shortName} exists` : (byShort) ? `Role with short name : ${email} exists` : `Role : ${roleName} exists`;
            return res.json({status:"error", message, code, data});
        }
        const newRole = new UserModel(req.body);
        await newRole.save();
        return res.status(201).json({ status:"success", message:"created", code:"data_added"});
        //res.json(user);
    }catch(error){
        return res.status(500).json({status:"error", message:"not created", code:"unknown_error", error});
    }
});

export {router as rolesRouter};
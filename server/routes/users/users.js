import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from './users.model.js'; 
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { username, password, email, permissions=[], roles=[], isActive = true, isEditable=true } = req.body;
    try {
        const userByName = await UserModel.findOne({ username });
        const userByEmail = await UserModel.findOne({ email });

        if (userByName || userByEmail) {
            const code = userByName && userByEmail
                ? "user_name_email_exists"
                : userByEmail
                ? "user_email_exists"
                : "user_name_exists";
            
            const message = userByName && userByEmail
                ? `User with Name: ${username} and email: ${email} exists`
                : userByEmail
                ? `User with email: ${email} exists`
                : `Username: ${username} exists`;
            return res.status(200).json({ status: "error", message, code });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, password: hashedPassword, email });
        await newUser.save();

        return res.status(201).json({ status: "success", message: "User created", code: "data_added" });
    } catch (error) {
        console.error("Error creating user:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "User creation failed", code: "unknown_error", error });
    }
});

// UPDATE
router.post("/update", verifyToken, async (req, res) => {
    const {fields, fieldsType, id} = req.body;
    if(id){
        if(fields){
            const record = await UserModel.findOne({ _id:id });
            if(record){
                try {
                    if(fieldsType === 'hasPassword' && fields.password){
                        const newValue = await bcrypt.hash(fields.password, 10); 
                        fields.password = newValue;
                    }
                    const data = await UserModel.updateOne(
                        { _id:id }, 
                        { $set: fields }
                    );

                    return res.status(201).json({ status: "success", message: "no record", data:data ,code: "data_updated" });
                }catch(error){
                    return res.status(500).json({ status: "error", message: error, code: "unknown_error", error });
                }
            }else{
                return res.status(201).json({ status: "error", message: "no record", code: "data_not_found" });
            }
        }
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;  // Fixed typo here
    try {
        const user = await UserModel.findOne({ email }).populate('roles');
        console.log(user);
        if (!user) {
            return res.status(404).json({ status: "error", message: `User does not exist with email: ${email}`, code: "unknown_user" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: "error", message: "Invalid password", code: "invalid_password" });
        }

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) {
            return res.status(500).json({ status: "error", message: "Server configuration error", code: "config_error" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username, role: "admin", roles:user.roles },
            SECRET_KEY,
            { expiresIn: '10h' }
        );

        res.json({
            status: "success",
            message: "Login successful",
            token,
            code: "loggedin",
            userID: user._id,
            role: "admin",
            useremail: user.email,
            username: user.username
        });
    } catch (error) {
        console.error("Error logging in:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "Login failed", code: "unknown_error", error });
    }
});

// GET
router.get("/get", verifyToken, async (req, res) => {
    console.log(req.user);  // Consider removing this in production

    try {
        const data = await UserModel.find();
        return res.json({ status: "success", data, code:"success", message:""});
    } catch (error) {
        console.error("Error fetching roles:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    res.clearCookie('token');  // Clear the cookie containing the JWT token
    res.status(200).json({ message: 'Logout successful', code: "loggedout" });
});

// VERIFY USER
router.get('/check-users', verifyToken, (req, res) => { 
    res.status(200).json(req.user);
});

// DELETE BY ID
router.post("/delete", verifyToken, async (req, res) => {
    const { id, action } = req.body;
    console.log(req.body);
    try {
        if(id){
            const result = await UserModel.findByIdAndDelete(id);
            if(result){
                return res.json({ status: "success", message:result, code:"deleted" });
            }else{
                return res.json({ status: "error", message:result, code:"unknown_id"});
            }
        }else{
            return res.json({ status: "error", message:"id not provided", code:"unknown_id"});
        }
    } catch (error) {
        console.error("Error deleting :", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "could not delete roles", error, code:"unknown_error" });
    }
});

export { router as userRouter };

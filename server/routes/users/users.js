import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { verifyToken } from '../../middleware/auth.js';
import UserModel from '../../models/userModel.js'; 

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { name="", username, password, email, permissions=[], roles=[], isActive = true, isEditable=true } = req.body.data;
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


// Add
router.post("/add", verifyToken, async (req, res) => {
    const { username, password="Pass@123", email, permissions=[], groups=[], roles=[], isActive = true, isEditable=true} = req.body.data;
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
    const {fields, fieldsType, id} = req.body.data;
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
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email }).populate('roles').populate('groups');
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

        let rolePermissions = [];
        let userPermissions = user.permissions ? Array.from(user.permissions) : [];

        user.roles.forEach(role => {
            if (role.permissions) {
              rolePermissions = [...rolePermissions, ...role.permissions];
            }
        });

        const combinedPermissions = mergePermissions(rolePermissions, userPermissions);

        // Generate a JWT token
        const token = jwt.sign(
            { _id: user._id, email: user.email, username: user.username, role: user.roles[0].name, groups:user.groups, roles:user.roles, permissions:combinedPermissions },
            SECRET_KEY,
            { expiresIn: '10h' }
        );

        // Set the token in an HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,   // Prevents client-side access
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: "strict", // Helps mitigate CSRF attacks
            maxAge: 10 * 60 * 60 * 1000 // Cookie expiration time (10 hours)
        });

        return res.json({
            status: "success",
            message: "Login successful",
            code: "loggedin",
            token,
            data : { _id: user._id, email: user.email, username: user.username, role: user.roles[0].name, groups:user.groups, roles:user.roles, permissions:combinedPermissions },
        });

    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ status: "error", message: "Login failed", code: "unknown_error", error });
    }
});

// GET
router.post("/get", verifyToken, async (req, res) => {
    console.log(req.user);  // Consider removing this in production
    console.log(req.permissions);  // Consider removing this in production

    try {
        const data = await UserModel.find().populate('roles').populate('groups');
        return res.json({ status: "success", data, code:"success", message:""}); 
    } catch (error) {
        console.error("Error fetching roles:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});


// LOGOUT
router.post("/logout", (req, res) => {
    // res.clearCookie('access_token');  // Clear the cookie containing the JWT token -- old
    // res.clearCookie('token');  // Clear the cookie containing the JWT token -- old
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    res.status(200).json({ message: 'Logout successful', code: "loggedout" });
});

// VERIFY USER
router.get('/check-users', verifyToken, (req, res) => { 
    res.status(200).json(req.user);
});

// DELETE BY ID
router.post("/delete", verifyToken, async (req, res) => {
    const { id, action } = req.body.data;
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

// Generate and send password reset link
router.post('/forgot-password', async(req, res)=>{
    const {email} = req.body;
    try{
        const user = await UserModel.findOne({email});
        console.log(user);
        if(!user){
            return res.json({ status: "error", message:"User not found with email", code:"user_with_email_not_found" });
        }

        const SECRET_KEY = process.env.SECRET_KEY;
        const resetToken = jwt.sign(
            {id:user._id},
            SECRET_KEY, {expiresIn:'24h'}
        );

        // Update user with the reset token and expiration time
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 24*60*60*1000; // 24 hours

        await user.save();

        // Setup nodemiler
        if(process.env.EMAIL_USER){
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
                }
            });

            // send email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset',
                html: `<p>You requested for a password reset</p>
                       <p>Click this <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">link</a> to reset your password.</p>`
              };
            
              transporter.sendMail(mailOptions, (error, info)=>{
                if(error){
                    return res.json({ status: "error", message:"Email not sent", code:"error_sending_email", error });
                }
                return res.json({ status: "success", message:"Password reset email sent", code:"password_reset_email_sent" });
            })  
        }

        return res.json({ status: "success", message:"Password reset email sent", code:"passoword_reset_link", link:`${process.env.CLIENT_URL}/reset-password/${resetToken}`}); 

    }catch(error){
        return res.status(500).json({ status: "error", message: "server error", error, code:"unknown_error" });
    }
})

// Reset Password
router.post('/reset-password/:token', async(req,res)=>{
    const {token} = req.params;
    const {password} =req.body;
    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await UserModel.findOne({
            _id:decoded.id,
            resetPasswordToken:token,
            resetPasswordExpires:{$gt: Date.now()} // token should not be expired
        });

        if(!user){
            return res.json({ status: "error", message:"Invalid or expired token", code:"invalid_expired_token" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;  
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.json({ status: "success", message:"Password reset successfully", code:"password_reset_success" });
        
    }catch(error){
        return res.status(500).json({ status: "error", message: "server error", error, code:"unknown_error" });
    }
})

// admin reset password
router.post('/admin-reset-password', verifyToken, async(req,res)=>{
    const {id, password} =req.body;
    console.log(password);
    console.log(id);
    try{
        const user = await UserModel.findOne({_id:id});
        if(!user){
            return res.json({ status: "error", message:"User not found with email", code:"user_not_found" });
        }
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        return res.json({ status: "success", message:"User Password Saved", code:"password_reset_success" });

    }catch(error){
        return res.json({ status: "error", message:"Server error", code:"server error" });
    }
    
});

// search user by username
router.get('/search-users', async(req,res)=>{
    const query = req.query.name;
    if(query){
        try {
            const users = await UserModel.find({ name: { $regex: query, $options: 'i' } }).limit(10);
            return res.json({ status: "success", message:"users found", code:"users_found", data:users });
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
    }else{
        res.status(500).json({ message: error.message });
    }
});


// merge permissions
const mergePermissions = (rolePermissions, userPermissions) => {
    const mergedPermissions = new Map();
  
    // Add role-based permissions first
    rolePermissions.forEach(permission => {
      mergedPermissions.set(permission.page, {
        canCreate: permission.canCreate,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
        canView: permission.canView,
      });
    });
  
    // Add user-specific permissions (override if already present)
    userPermissions.forEach((permission, page) => {
      if (mergedPermissions.has(page)) {
        const rolePerm = mergedPermissions.get(page);
        mergedPermissions.set(page, {
          canCreate: permission.canCreate ?? rolePerm.canCreate,
          canUpdate: permission.canUpdate ?? rolePerm.canUpdate,
          canDelete: permission.canDelete ?? rolePerm.canDelete,
          canView: permission.canView ?? rolePerm.canView,
        });
      } else {
        mergedPermissions.set(page, permission);
      }
    });
  
    return Array.from(mergedPermissions, ([page, permissions]) => ({
      page,
      ...permissions,
    }));
  };


export { router as userRouter };

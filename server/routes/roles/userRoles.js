import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { UserRolesModel } from '../../models/userRolesModel.js';


const router = express.Router();

// CREATE
router.post("/add", verifyToken, async (req, res) => {
    const { name, displayName, permissions = [], description } = req.body.data;
    console.log(req.body);

    // Validate input
    if (!name || !displayName) {
        return res.status(400).json({
            status: "error",
            message: "Role name and short name are required",
            code: "validation_error",
        });
    }

    const formData = { name, displayName, permissions, description };

    try {
        // Check if a role with the same name or shortName already exists
        const [byName, byDisplayName] = await Promise.all([
            UserRolesModel.findOne({ name }),
            UserRolesModel.findOne({ displayName })
        ]);

        if (byName || byDisplayName) {
            const message = byName && byDisplayName 
                ? "exists" 
                : byDisplayName 
                ? "displayname_exists" 
                : "name_exists";
            
            const code = byName && byDisplayName 
                ? `Role with Name: ${name} and Display Name: ${shortName} exists` 
                : byDisplayName 
                ? `Role with Display Name: ${shortName} exists` 
                : `Role with Name: ${name} exists`;

            return res.status(400).json({ status: "error", message, code, data:formData });
        }

        // Create and save the new role
        const newRole = new UserRolesModel(formData);
        await newRole.save();
        return res.status(201).json({ status: "success", message: "created", code: "data_added" });

    } catch (error) {
        console.error("Error creating role:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "not created", code: "unknown_error", error });
    }
});


// GET
router.post("/get", verifyToken, async (req, res) => {
    console.log(req.user); 

    try {
        const data = await UserRolesModel.find();
        return res.json({ status: "success", data, code:"success"});
    } catch (error) {
        console.error("Error fetching roles:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "could not fetch roles", error, code:"unknown_error"});
    }
});

// DELETE BY ID
router.post("/delete", verifyToken, async (req, res) => {
    const { id, action } = req.body.data;
    console.log(req.body);
    try {
        if(id){
            const result = await UserRolesModel.findByIdAndDelete(id);
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

export { router as rolesRouter };

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { UserRolesModel } from '../models/userRoles.model.js';

const router = express.Router();

// CREATE
router.post("/add", verifyToken, async (req, res) => {
    const { roleName, shortName, permissions = [], description } = req.body;

    // Validate input
    if (!roleName || !shortName) {
        return res.status(400).json({
            status: "error",
            message: "Role name and short name are required",
            code: "validation_error",
        });
    }

    const formData = { roleName, shortName, permissions, description };

    try {
        // Check if a role with the same roleName or shortName already exists
        const [byName, byShort] = await Promise.all([
            UserRolesModel.findOne({ roleName }),
            UserRolesModel.findOne({ shortName })
        ]);

        if (byName || byShort) {
            const message = byName && byShort 
                ? "exists" 
                : byShort 
                ? "short_name_exists" 
                : "name_exists";
            
            const code = byName && byShort 
                ? `Role with Name: ${roleName} and Short Name: ${shortName} exists` 
                : byShort 
                ? `Role with Short Name: ${shortName} exists` 
                : `Role with Name: ${roleName} exists`;

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
router.get("/get", verifyToken, async (req, res) => {
    console.log(req.user);  // Consider removing this in production

    try {
        const data = await UserRolesModel.find();
        return res.json({ status: "success", data });
    } catch (error) {
        console.error("Error fetching roles:", error);  // Log error for debugging
        return res.status(500).json({ status: "error", message: "could not fetch roles", error });
    }
});

export { router as rolesRouter };

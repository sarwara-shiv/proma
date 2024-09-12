import mongoose, { Schema } from "mongoose";

// Define the UserRoles Schema
const UserRolesSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  shortName: {
    type: String,
    unique: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ["default", "created"]
  },
  permissions: {
    type: Map,
    of: {
      page: { type: String, required: true },  // Page or section name
      canCreate: { type: Boolean, default: false },
      canUpdate: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
      canView: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

// Create and export the UserRoles model
export const UserRolesModel = mongoose.model('UserRoles', UserRolesSchema, 'UserRoles');

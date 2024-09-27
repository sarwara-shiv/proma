import mongoose, { Schema } from 'mongoose';

const UserRolesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  _cid:{type:String},
  displayName: { type: String, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  isEditable: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ["default", "created", "custom"], default:"custom" },
  permissions: [{
    page: { type: String },
    canCreate: { type: Boolean, default: false },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canView: { type: Boolean, default: false },
  }]
});

export const UserRolesModel = mongoose.model('UserRoles', UserRolesSchema);  

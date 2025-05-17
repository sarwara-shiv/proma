import mongoose, { Schema } from 'mongoose';
const UserGroupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  _cid:{type:String},
  displayName: { type: String, required: true, unique: true },
  description: { type: String},
  isEditable: { type: Boolean, default: true },
  permissions: [{
    page: { type: String },
    canCreate: { type: Boolean, default: false },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canView: { type: Boolean, default: false },
  }],
  type: { type: String, enum: ["default", "created", "custom"], default:"custom" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserGroupModel = mongoose.model('UserGroups', UserGroupSchema);

export default UserGroupModel;

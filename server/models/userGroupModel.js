import mongoose, { Schema } from 'mongoose';
const UserGroupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true, unique: true },
  description: { type: String},
  isEditable: { type: Boolean, default: true },
  type: { type: String, enum: ["default", "created", "custom"], default:"custom" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserGroupModel = mongoose.model('UserGroups', UserGroupSchema);

export default UserGroupModel;

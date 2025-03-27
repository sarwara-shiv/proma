import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  _cid:{type:String},
  name: { type: String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'UserRoles' }], 
  groups: [{ type: Schema.Types.ObjectId, ref: 'UserGroups' }], 
  firma: { type: String, default:"self"}, 
  permissions: {
    type: Map,
    of: {
      page: { type: String },
      canCreate: { type: Boolean, default: false },
      canUpdate: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
      canView: { type: Boolean, default: false },
    },
  },
  isActive:{type:Boolean, default:true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken:{type:String},
  resetPasswordExpires:{type:Date}
});

UserSchema.method.hashPassword = async function(password){
  return await bcrypt.hash(password, 10);
}

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;

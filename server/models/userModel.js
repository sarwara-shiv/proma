import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  _cid:{type:String},
  name: { type: String},
  image:{
    icon:{type:String, default:''},
    full:{type:String, default:''}
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'UserRoles' }], 
  groups: [{ type: Schema.Types.ObjectId, ref: 'UserGroups' }],  
  firma: { type: String, default:"self"}, 
  workLoad:{type:Number, default:0, required:true},
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

// UserSchema.methods.updateWorkLoad = function (isAssigned) {
//   if (isAssigned) {
//     // Increase the work load when a task is assigned
//     this.workLoad += 1;
//   } else {
//     // Decrease the work load when a task is removed
//     if(this.workLoad > 0)
//     this.workLoad -= 1;
//   }
//   return this.save(); // Save the user after updating the workload
// };

UserSchema.methods.updateWorkLoad = function (isAssigned, task) {
  const storyPoints = task?.storyPoints ?? 1; // Default to 1 if not provided

  if (isAssigned) {
    // Increase the workload by story points when a task is assigned
    this.workLoad += storyPoints;
  } else {
    // Decrease the workload by story points when a task is removed
    this.workLoad -= storyPoints;
    if (this.workLoad < 0) this.workLoad = 0; // Prevent negative workload
  }

  return this.save(); // Save the user after updating the workload
};


const UserModel = mongoose.model('User', UserSchema);

export default UserModel;

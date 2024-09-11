import mongoose, {Schema} from "mongoose";

const UserSchema = new mongoose.Schema({
    "username": {
      "type": "String",
      "required": true,
      "unique": true
    },
    "email": {
      "type": "String",
      "required": true,
      "unique": true
    },
    "password": {
      "type": "String",
      "required": true
    },
    "fullName": {
      "type": "String"
    },
    "roles": [{
      "type": Schema.Types.ObjectId,
      "ref": "UserRoles"
    }],
    "createdAt": {
      "type": "Date",
      "default": Date.now
    },
    "isEditable":{
      "type":"Boolean",
      "default":true,
    },
    "updatedAt": {
      "type": "Date",
      "default": Date.now
    },
    "isActive": {
      "type": "Boolean",
      "default": true
    }
  }, { timestamps: true });

export const UserModel = mongoose.model("Users", UserSchema, 'Users');
// module.exports = mongoose.model('UserModel', UserSchema);
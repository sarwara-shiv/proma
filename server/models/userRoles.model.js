import mongoose,{Schema} from "mongoose";
const UserRolesSchema = new mongoose.Schema({
    "roleName": {
      "type": "String",
      "required": true,
      "unique": true
    },
    "shortName": {
      "type": "String", 
      "unique": true
    },
    "permissions": [{
      "type": "String"
    }],
    "description": {
      "type": "String"
    },
    "createdAt": {
      "type": "Date",
      "default": Date.now
    },
    "updatedAt": {
      "type": "Date",
      "default": Date.now
    }
  }, { timestamps: true });
  export const UserRolesModel = mongoose.model('UserRoles', UserRolesSchema, 'userRoles');
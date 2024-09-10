import mongoose,{Schema} from "mongoose";
const UserRolesSchema = new mongoose.Schema({
    "name": {
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
    "isEditable":{
      "type":"Boolean",
      "default":true
    },
    "updatedAt": {
      "type": "Date",
      "default": Date.now
    },
    "type":{
      "type":"string",
      "enum":["default", "created"]
    }
    
  }, { timestamps: true });
  export const UserRolesModel = mongoose.model('UserRoles', UserRolesSchema, 'userRoles');
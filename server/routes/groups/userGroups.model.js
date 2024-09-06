import mongoose,{Schema} from "mongoose";
const userGroupsSchema = new mongoose.Schema({
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
    }
  }, { timestamps: true }); 
  export const userGroupsModel = mongoose.model('userGroups', userGroupsSchema, 'userGroups');
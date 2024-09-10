import mongoose,{Schema} from "mongoose";
const userGroupsSchema = new mongoose.Schema({
    "name": {
      "type": "String",
      "required": true,
      "unique": true
    },
    "color": {
      "type": "String", 
    },
  }, { timestamps: true }); 
  export const statusModel = mongoose.model('status', userGroupsSchema, 'status');
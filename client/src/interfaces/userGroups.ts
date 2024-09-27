import { ObjectId } from 'mongodb';

// Define the TypeScript interface for the UserGroup
export interface UserGroup extends Document {
  _id?: ObjectId;      
  _cid?:string;  
  name: string;         
  displayName: string;   
  description?: string;  
  isEditable?: boolean;   
  type?: 'default' | 'created'; 
  createdAt?: Date;       
  updatedAt?: Date;    
}
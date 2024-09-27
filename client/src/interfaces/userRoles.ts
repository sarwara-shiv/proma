import { ObjectId } from 'mongodb';
import { PagePermission } from './types';

 // User Roles Interface
 export interface UserRole {
  _id?:ObjectId;
  _cid?:string;
  name: string;
  displayName?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isEditable?: boolean;
  type?: 'default' | 'created';
  permissions: PagePermission[];
}
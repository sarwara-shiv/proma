import { PermissionsMap } from "./types";
import { UserRole } from './userRoles';

// User Interface
export interface User {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  groups?: string[]; 
  roles?: string[]; 
  permissions?: PermissionsMap; 
  createdAt?: Date;
  updatedAt?: Date;
  isActive?:Boolean;
}
// User Interface
export interface UserWithRoles {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  groups?: UserRole[]; 
  roles?: UserRole[]; 
  permissions?: PermissionsMap; 
  createdAt?: Date;
  updatedAt?: Date;
  isActive?:Boolean;
}

import { PermissionsMap } from "./types";
import { UserRole } from './userRoles';

// User Interface
export interface User {
  _id?: string;
  _cid?:string;
  username: string;
  name?:string;
  email: string;
  password?: string;
  firma?:string;
  groups?: string[]; 
  roles?: string[]; 
  permissions?: PermissionsMap; 
  createdAt?: Date;
  updatedAt?: Date;
  workload?:number;
  image?:{icon:string, full:string}
  isActive?:Boolean;
}
// User Interface
export interface UserWithRoles {
  _id?: string;
  _cid?:string;
  username: string;
  name?:string;
  email: string;
  password?: string;
  groups?: UserRole[]; 
  roles?: UserRole[]; 
  permissions?: PermissionsMap; 
  createdAt?: Date;
  updatedAt?: Date;
  isActive?:Boolean;
}

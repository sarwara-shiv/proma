import { PermissionsMap } from "./types";
import { UserRole } from './userRoles';

// User Interface
export interface User {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  roles?: string[]; // Array of ObjectId references to UserRoles
  permissions?: PermissionsMap; // Map of permissions for pages
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
  roles?: UserRole[]; // Array of ObjectId references to UserRoles
  permissions?: PermissionsMap; // Map of permissions for pages
  createdAt?: Date;
  updatedAt?: Date;
  isActive?:Boolean;
}

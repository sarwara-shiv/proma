import { PermissionsMap } from "./types";

// User Interface
export interface User {
  username: string;
  email: string;
  password: string;
  roles: string[]; // Array of ObjectId references to UserRoles
  permissions: PermissionsMap; // Map of permissions for pages
  createdAt?: Date;
  updatedAt?: Date;
}

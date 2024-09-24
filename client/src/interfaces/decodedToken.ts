import { ObjectId } from "mongodb";
import { PagePermission } from "./types";
import { UserRole } from "./userRoles";

export interface DecodedToken {
    _id:ObjectId
    username?: string;  
    role?: string;        
    roles?: UserRole[];      
    permissions?: PagePermission[];      
    email?: string;       
}
  
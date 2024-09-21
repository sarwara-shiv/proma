import { PagePermission } from "./types";
import { UserRole } from "./userRoles";

export interface DecodedToken {
    username?: string;  
    role?: string;        
    roles?: UserRole[];      
    permissions?: PagePermission[];      
    email?: string;       
}
  
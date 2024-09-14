import { UserRole } from "./userRoles";

export interface DecodedToken {
    username?: string;  
    role?: string;        
    roles?: UserRole[];      
    email?: string;       
}
  
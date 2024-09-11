import { Role } from "./userRoles";

export interface DecodedToken {
    username?: string;  
    role?: string;        
    roles?: Role[];      
    email?: string;       
}
  
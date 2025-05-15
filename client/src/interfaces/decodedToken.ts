import { ObjectId } from "mongodb";
import { PagePermission } from "./types";
import { UserRole } from "./userRoles";
import { UserGroup } from "./userGroups";

export interface DecodedToken {
    _id:ObjectId
    username?: string;  
    role?: string;        
    roles?: UserRole[];    
    groups?:UserGroup[];  
    permissions?: PagePermission[];      
    email?: string;       
}
  
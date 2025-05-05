import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { checkAuthStatus } from "./login";
import { DecodedToken, PagePermission, UserRole } from "../interfaces";

// Define the interface for the user data (DecodedToken)

// Define the AuthContext type
interface AuthContextType {
  user: DecodedToken | null;
  role: string | null;
  roles: UserRole[];
  isAdmin:boolean;
  isEmployee:boolean;
  isClient:boolean;
  slug:string;
  isManager:boolean;
  isScrumMaster:boolean;
  isTeamLeader:boolean;
  isCustomRole:boolean;
  isAuthenticated: boolean;
  permissions:PagePermission[] | []
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<DecodedToken | null>>;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
  setRoles: React.Dispatch<React.SetStateAction<UserRole[]>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setPermissions: React.Dispatch<React.SetStateAction<PagePermission[] | []>>;
}

// Create AuthContext with the correct type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [slug, setSlug] = useState<string>('users');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isManager, setIsManager] = useState<boolean>(false);
    const [isEmployee, setIsEmployee] = useState<boolean>(false);
    const [isClient, setIsClient] = useState<boolean>(false);
    const [isScrumMaster, setIsScrumMaster] = useState<boolean>(false);
    const [isTeamLeader, setIsTeamLeader] = useState<boolean>(false);
    const [isCustomRole, setIsCustomRole] = useState<boolean>(false);
    const [permissions, setPermissions] = useState<PagePermission[] | []>([]);

    // Check authentication status on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await checkAuthStatus(); // This will make an API call to verify token and fetch user data
                console.log(userData.data);
                if (userData.data) {
                    setUser(userData.data); // Set user info
                    setRoles(userData.data.roles);
                    setRole(userData.data.role);
                    setPermissions(userData.data.permissions);
                    setIsAuthenticated(true);

                    // SET ROLES
                    if(userData.data.roles && userData.data.roles.length > 0){
                        setIsAdmin(userData.data.roles.some((role:UserRole) => role.name === 'admin'));
                        setIsManager(userData.data.roles.some((role:UserRole) => role.name === 'manager'));
                        setIsEmployee(userData.data.roles.some((role:UserRole) => role.name === 'employee'));
                        setIsClient(userData.data.roles.some((role:UserRole) => role.name === 'client'));
                        setIsScrumMaster(userData.data.roles.some((role:UserRole) => role.name === 'scrumMaster'));
                        setIsTeamLeader(userData.data.roles.some((role:UserRole) => role.name === 'teamLeader'));
                        if(!isAdmin && !isManager && !isEmployee && !isClient && !isScrumMaster && !isTeamLeader){
                            setIsCustomRole(true);
                        }

                        if(userData.data.roles.some((role:UserRole) => role.name === 'admin')){
                            setSlug('admin');
                        }
                        if(userData.data.roles.some((role:UserRole) => role.name === 'client')){
                            setSlug('client');
                        }
                    }

                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                // In case of error, clear the state and set to unauthenticated
                setUser(null);
                setRoles([]);
                setRole(null);
                setPermissions([]);
                setIsAuthenticated(false);
                setIsAdmin(false);
                setIsManager(false);
                setIsEmployee(false);
                setIsClient(false);
                setIsScrumMaster(false);
                setIsTeamLeader(false);
                setIsCustomRole(false);
            } finally {
                setLoading(false); // Set loading state to false after data fetching is complete
            }
        };
    
        fetchUser();
    }, []);
    

    return (
        <AuthContext.Provider value={{ 
            permissions, 
            user,
            slug, 
            role, 
            isAuthenticated, 
            roles, 
            loading,
            isAdmin,
            isClient,
            isManager,
            isCustomRole,
            isEmployee,
            isScrumMaster,
            isTeamLeader, 
            setUser, 
            setRole, 
            setRoles, 
            setIsAuthenticated, 
            setPermissions 
            }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access authentication state
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};

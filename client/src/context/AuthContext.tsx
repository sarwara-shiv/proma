import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { checkAuthStatus } from "./login";
import { DecodedToken, PagePermission, UserRole } from "../interfaces";

// Define the interface for the user data (DecodedToken)

// Define the AuthContext type
interface AuthContextType {
  user: DecodedToken | null;
  role: string | null;
  roles: UserRole[];
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [permissions, setPermissions] = useState<PagePermission[] | []>([]);

    // Check authentication status on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await checkAuthStatus();
                setUser(userData);
                setRoles(userData.roles);
                setRole(userData.role);
                setIsAuthenticated(true);
                setPermissions(userData.permissions);
            } catch {
                setUser(null);
                setRoles([]);
                setRole(null);
                setIsAuthenticated(false);
                setPermissions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            permissions, 
            user, 
            role, 
            isAuthenticated, 
            roles, 
            loading, 
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

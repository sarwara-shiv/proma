import { useTranslation } from "react-i18next";
import {Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from "./pages/auth/Login";
import { useAuth } from "./hooks/useAuth";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import Unauthorised from "./pages/Unauthorised";
import ResetPassword from "./pages/auth/ResetPassword";
import './assets/styles/layout.css';
function App() {
  const {t} = useTranslation("common");
  const {isAuthenticated, role, roles} = useAuth();
  const isAdmin = roles?.some(role => role.name.toLowerCase() === 'admin');
  return (
    <div className="App bg-gray-50 min-h-screen">
      <Router>
        <Routes >
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
            {isAdmin && (
              <Route path="/admin/*" element={isAuthenticated ? <AdminRoutes /> : <Navigate to="/unauthorized" />} />
            )}
            {!isAdmin && (
              <Route path="/user/*" element={isAuthenticated ? <UserRoutes /> : <Navigate to="/unauthorized" />} />
            )}
          
          {/* Unauthorised page */}
          <Route path="/unauthorized" element={<Unauthorised />} />
          {/* Unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </div> 
  );
}

export default App;  

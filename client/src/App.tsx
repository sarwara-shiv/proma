import { useTranslation } from "react-i18next";
import {Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from "./pages/auth/Login";
import { useAuth } from "./hooks/useAuth";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import Unauthorised from "./pages/Unauthorised";
function App() {
  const {t} = useTranslation("common");
  const {isAuthenticated, role} = useAuth();
  return (
    <div className="App bg-gray-100 h-screen">
      <Router>
        <Routes >
          <Route path="/login" element={<Login />} />
            {role === 'admin' && (
              <Route path="/admin/*" element={isAuthenticated ? <AdminRoutes /> : <Navigate to="/unauthorized" />} />
            )}
            {!role || role !== 'admin' && (
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

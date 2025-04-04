import { useTranslation } from "react-i18next";
import {Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from "./pages/auth/Login";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import Unauthorised from "./pages/Unauthorised";
import ResetPassword from "./pages/auth/ResetPassword";
import './assets/styles/layout.css';
import {useAuthContext } from "./context/AuthContext";
function App() {
  const {t} = useTranslation("common");
  const {isAuthenticated, role, roles, user, loading} = useAuthContext();
  console.log(user);
  const isAdmin = roles?.some(role => role.name.toLowerCase() === 'admin');
  console.log(isAdmin);
  console.log(isAuthenticated);
   // If the app is loading user data, show a loading spinner or some placeholder
   if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="App min-h-screen">
     <Router>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {isAdmin && (
              <Route path="/admin/*" element={isAuthenticated ? <AdminRoutes /> : <Navigate to="/unauthorized" />} />
          )}
          {!isAdmin && (
              <Route path="/user/*" element={isAuthenticated ? <UserRoutes /> : <Navigate to="/unauthorized" />} />
          )}
          <Route path="/unauthorized" element={<Unauthorised />} />
          <Route path="*" element={<Navigate to="/login" />} />
          {/* <Route path="*" element={<Navigate to={isAuthenticated ? isAdmin ? "/admin" : "/user" : "/login"} />} /> */}
      </Routes>
  </Router>
    </div> 
  );
}

export default App;  

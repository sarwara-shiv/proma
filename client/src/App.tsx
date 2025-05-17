import { useTranslation } from "react-i18next";
import {Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from "./pages/auth/Login";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import Unauthorised from "./pages/Unauthorised";
import ResetPassword from "./pages/auth/ResetPassword";
import './assets/styles/layout.css';
import {useAuthContext } from "./context/AuthContext";
import Messenger from "./pages/messenger/Messenger";
function App() {
  const {t} = useTranslation("common");
  const {isAuthenticated, role, roles, user, loading, isAdmin, isManager} = useAuthContext();
   // If the app is loading user data, show a loading spinner or some placeholder
   if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="App min-h-screen flex justify-center bg-gray-100 ">
     <Router>
      <Routes>
          <Route path="/login" element={<Login />} />
          {isAuthenticated && 
            <Route path="/messenger" element={<Messenger/>} />
          }
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {(isAdmin || isManager) && (
              <Route path="/*" element={isAuthenticated ? <AdminRoutes /> : <Navigate to="/login" />} />
          )}
          {!isAdmin && !isManager &&  (
              <Route path="/*" element={isAuthenticated ? <UserRoutes /> : <Navigate to="/login" />} />
          )}
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/unauthorized" element={<Unauthorised />} />
          {/* <Route path="*" element={<Navigate to={isAuthenticated ? isAdmin ? "/admin" : "/user" : "/login"} />} /> */}
      </Routes>
  </Router>
    </div> 
  );
}

export default App;  

import UserLayouot from "../components/layout/UserLayouot";
import { Routes, Route } from "react-router-dom";
const UserRoutes = () => {
  return (
    <Routes>
    <Route path="/" element={<UserLayouot />}>
    </Route>
  </Routes>
  )
}

export default UserRoutes

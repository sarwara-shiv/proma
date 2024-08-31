import LoginForm from "../../components/auth/LoginForm"
import { useAuth } from "../..//hooks/useAuth";

const Login = () => {
  const {isAuthenticated, role} = useAuth();
  return (
    <div className="flex flex-col min-w-full min-h-full justify-center align-center items-center p-4">
      roleis : {role}
      <LoginForm />
    </div>
  )
}

export default Login

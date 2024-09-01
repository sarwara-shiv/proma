import React from 'react'
import {useCookies} from 'react-cookie';
import {useNavigate} from 'react-router-dom';

const LogoutButton = () => {
    const[cookies, setCookies] = useCookies(["access_token"]);
    const navigate = useNavigate();
    const logout = ()=>{
        setCookies("access_token", "");
        window.localStorage.removeItem("userID");
        navigate("/auth");
    }
    return <div className="">
    <button onClick={logout} className='btn btn-solid'>Logout</button>
    </div>
}

export default LogoutButton


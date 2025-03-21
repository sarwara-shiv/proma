import Logo from '../../common/Logo';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { MdClose, MdMenu } from 'react-icons/md';
import { useAppContext } from '../../../context/AppContext';
import {useAuthContext } from '../../../context/AuthContext';
import LogoutButton from '../../../components/auth/LogoutButton';

const UserHeader = () => {
    const { isSidebarOpen, setIsSidebarOpen, pageTitle } = useAppContext();
    const { user } = useAuthContext();
    const {t} = useTranslation()
    // Function to toggle sidebar for small screens
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Adjust sidebar state based on screen size
    useEffect(() => {
        // Function to check screen width and adjust sidebar state
        const handleResize = () => {
            if (window.innerWidth >= 640) {  
                // Automatically close sidebar for larger screens
                setIsSidebarOpen(true);
            } else {
                // Automatically open sidebar for smaller screens
                setIsSidebarOpen(false);
            }
        };

        // Initial check on component mount
        handleResize();

        // Add event listener to handle resize
        window.addEventListener("resize", handleResize);

        // Cleanup event listener when the component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [setIsSidebarOpen]); // Empty dependency array ensures this runs on mount
    return (
        <header className="bg-primary-light text-gray-900 w-full px-5 py-5 w-full top-0 left-0 right-0 z-30">
                <div className="container  min-w-full flex items-center justify-between px-2">
                    <div className="left-nav flex items-center space-x-2">
                   
                        <div className="text-lg font-semibold flex justify-start gap-2 items-center">
                            <button
                                onClick={toggleSidebar}
                                className={`text-parimary-dark w-[30px] flex justify-center items-center py-1 text-xl bg-white
                                    rounded-sm hover:bg-primary-dark hover:text-white transition-colors duration-200
                                    `}
                            >
                                {isSidebarOpen ? <MdClose /> : <MdMenu /> }
                            </button>
                            <Logo />
                        </div>
                        {/* <span>{t('adminPanel')}</span> */}
                    </div>
                    <div className="text-sm flex gap-2">
                        <span>
                            <span className="text-primary font-bold">{t('hello')} </span>
                            {user?.username && <>{user.username}</>}
                        </span> |
                        <div><LogoutButton type='link'/></div>
                    </div>
                </div>
            </header>
    )
}

export default UserHeader
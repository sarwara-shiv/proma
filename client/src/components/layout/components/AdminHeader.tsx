
import Logo from '../../common/Logo';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { MdClose, MdMenu } from 'react-icons/md';
import { useAppContext } from '../../../context/AppContext';
import {useAuthContext } from '../../../context/AuthContext';
import LogoutButton from '../../../components/auth/LogoutButton';

const AdminHeader = () => {
    const { isSidebarOpen, setIsSidebarOpen, pageTitle } = useAppContext();
    const { t } = useTranslation();
    const {user} = useAuthContext();
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
        <header className="text-gray-900 w-full px-4 py-1 mb-2 w-full top-1 left-0 right-0 z-30 flex justify-between ">
            <div className="text-lg font-semibold flex justify-start gap-2 items-center">
                <button
                    onClick={toggleSidebar}
                    className={`mt-0 text-parimary-dark w-[30px] flex justify-center items-center py-0 text-3xl bg-white
                        rounded-sm hover:bg-primary-dark hover:text-white transition-colors duration-200 font-800
                        `}
                >
                    {isSidebarOpen ? <MdClose /> : <MdMenu /> }
                </button>
                <Logo />

                <div className='border-l-2 border-slate-400 ml-2 pl-4 font-bold text-2xl text-slate-700'>
                    {pageTitle}
                </div>
            </div>
            <div className="text-sm flex gap-2">
                    <span>
                        <span className="text-primary font-bold">{t('hello')} </span>
                        {user?.username && <>{user.username}</>}
                    </span> 
                    {/* | */}
                    {/* <div className='font-bold text-md'><LogoutButton type='link'/></div> */}
            </div>
            {/* <div className="container  min-w-full flex items-center justify-between px-2">
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
                </div>
                <div className="text-sm flex gap-2">
                    <span>
                        <span className="text-primary font-bold">{t('hello')} </span>
                        {user?.username && <>{user.username}</>}
                    </span> |
                    <div><LogoutButton type='link'/></div>
                </div>
            </div> */}
        </header>
    )
}

export default AdminHeader
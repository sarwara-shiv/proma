import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { MdClose, MdMenu } from 'react-icons/md';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import Footer from './components/AdminFooter';
import { useAppContext } from '../../context/AppContext';
import UserHeader from './components/UserHeader';
import UserSidebar from './components/UserSidebar';

const Layout = () => {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const {isSidebarOpen, setIsSidebarOpen} = useAppContext()
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };
    return (
        <div className="layout h-screen flex flex-col">
        {/* Header (Fixed Below Top Menu Bar) */}
        {role === 'admin' ? <AdminHeader /> : <UserHeader />}
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-y-auto mb-8">
            {/* Sidebar Toggle Button */}

            {/* Sidebar (Conditionally render based on state) */}
            {/* {isSidebarOpen && (
            )} */}
            {role === 'admin' ? <AdminSidebar /> : <UserSidebar />}
            {/* Main Content */}
            <main className={`flex-1 ml-64 mt-0 mb-14 px-2 transition-all ease duration-100 ${isSidebarOpen ? "ml-[200px]" : "ml-[0px]"}`}>
                <Outlet />
            </main>
        </div>

        {/* Footer (Fixed at Bottom) */}
        <Footer/>
        </div>
    );
};

export default Layout;

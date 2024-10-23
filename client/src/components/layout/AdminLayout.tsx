import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navigation/AdminNavbar';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { MdClose, MdMenu } from 'react-icons/md';

const AdminLayout = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Topbar */}
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
                    <div className="text-sm">
                        <span className="text-primary font-bold">Hi </span>
                        {user?.username && <>{user.username}</>}
                    </div>
                </div>
            </header>

            {/* Main content wrapper */}
            <div className="flex flex-1 overflow-hidden min-screen"> {/* mt-16 to offset for the fixed header */}
                {/* Sidebar */}
                <aside className={`bg-gray-50 w-64 max-h-[100vh] top-0 bottom-0 absolute shadow-none z-20 pt-20 pb-10
                    transition-all duration-200 ease
                        ${isSidebarOpen ? 'translate-x-0 left-0' : '-translate-x-full -left-64'}
                    `}>
                    <div className='py-4 h-full border-r border-gray-200'>
                        <AdminNavbar />
                    </div>
                </aside>
                {/* Main Content */}
                <main className={`flex-1 bg-gray-100 overflow-y-auto 
                    transition-all duration-200 ease
                     ${isSidebarOpen ? 'ml-64' : 'ml-0'}
                    `}>
                  <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

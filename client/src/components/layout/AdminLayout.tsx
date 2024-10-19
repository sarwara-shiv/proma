import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navigation/AdminNavbar';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    return (
        <div className="flex flex-col bg-gray-100">
            {/* Topbar */}
            <header className="bg-primary-light text-gray-900 w-full px-5 py-5 fixed top-0 left-0 right-0 z-30">
                <div className="container  min-w-full flex items-center justify-between px-2">
                    <div className="left-nav flex items-center space-x-2">
                        <div className="text-lg font-semibold">
                            <Logo />
                        </div>
                        <span>{t('adminPanel')}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-primary font-bold">Hi </span>
                        {user?.username && <>{user.username}</>}
                    </div>
                </div>
            </header>

            {/* Main content wrapper */}
            <div className="flex flex-1 mt-13"> {/* mt-16 to offset for the fixed header */}
                {/* Sidebar */}
                <aside className="bg-gray-50 w-64 h-full shadow-none fixed top-16 left-0 z-20">
                    <div className='py-4 h-full border-r border-gray-200'>
                        <AdminNavbar />
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 pt-16 ml-64 p-70 overflow-auto">
                  <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

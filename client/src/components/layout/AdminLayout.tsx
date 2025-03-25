import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import Footer from './components/AdminFooter';
import { useAppContext } from '../../context/AppContext';
import ActiveWorkLog from './components/ActiveWorkLog';

const AdminLayout = () => {
    const { t } = useTranslation();
    const {isSidebarOpen} = useAppContext();
    return (
        <div className="layout h-screen flex flex-col">
        {/* Header (Fixed Below Top Menu Bar) */}
        <AdminHeader />
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-y-auto mb-8">
            {/* Sidebar Toggle Button */}

            {/* Sidebar (Conditionally render based on state) */}
            {/* {isSidebarOpen && (
            )} */}
            <AdminSidebar /> 

            {/* Main Content */}
            <main className={`flex-1 ml-64 mt-0 mb-10 overflow-x-hidden overflow-y-auto transition-all ease duration-100 ${isSidebarOpen ? "ml-[200px]" : "ml-[0px]"}`}> 
                <div>
                    <Outlet />
                </div>
            </main>
        </div>
        <ActiveWorkLog />
        {/* Footer (Fixed at Bottom) */}
        <Footer/>
        </div>
    );
};

export default AdminLayout;

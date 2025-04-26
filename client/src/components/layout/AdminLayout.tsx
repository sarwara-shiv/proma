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
        <div className="rounded-lg relative layout h-screen flex flex-col max-w-[1600px] m-x-auto bg-white w-full">
        {/* Header (Fixed Below Top Menu Bar) */}
        <AdminHeader />
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-y-auto mb-0">
            {/* Sidebar Toggle Button */}

            {/* Sidebar (Conditionally render based on state) */}
            {/* {isSidebarOpen && (
            )} */}
            <AdminSidebar /> 

            {/* Main Content */}
            <main className={`flex-1 pl-3 ml-1 mt-0 mb-0 overflow-x-hidden overflow-y-auto transition-all ease duration-100 ${isSidebarOpen ? "ml-1" : "ml-[0px]"}`}> 
                <div>
                    <Outlet />
                </div>
            </main>
        </div>
        <ActiveWorkLog />
        {/* Footer (Fixed at Bottom) */}
        {/* <Footer/> */}
        </div>
    );
};

export default AdminLayout;

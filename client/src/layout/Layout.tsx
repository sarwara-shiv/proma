import { Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import HeaderLayout from './components/HeaderLayoout';
import SidebarLayout from './components/SidebarLayout';

const Layout = () => {
    const {isSidebarOpen} = useAppContext()
    return (
        <>
            <div className="rounded-lg relative layout h-screen flex flex-col max-w-[1980px] m-x-auto bg-white w-full">
                <HeaderLayout />
                <div className="flex flex-1 overflow-y-auto mb-0">
                    {/* {role === 'admin' ? <AdminSidebar /> : <UserSidebar />} */}
                    <SidebarLayout />
                    <main className={`flex-1 pl-3 ml-1 mt-0 mb-0  overflow-x-hidden overflow-y-auto transition-all ease duration-100 ${isSidebarOpen ? "ml-1" : "ml-[0px]"}`}> 
                        <div className='min-h-[calc(100dvh_-70px)]'>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Layout;

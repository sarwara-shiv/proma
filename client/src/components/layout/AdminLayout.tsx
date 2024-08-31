import { Outlet } from 'react-router-dom';
import AdminNavbar from '../admin/AdminNavbar';
import { useAuth } from '../../hooks/useAuth';

interface userType{
    email:string;
    username:string;
}

const AdminLayout = () => {
    const {role, user} = useAuth();
    console.log("user------------",user);
  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <header className="bg-primary text-white w-full px-4 py-4 fixed top-0 left-0 z-30"> 
        <div className="container mx-auto flex items-center justify-between">
          <div className="left-nav">
            <div className='logo '>
               <span className='text-lg font-semibold'>PROMA</span>   <span>Admin Panel</span>
            </div>
          </div>
          <div className="">
                <span>Hi </span>
                {user?.username && <>{user.username}</>}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 pt-16"> {/* Offset main content for fixed topbar */}
        {/* Sidebar */}
        <aside className="bg-white w-64 h-full border-r border-gray-200 shadow-md">
            <AdminNavbar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

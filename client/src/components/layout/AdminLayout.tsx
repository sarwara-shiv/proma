import React from 'react'
import { Outlet, Link } from 'react-router-dom';
import AdminNavbar from '../admin/AdminNavbar';

const AdminLayout = () => {
  return (
    <div className='admin-layout'>
        <aside className="sidebar bg-white fixed top-0 left-0 z-40 w-40 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
            <AdminNavbar />
        </aside>
        <main className="content p-4 sm:ml-64">
            <Outlet /> 
        </main>
    </div>
  )
}

export default AdminLayout

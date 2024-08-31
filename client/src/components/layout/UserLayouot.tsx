import React from 'react'
import { Outlet, Link } from 'react-router-dom';
const UserLayouot = () => {
  return (
    <div>
       <div className='admin-layout'>
        <aside className="sidebar fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
            <nav>
                <ul>
                    <li><Link to="/admin/roles">Roles</Link></li>
                    <li><Link to="/admin/roles/add">Add Roles</Link></li>
                </ul>
            </nav>
        </aside>
        <main className="content p-4 sm:ml-64">
            <Outlet /> {/* This will render the selected admin page */}
        </main>
    </div>
    </div>
  )
}

export default UserLayouot

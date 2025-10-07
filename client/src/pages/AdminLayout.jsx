import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { RealtimeProvider } from '../context/RealtimeContext.jsx'

function useAdmin(){
  const token = localStorage.getItem('adminToken')
  const admin = JSON.parse(localStorage.getItem('admin')||'null')
  return useMemo(()=> ({ token, admin }), [token, admin])
}

function AdminContent(){
  const { token, admin } = useAdmin()
  const navigate = useNavigate()
  
  if(!token){ return <Navigate to="/admin" replace /> }
  
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <div className="navbar bg-base-100 border-b">
        <div className="navbar-start px-3 font-bold">Admin Panel</div>
        <div className="navbar-center"></div>
        <div className="navbar-end px-3 text-sm flex items-center gap-2">
          <span className="hidden sm:inline">{admin?.name} ({admin?.userId})</span>
          <button
            className="btn btn-sm btn-error"
            onClick={() => {
              localStorage.removeItem('adminToken')
              localStorage.removeItem('admin')
              navigate('/admin', { replace: true })
            }}
          >Logout</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[220px,1fr]">
        <aside className="border-b md:border-b-0 md:border-r p-3 space-y-1 text-sm flex md:block overflow-x-auto">
          <NavLink to="/admin/dashboard" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Dashboard</NavLink>
          <NavLink to="/admin/users" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>User Management</NavLink>
          <NavLink to="/admin/stations" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Umbrella Station Management</NavLink>
          <NavLink to="/admin/inventory" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Umbrella Inventory</NavLink>
          <NavLink to="/admin/transactions" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Transactions & Wallet</NavLink>
          <NavLink to="/admin/ads" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Advertisements Management</NavLink>
          <NavLink to="/admin/reports" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Reports & Analytics</NavLink>
          <NavLink to="/admin/settings" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Settings</NavLink>
        </aside>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout(){
  return (
    <RealtimeProvider>
      <AdminContent />
    </RealtimeProvider>
  )
}





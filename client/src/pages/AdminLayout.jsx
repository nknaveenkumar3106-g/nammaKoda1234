import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  
  if(!token){ return <Navigate to="/admin" replace /> }
  
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]" data-theme="light">
      <div className="navbar bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm">
        <div className="navbar-start px-3 flex items-center gap-2">
          <button className="btn btn-ghost btn-square md:hidden" onClick={()=>setMenuOpen(v=>!v)} aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="font-bold">Admin Panel</div>
        </div>
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
        <aside className={`border-b md:border-b-0 md:border-r p-3 space-y-1 text-sm md:block ${menuOpen? 'block' : 'hidden'} md:!block`}> 
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/dashboard" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Dashboard</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/users" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>User Management</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/stations" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Umbrella Station Management</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/inventory" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Umbrella Inventory</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/transactions" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Transactions & Wallet</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/ads" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Advertisements Management</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/reports" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Reports & Analytics</NavLink>
          <NavLink onClick={()=>setMenuOpen(false)} to="/admin/settings" className={({isActive})=>`block px-2 py-2 rounded ${isActive?'bg-base-200':''}`}>Settings</NavLink>
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





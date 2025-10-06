import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { makeWhiteTransparent } from '../lib/logoUtils.js'
import { useWeather } from '../context/WeatherContext.jsx'

export default function TabsLayout() {
  const weather = useWeather()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  function handleNavClick() {
    setIsMobileMenuOpen(false)
  }
  
  return (
    <div className={`min-h-screen flex flex-col ${weather.condition==='rainy' ? 'bg-weather-rain' : weather.condition==='sunny' ? 'bg-weather-sun' : 'bg-weather-cloudy'}`}>
      <div className="navbar bg-base-100 border-b sticky top-0 z-50">
        <div className="navbar-start px-2 font-bold flex items-center gap-2">
          {/* Mobile hamburger menu on the left */}
          <div className="md:hidden dropdown dropdown-start">
            <div tabIndex={0} role="button" className="btn btn-ghost" onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </div>
            <ul tabIndex={0} className={`menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] w-40 p-2 shadow ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
              <li><NavLink to="/app" end onClick={handleNavClick}>Home</NavLink></li>
              <li><NavLink to="/app/map" onClick={handleNavClick}>Map</NavLink></li>
              <li><NavLink to="/app/history" onClick={handleNavClick}>History</NavLink></li>
              <li><NavLink to="/app/profile" onClick={handleNavClick}>Profile</NavLink></li>
            </ul>
          </div>
          <BrandLogo />
        </div>
        <div className="navbar-center">
          <div role="tablist" className="tabs tabs-bordered hidden md:flex">
            <NavLink to="/app" end role="tab" className={({isActive})=> `tab ${isActive? 'tab-active':''}`}>Home</NavLink>
            <NavLink to="/app/map" role="tab" className={({isActive})=> `tab ${isActive? 'tab-active':''}`}>Map</NavLink>
            <NavLink to="/app/history" role="tab" className={({isActive})=> `tab ${isActive? 'tab-active':''}`}>History</NavLink>
            <NavLink to="/app/profile" role="tab" className={({isActive})=> `tab ${isActive? 'tab-active':''}`}>Profile</NavLink>
          </div>
        </div>
        <div className="navbar-end">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1 p-4">
        <Outlet />
      </div>
      {/* Mobile bottom nav removed as requested; hamburger menu handles navigation */}
    </div>
  )
}

function ThemeToggle(){
  const [isOpen, setIsOpen] = useState(false)
  
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    setIsOpen(false) // Close dropdown after selection
  }
  
  return (
    <details className="dropdown dropdown-end" open={isOpen} onToggle={(e)=>setIsOpen(e.target.open)}>
      <summary className="btn btn-ghost">Theme</summary>
      <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        {['light','dark','cupcake','emerald','synthwave'].map(t=> (
          <li key={t}><button onClick={()=>setTheme(t)}>{t}</button></li>
        ))}
      </ul>
    </details>
  )
}

function BrandLogo(){
  const raw = import.meta.env.VITE_LOGO_URL || '/logo.png'
  const [src, setSrc] = useState(raw)
  useEffect(()=>{ makeWhiteTransparent(raw, 245).then(setSrc) }, [raw])
  return (
    <div className="flex items-center relative logo-animated">
      <img src={src} alt="nammaKodai" className="h-7 md:h-9 object-contain" onError={(e)=>{e.currentTarget.style.display='none'}} />
      <span className="logo-shine" aria-hidden="true"></span>
    </div>
  )
}



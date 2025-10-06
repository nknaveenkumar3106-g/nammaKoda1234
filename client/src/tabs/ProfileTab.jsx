import { useMemo, useState, useEffect } from 'react'
import RechargeModal from '../components/RechargeModal.jsx'
import EditProfileModal from '../components/EditProfileModal.jsx'
import AdPlaceholder from '../components/AdPlaceholder.jsx'
import { authAPI } from '../lib/api.js'
import { walletAPI } from '../lib/api.js'

export default function ProfileTab(){
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('user') || '{}'))
  const [showRecharge, setShowRecharge] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const name = user?.name || 'User'
  const role = user?.role || 'new_user'
  const badge = role === 'admin' ? 'badge-error' : role === 'existing_user' ? 'badge-success' : role === 'explorer' ? 'badge-info' : 'badge-warning'
  const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()
  const [activeTab, setActiveTab] = useState('profile')

  function handleRechargeSuccess(data){
    const updatedUser = { ...user, wallet: data }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  function handleProfileSuccess(updatedUser){
    setUser(updatedUser)
  }

  // Refresh wallet after signup/payment redirects
  useEffect(()=>{
    (async ()=>{
      try{
        const params = new URLSearchParams(location.search)
        const depositParam = params.get('depositAmount')
        if(depositParam){
          const amount = Number(depositParam)
          if(!Number.isNaN(amount) && amount>0){
            await walletAPI.deposit(amount)
          }
          params.delete('depositAmount')
          const newUrl = `${location.pathname}${params.toString()?`?${params.toString()}`:''}`
          history.replaceState(null, '', newUrl)
        }
        const latest = await walletAPI.getBalance()
        const updatedUser = { ...(JSON.parse(localStorage.getItem('user')||'{}')), wallet: { balance: latest.balance, currency: latest.currency }, transactions: latest.transactions }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }catch{}
    })()
  },[])
  
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="glass-strong rounded-2xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={()=>history.back()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="font-bold">Profile Settings</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={()=>localStorage.clear() && location.reload()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6z"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-16">
                <span className="text-xl">{initials}</span>
              </div>
            </div>
            <div>
              <div className="text-xl font-bold">{name}</div>
              <div className={`badge ${badge} mt-1`}>{role}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="opacity-70">Email:</span><span>{user?.email || 'N/A'}</span></div>
            <div className="flex justify-between items-center">
              <span className="opacity-70">Balance:</span>
              <div className="flex items-center gap-2">
                <span>₹{user?.wallet?.balance || 0}</span>
                <span className="text-xs opacity-70">({user?.wallet?.balance || 0} coins)</span>
                <button className="btn btn-xs btn-primary" onClick={()=>setShowRecharge(true)}>
                  Recharge
                </button>
              </div>
            </div>
            <div className="flex justify-between"><span className="opacity-70">Member since:</span><span>Jan 2025</span></div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="text-lg font-bold mb-3">Appearance</div>
          <div className="space-y-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Theme</span></label>
              <select className="select select-bordered" defaultValue={localStorage.getItem('theme') || 'light'} onChange={(e)=>{document.documentElement.setAttribute('data-theme', e.target.value);localStorage.setItem('theme', e.target.value)}}>
                {['light','dark','cupcake','emerald','synthwave'].map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Language</span></label>
              <select className="select select-bordered" defaultValue="en">
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="text-lg font-bold mb-3">Quick Stats</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-base-100 rounded">
              <span className="text-sm">Total Borrows</span>
              <span className="badge badge-primary">12</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-base-100 rounded">
              <span className="text-sm">Active Sessions</span>
              <span className="badge badge-success">1</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-base-100 rounded">
              <span className="text-sm">Penalties</span>
              <span className="badge badge-warning">2</span>
            </div>
          </div>
        </div>
      </div>

      <AdPlaceholder />

      <div className="glass-strong rounded-2xl p-4">
        <div className="text-lg font-bold mb-3">Account Actions</div>
        <div className="grid gap-3 md:grid-cols-2">
          <button className="btn btn-outline justify-start" onClick={()=>setShowEditProfile(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Edit Profile
          </button>
          <button className="btn btn-outline justify-start">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path><path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path><path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path></svg>
            Privacy Settings
          </button>
          <button className="btn btn-outline justify-start">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"></path><path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path><path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path></svg>
            Notifications
          </button>
          <button className="btn btn-outline justify-start text-error" onClick={async ()=>{
            if(!confirm('Delete account? Your coins will be refunded.')) return
            try{
              const res = await authAPI.deleteAccount()
              localStorage.clear()
              if(res?.refundUrl){ location.href = res.refundUrl } else { alert(`Refund ₹${res?.refundAmount||0} initiated`) }
            }catch(err){ alert(err?.response?.data?.error || 'Delete failed') }
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6z"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete Account
          </button>
          <button className="btn btn-outline justify-start" onClick={()=>{ localStorage.clear(); location.href='/' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21V8l-7 7"></path><path d="M16 3h5v5"></path><path d="M21 3l-7 7"></path></svg>
            Logout
          </button>
        </div>
      </div>

      <AdPlaceholder />
      <RechargeModal 
        isOpen={showRecharge} 
        onClose={()=>setShowRecharge(false)} 
        onSuccess={handleRechargeSuccess}
      />
      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={()=>setShowEditProfile(false)} 
        onSuccess={handleProfileSuccess}
        user={user}
      />
    </div>
  )
}



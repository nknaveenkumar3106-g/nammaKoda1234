import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../lib/api.js'

export default function AdminLogin(){
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [accessPassword, setAccessPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [newPass, setNewPass] = useState('')
  const [addMsg, setAddMsg] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    (async()=>{
      try{
        setSeeding(true)
        await adminAPI.seedInitial()
      }catch{}finally{ setSeeding(false) }
    })()
  },[])

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    try{
      const data = await adminAPI.login(userId, password)
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      navigate('/admin/dashboard')
    }catch(err){
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Admin Login</h2>
          {seeding && <div className="text-xs opacity-60">Preparing admin...</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-3">
            <input className="input input-bordered w-full" placeholder="User ID" value={userId} onChange={(e)=>setUserId(e.target.value)} />
            <input className="input input-bordered w-full" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="btn btn-primary w-full" type="submit">Login</button>
          </form>
          <div className="divider text-xs">or</div>
          <button className="btn btn-outline w-full" onClick={()=>navigate('/login')}>Back to user login</button>
          <div className="mt-4">
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(v=>!v)}>Add new admin</button>
            {showAdd && (
              <div className="mt-2 space-y-2 text-sm">
                <div className="alert alert-info text-xs">Requires existing admin to be logged in and access password.</div>
                <input className="input input-bordered w-full" placeholder="Access Password (N3021K)" value={accessPassword} onChange={(e)=>setAccessPassword(e.target.value)} />
                <div className="grid grid-cols-1 gap-2">
                  <input className="input input-bordered w-full" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} />
                  <input className="input input-bordered w-full" placeholder="User ID" value={newUserId} onChange={(e)=>setNewUserId(e.target.value)} />
                  <input className="input input-bordered w-full" placeholder="Password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
                </div>
                <button className="btn btn-primary w-full" onClick={async()=>{
                  setAddMsg('')
                  try{
                    const data = await adminAPI.addAdmin(accessPassword, newName, newUserId, newPass, 'admin')
                    setAddMsg(`Added admin ${data?.admin?.name || newName}`)
                    setNewName(''); setNewUserId(''); setNewPass(''); setAccessPassword('')
                  }catch(err){ setAddMsg(err?.response?.data?.error || 'Failed') }
                }}>Add Admin</button>
                {addMsg && <div className="text-xs opacity-80">{addMsg}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



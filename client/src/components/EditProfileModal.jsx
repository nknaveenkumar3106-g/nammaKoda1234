import { useState, useEffect } from 'react'
import { authAPI } from '../lib/api.js'

export default function EditProfileModal({ isOpen, onClose, onSuccess, user }){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [isOpen, user])

  async function handleSave(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const data = await authAPI.updateProfile(name, email)
      onSuccess(data.user)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
        
        {error && <div className="alert alert-error mb-4">{error}</div>}
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered" 
              value={name} 
              onChange={(e)=>setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              type="email" 
              className="input input-bordered" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { walletAPI } from '../lib/api.js'

export default function RechargeModal({ isOpen, onClose, onSuccess }){
  const [amount, setAmount] = useState('100')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const predefinedAmounts = [50, 100, 200, 500, 1000]

  async function handleRecharge(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const data = await walletAPI.deposit(Number(amount))
      onSuccess(data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Recharge failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Funds</h3>
        
        {error && <div className="alert alert-error mb-4">{error}</div>}
        
        <form onSubmit={handleRecharge} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount (₹)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered" 
              value={amount} 
              onChange={(e)=>setAmount(e.target.value)}
              min="10"
              max="10000"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Quick Select</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  className={`btn btn-sm ${amount == amt ? 'btn-primary' : 'btn-outline'}`}
                  onClick={()=>setAmount(amt.toString())}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
          
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

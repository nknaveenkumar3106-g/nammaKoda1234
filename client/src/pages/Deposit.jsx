import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { walletAPI } from '../lib/api'

export default function Deposit() {
  const [amount, setAmount] = useState('200')
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function fetchBalance() {
    try {
      const data = await walletAPI.getBalance()
      setBalance(data.balance)
    } catch {}
  }

  useEffect(() => { fetchBalance() }, [])

  async function onDeposit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await walletAPI.deposit(Number(amount))
      setBalance(data.balance)
      // Mark user as existing_user for demo after first deposit
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.role = 'existing_user'
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/app')
    } catch (err) {
      setError(err?.response?.data?.error || 'Deposit failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Initial deposit (demo)</h2>
          <p className="text-sm opacity-80">Add demo funds to explore borrowing flows.</p>
          {balance !== null && <div className="badge badge-info">Current Balance: ₹{balance}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <form onSubmit={onDeposit} className="space-y-3">
            <input className="input input-bordered w-full" type="number" min="1" value={amount} onChange={(e)=>setAmount(e.target.value)} />
            <button className="btn btn-primary w-full" type="submit">Add funds</button>
          </form>
        </div>
      </div>
    </div>
  )
}



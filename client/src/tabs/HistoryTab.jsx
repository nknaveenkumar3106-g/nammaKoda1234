import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import AdPlaceholder from '../components/AdPlaceholder.jsx'

export default function HistoryTab(){
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('user')||'{}'))
  const [realtime, setRealtime] = useState(false)
  const payments = useMemo(()=> {
    const tx = user?.transactions || []
    return tx.map((t, idx)=> ({
      id: idx+1,
      type: t.type === 'deposit' ? 'Deposit' : t.type === 'borrow' ? 'Borrow' : t.type === 'penalty' ? 'Penalty' : 'Refund',
      amount: t.amount,
      date: new Date(t.createdAt || Date.now()).toLocaleDateString(),
      time: new Date(t.createdAt || Date.now()).toLocaleTimeString(),
      status: 'completed'
    }))
  }, [user])
  const borrows = [
    { id: 1, location: 'Main Gate', action: 'Take', date: '2025-01-15', time: '10:30 AM', duration: '2h 15m', status: 'completed' },
    { id: 2, location: 'Library Block', action: 'Drop', date: '2025-01-15', time: '12:45 PM', duration: '2h 15m', status: 'completed' },
    { id: 3, location: 'Cafeteria', action: 'Take', date: '2025-01-14', time: '02:15 PM', duration: '1h 30m', status: 'completed' },
    { id: 4, location: 'Sports Ground', action: 'Drop', date: '2025-01-14', time: '03:45 PM', duration: '1h 30m', status: 'completed' },
    { id: 5, location: 'Admin Block', action: 'Take', date: '2025-01-12', time: '09:45 AM', duration: '3h 20m', status: 'completed' }
  ]
  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) return
    const url = `${api.defaults.baseURL.replace(/\/$/,'')}/stream/user?token=${encodeURIComponent(token)}`
    const ev = new EventSource(url)
    ev.onopen = ()=> setRealtime(true)
    ev.onerror = ()=> setRealtime(false)
    ev.addEventListener('user', (e)=>{
      try{
        const data = JSON.parse(e.data)
        const updated = { ...(user||{}), ...{ name: data.name, email: data.email, wallet: data.wallet, transactions: data.transactions } }
        setUser(updated)
        localStorage.setItem('user', JSON.stringify(updated))
      }catch{}
    })
    return ()=> ev.close()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="glass-strong rounded-2xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={()=>history.back()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="font-bold">Transaction History</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${realtime? 'badge-success':'badge-ghost'}`}>{realtime? 'live':'offline'}</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>window.print()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Payment History</h3>
            <span className="badge badge-primary">{payments.length} transactions</span>
          </div>
          <div className="space-y-3">
            {payments.map(p=> (
              <div key={p.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full grid place-items-center ${p.amount>=0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {p.type==='Deposit' ? '💰' : p.type==='Refund' ? '↩️' : p.type==='Borrow' ? '☂️' : '⚠️'}
                  </div>
                  <div>
                    <div className="font-medium">{p.type}</div>
                    <div className="text-xs opacity-70">{p.date} at {p.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${p.amount>=0? 'text-success':'text-error'}`}>
                    {p.amount>=0? '+' : ''}₹{Math.abs(p.amount)}
                  </div>
                  <div className="text-xs opacity-70">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Umbrella History</h3>
            <span className="badge badge-info">{borrows.length} activities</span>
          </div>
          <div className="space-y-3">
            {borrows.map(b=> (
              <div key={b.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full grid place-items-center ${b.action==='Take' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {b.action==='Take' ? '☂️' : '✅'}
                  </div>
                  <div>
                    <div className="font-medium">{b.action} - {b.location}</div>
                    <div className="text-xs opacity-70">{b.date} at {b.time}</div>
                    <div className="text-xs opacity-60">Duration: {b.duration}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="badge badge-success badge-sm">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdPlaceholder />

      <div className="glass-strong rounded-2xl p-4">
        <div className="text-lg font-bold mb-3">Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-base-100 rounded-lg">
            <div className="text-2xl font-bold text-success">₹{payments.filter(p=>p.amount>0).reduce((a,b)=>a+b.amount,0)}</div>
            <div className="text-xs opacity-70">Total Deposits</div>
          </div>
          <div className="p-3 bg-base-100 rounded-lg">
            <div className="text-2xl font-bold text-error">₹{Math.abs(payments.filter(p=>p.amount<0).reduce((a,b)=>a+b.amount,0))}</div>
            <div className="text-xs opacity-70">Total Penalties</div>
          </div>
          <div className="p-3 bg-base-100 rounded-lg">
            <div className="text-2xl font-bold text-info">{borrows.filter(b=>b.action==='Take').length}</div>
            <div className="text-xs opacity-70">Borrows</div>
          </div>
          <div className="p-3 bg-base-100 rounded-lg">
            <div className="text-2xl font-bold text-warning">{borrows.reduce((a,b)=>a+parseInt(b.duration.split('h')[0]),0)}h</div>
            <div className="text-xs opacity-70">Total Usage</div>
          </div>
        </div>
      </div>

      <AdPlaceholder />
    </div>
  )
}



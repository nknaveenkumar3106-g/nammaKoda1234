import { useEffect, useState } from 'react'
import { useWeather } from '../context/WeatherContext.jsx'
import { useNavigate } from 'react-router-dom'
import { makeWhiteTransparent } from '../lib/logoUtils.js'
import RechargeModal from '../components/RechargeModal.jsx'
import AdPlaceholder from '../components/AdPlaceholder.jsx'
import { api, walletAPI, showToast } from '../lib/api.js'

export default function HomeTab(){
  const navigate = useNavigate()
  const weather = useWeather()
  const [showRecharge, setShowRecharge] = useState(false)
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('user') || '{}'))
  const [sseConnected, setSseConnected] = useState(false)
  const [borrowedUntil, setBorrowedUntil] = useState(()=> Number(localStorage.getItem('borrowedUntil')||0))
  
  useEffect(()=>{
    const saved = localStorage.getItem('theme')
    // Default to light theme if no theme is saved
    const theme = saved || 'light'
    document.documentElement.setAttribute('data-theme', theme)
  },[])

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) return
    const url = `${api.defaults.baseURL.replace(/\/$/,'')}/stream/user?token=${encodeURIComponent(token)}`
    const ev = new EventSource(url)
    ev.onopen = ()=> setSseConnected(true)
    ev.onerror = ()=> setSseConnected(false)
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

  // Ensure wallet is refreshed after signup/payment redirects
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

  function handleRechargeSuccess(data){
    const updatedUser = { ...user, wallet: data }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }
  async function startBorrow(){
    navigate('/app/map')
  }
  async function returnBorrow(){
    try{
      await walletAPI.returnUmbrella()
      localStorage.removeItem('borrowedUntil')
      setBorrowedUntil(0)
      showToast('Return successful. Deposit adjusted.', 'success')
    }catch(err){ showToast(err?.response?.data?.error || 'Return failed', 'error') }
  }
  const heroClass = weather.condition==='rainy' ? 'hero-cool' : weather.temperatureC!=null && weather.temperatureC>=30 ? 'hero-hot' : weather.temperatureC!=null && weather.temperatureC<=20 ? 'hero-cool' : 'hero-mild'
  return (
    <div className={`relative min-h-[70vh] w-full flex items-center justify-center ${heroClass} p-4 rounded-box`}>
      <CornerLogo />
      <div className="glass-strong w-full max-w-3xl md:max-w-5xl p-6 md:p-8 rounded-2xl text-center space-y-6 relative">
        
        {/* Desktop side ads - positioned on either side inside the glass container */}
        <div className="hidden lg:block absolute -left-80 top-0 bottom-0 w-80 h-screen z-10">
          <div className="m-7 h-full bg-white border-2 border-black rounded-lg shadow-lg">
            <AdPlaceholder />
          </div>
        </div>
        <div className="hidden lg:block absolute -right-80 top-0 bottom-0 w-80 h-screen z-10">
          <div className="m-7 h-full bg-white border-2 border-black rounded-lg shadow-lg">
            <AdPlaceholder />
          </div>
        </div>
        <div className="umbrella-bg" aria-hidden="true">
          <svg width="280" height="280" viewBox="0 0 24 24" className="text-black">
            <path d="M12 2C7 2 3 6 3 11h18c0-5-4-9-9-9Zm0 0v9m0 0v7a3 3 0 1 0 6 0h-2a1 1 0 1 1-2 0v-7" stroke="currentColor" strokeWidth="1.2" fill="black" />
          </svg>
        </div>
        <div className="absolute top-3 right-4 text-sm opacity-95 font-semibold">
          {weather.temperatureC !== null ? `${weather.temperatureC}°C` : '—'}
        </div>
        {/* Sun animation for sunny weather */}
        {weather.condition==='sunny' && (
          <div className="absolute top-4 right-4 pointer-events-none hidden md:block" aria-hidden="true">
            <div className="sun-animation">
              <svg width="60" height="60" viewBox="0 0 24 24" className="text-yellow-400 animate-spin" style={{animationDuration: '20s'}}>
                <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.8"/>
                <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </g>
              </svg>
            </div>
          </div>
        )}
        {weather.condition==='rainy' && (
          <div className="rain hidden md:block" aria-hidden="true">
            {Array.from({length: 80}).map((_, i)=> {
              const left = `${Math.random()*100}%`
              const delay = `${-Math.random()*1.5}s`
              const duration = `${0.9 + Math.random()*1.2}s`
              return <span key={i} className="raindrop" style={{ left, animationDelay: delay, animationDuration: duration }}></span>
            })}
          </div>
        )}
        {weather.condition!=='rainy' && weather.temperatureC!=null && weather.temperatureC>=30 && (
          <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
            <div className="hero-hot w-full h-full"></div>
          </div>
        )}
        {weather.condition!=='rainy' && weather.temperatureC!=null && weather.temperatureC<=20 && (
          <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
            <div className="hero-cool w-full h-full"></div>
          </div>
        )}
        <div className="space-y-4 text-left">
          <MainLogo />
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold">Hello, {JSON.parse(localStorage.getItem('user')||'{}')?.name || 'Friend'}!</p>
            <p className="opacity-80">Ready to stay dry?</p>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-70">Wallet Balance</div>
                  <div className="text-4xl font-extrabold">{user?.wallet?.balance ?? 0} coins</div>
                  <div className="text-xs opacity-60">1 coin = ₹1 • Minimum 50 coins to borrow</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl">💼</div>
                  <button className="btn btn-sm btn-primary" onClick={()=>setShowRecharge(true)}>
                    Recharge
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="alert bg-base-200 opacity-80">
            <div className="flex-1">
              <div className="font-bold">Scan the QR to Borrow</div>
              <div className="text-sm opacity-80">Development mode — QR flow is a placeholder.</div>
            </div>
            <button className="btn btn-sm" disabled>Scan (dev)</button>
          </div>
          <BorrowReminder borrowedUntil={borrowedUntil} onBorrow={startBorrow} onReturn={returnBorrow} />
          <div>
            <div className="text-lg font-bold mb-2">Quick Actions</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <button className="btn" disabled><span className="icon-glow">◻︎</span> Insufficient Balance</button>
              <button className="btn btn-outline justify-between" onClick={()=>navigate('/app/map')}>
                <span className="icon-glow">📍</span> <span>Find Stations</span> <span>›</span>
              </button>
              <button className="btn btn-outline justify-between" onClick={()=>navigate('/app/history')}>
                <span className="icon-glow">🗂</span> <span>Borrow History</span> <span>›</span>
              </button>
            </div>
          </div>
          <AdPlaceholder />
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="text-lg font-bold mb-2">Service Status</div>
              <ul className="text-sm">
                <li className="flex items-center gap-2"><span className="badge badge-success badge-xs"></span> All stations operational</li>
                <li className="flex items-center gap-2"><span className="badge badge-info badge-xs"></span> 24/7 service available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <RechargeModal 
        isOpen={showRecharge} 
        onClose={()=>setShowRecharge(false)} 
        onSuccess={handleRechargeSuccess}
      />
    </div>
  )
}

function MainLogo(){
  const [imgOk, setImgOk] = useState(true)
  const raw = import.meta.env.VITE_LOGO_URL || '/logo.png'
  const [src, setSrc] = useState(raw)
  useEffect(()=>{ makeWhiteTransparent(raw, 245).then(setSrc) }, [raw])
  return (
    <div className="flex items-center justify-center relative logo-animated">
      {imgOk ? (
        <img src={src} alt="nammaKodai logo" className="h-20 object-contain" onError={()=>setImgOk(false)} />
      ) : (
        <div className="text-3xl font-extrabold tracking-wide">nammaKodai</div>
      )}
      <span className="logo-shine" aria-hidden="true"></span>
    </div>
  )
}

function CornerLogo(){
  return (
    <div className="absolute top-3 left-3">
      <svg width="28" height="28" viewBox="0 0 24 24" className="text-black float-soft">
        <path d="M12 2C7 2 3 6 3 11h18c0-5-4-9-9-9Zm0 0v9m0 0v7a3 3 0 1 0 6 0h-2a1 1 0 1 1-2 0v-7" stroke="currentColor" strokeWidth="1.4" fill="black" />
      </svg>
    </div>
  )
}

function BorrowReminder({ borrowedUntil, onBorrow, onReturn }){
  const [now, setNow] = useState(Date.now())
  useEffect(()=>{
    const t = setInterval(()=> setNow(Date.now()), 1000)
    return ()=> clearInterval(t)
  },[])
  const remaining = Math.max(0, (borrowedUntil||0) - now)
  const hours = Math.floor(remaining / (60*60*1000))
  const minutes = Math.floor((remaining % (60*60*1000)) / (60*1000))
  const seconds = Math.floor((remaining % (60*1000)) / 1000)
  return (
    <div className="card bg-base-100 shadow-xl border relative">
      {borrowedUntil>0 && (
        <div className="absolute top-2 right-2">
          <span className="badge badge-warning">Due in {String(hours).padStart(2,'0')}:{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</span>
        </div>
      )}
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-70">Borrowed Umbrella</div>
            <div className="text-xs opacity-60">Return within the time frame</div>
          </div>
          <div className="text-5xl md:text-6xl">☂️</div>
        </div>
        <div className="mt-3 flex gap-2">
          {borrowedUntil>0 ? (
            <button className="btn btn-outline btn-sm" onClick={onReturn}>Return Umbrella</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onBorrow}>Borrow Umbrella</button>
          )}
        </div>
      </div>
    </div>
  )
}

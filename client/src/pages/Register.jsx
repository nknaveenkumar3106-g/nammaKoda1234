import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import { useWeather } from '../context/WeatherContext.jsx'
import { makeWhiteTransparent } from '../lib/logoUtils.js'
import AdPlaceholder from '../components/AdPlaceholder.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const [explorerMode, setExplorerMode] = useState(false)
  const weather = useWeather()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (explorerMode) {
        const data = await authAPI.explore({ name, email, password })
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        alert('Welcome explorer\nYou have a opportunity to use one time free umbrella!!\nNo Initial deposit\nAccount valid for limited time then will be converted to existing user and wallet feature will be unlocked')
        navigate('/app')
      } else {
        await authAPI.register(name, email, password)
        // Auto-login after register
        const data = await authAPI.login(email, password)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/deposit')
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed')
      setIsSubmitting(false)
    }
  }

  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    setExplorerMode(params.get('explorer') === '1')
  },[])

  const heroClass = weather.condition==='rainy' ? 'hero-cool' : weather.temperatureC!=null && weather.temperatureC>=30 ? 'hero-hot' : weather.temperatureC!=null && weather.temperatureC<=20 ? 'hero-cool' : 'hero-mild'
  
  return (
    <div className={`min-h-screen flex flex-col ${heroClass} p-4 relative`}>
      <NammaKodaLogo />
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
        <div className="text-sm opacity-95 font-semibold text-white">
          {weather.temperatureC !== null ? `${weather.temperatureC}°C` : '—'}
        </div>
      </div>
      {weather.condition==='rainy' && (
        <div className="rain absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({length: 60}).map((_, i)=> {
            const left = `${Math.random()*100}%`
            const delay = `${-Math.random()*1.5}s`
            const duration = `${0.9 + Math.random()*1.2}s`
            return <span key={i} className="raindrop" style={{ left, animationDelay: delay, animationDuration: duration }}></span>
          })}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        <div className="card w-full max-w-md bg-base-100 shadow-xl glass-strong relative z-10">
          <div className="card-body">
            <h2 className="card-title">{explorerMode ? 'Explorer Mode' : 'Create account'}</h2>
            {explorerMode && (
              <MagicalText isSubmitting={isSubmitting} weather={weather} />
            )}
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <form onSubmit={onSubmit} className="space-y-3">
              <input className="input input-bordered w-full" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
              <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <input className="input input-bordered w-full" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
              <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (explorerMode ? 'Starting...' : 'Registering...') : (explorerMode ? 'Start Exploring' : 'Register')}
            </button>
            </form>
            {explorerMode && (
              <div className="text-center mt-2 space-y-2">
                <div className="text-sm opacity-70">Want unlimited access?</div>
                <button className="btn btn-outline btn-sm" onClick={()=>{ const url = new URL(location.href); url.searchParams.delete('explorer'); location.href = `${url.pathname}${url.search}` }}>Create Account</button>
              </div>
            )}
            <div className="text-sm">Have an account? <Link to="/login" className="link link-primary">Login</Link></div>
            {explorerMode && (
              <div className="space-y-3 mt-4">
                <div className="glass-strong rounded-xl p-4">
                  <div className="text-sm opacity-80 mb-2 font-semibold">What you can do:</div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2"><span>☂️</span><span>Borrow one umbrella for free</span></li>
                    <li className="flex items-start gap-2"><span>🗺️</span><span>Find nearby stations</span></li>
                    <li className="flex items-start gap-2"><span>▶️</span><span>Watch ads to borrow (no deposit)</span></li>
                  </ul>
                </div>
                <div className="glass-strong rounded-xl p-4">
                  <div className="text-sm opacity-80 mb-2 font-semibold">Limitations:</div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2"><span>⚠️</span><span>One-time borrow only</span></li>
                    <li className="flex items-start gap-2"><span>⏱️</span><span>No borrow history tracking</span></li>
                    <li className="flex items-start gap-2"><span>💼</span><span>No wallet features</span></li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {explorerMode && (
        <div className="w-full max-w-md mx-auto relative z-10 mt-4">
          <AdPlaceholder />
        </div>
      )}
      {!explorerMode && (
        <MagicalText isSubmitting={isSubmitting} weather={weather} />
      )}
    </div>
  )
}

function NammaKodaLogo(){
  const [imgOk, setImgOk] = useState(true)
  const raw = import.meta.env.VITE_LOGO_URL || '/logo.png'
  const [src, setSrc] = useState(raw)
  useEffect(()=>{ makeWhiteTransparent(raw, 245).then(setSrc) }, [raw])
  return (
    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
      <div className="flex items-center justify-center relative logo-animated">
        {imgOk ? (
          <img src={src} alt="nammaKoda logo" className="h-8 sm:h-12 object-contain" onError={()=>setImgOk(false)} />
        ) : (
          <div className="text-sm sm:text-xl font-extrabold tracking-wide text-white">nammaKoda</div>
        )}
        <span className="logo-shine" aria-hidden="true"></span>
      </div>
    </div>
  )
}

function MagicalText({ isSubmitting, weather }) {
  const [showText, setShowText] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getWeatherText = () => {
    if (weather.condition === 'rainy') return 'Rain'
    if (weather.temperatureC >= 30) return 'Shine'
    if (weather.temperatureC <= 20) return 'Rain'
    return 'Shine'
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10 mt-4">
      <div className="text-center">
        <div className={`magical-text ${showText ? 'show' : ''} ${isSubmitting ? 'submitted' : ''}`}>
          {isSubmitting ? `Avoided ${getWeatherText()}!` : 'Ready to avoid Rain or Shine!!'}
        </div>
      </div>
    </div>
  )
}



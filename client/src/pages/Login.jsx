import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import { useWeather } from '../context/WeatherContext.jsx'
import { makeWhiteTransparent } from '../lib/logoUtils.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const weather = useWeather()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.user.role === 'new_user') {
        navigate('/deposit')
      } else {
        navigate('/app')
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
      setIsSubmitting(false)
    }
  }

  const heroClass = weather.condition==='rainy' ? 'hero-cool' : weather.temperatureC!=null && weather.temperatureC>=30 ? 'hero-hot' : weather.temperatureC!=null && weather.temperatureC<=20 ? 'hero-cool' : 'hero-mild'
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${heroClass} p-4 relative`}>
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
      <div className="card w-full max-w-md bg-base-100 shadow-xl glass-strong relative z-10">
        <div className="card-body">
          <h2 className="card-title">Login</h2>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-3">
            <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input input-bordered w-full" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="divider text-xs opacity-60">or</div>
          <button className="btn btn-warning w-full" onClick={()=> navigate('/register?explorer=1')}>
            Take a view (Explorer)
          </button>
          <div className="text-sm">New user? <Link to="/register" className="link link-primary">Create account</Link></div>
        </div>
      </div>
      <MagicalText isSubmitting={isSubmitting} weather={weather} />
      <div className="absolute bottom-2 right-2 z-20 text-[11px] opacity-70">
        <a href="/admin" className="link link-hover">admin login</a>
      </div>
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



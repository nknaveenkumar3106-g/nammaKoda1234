import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function IntroPage() {
  const navigate = useNavigate();

  // Auto-redirect if this page should just lead to login
  useEffect(() => {
    // If you want an immediate redirect on visiting Intro:
    // navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100">
      <div className="pointer-events-none select-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 blur-3xl animate-float-slow" aria-hidden="true"></div>
      <div className="pointer-events-none select-none absolute -bottom-32 -left-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-fuchsia-400/10 to-blue-400/10 blur-3xl animate-float-slower" aria-hidden="true"></div>
      {/* Header with Login Button */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="NammaKoda" className="h-8 md:h-10 drop-shadow-sm animate-fade-in" />
              <div className="ml-2 text-sm text-gray-500 hidden sm:block">Umbrella Sharing System</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg active:scale-[.98]"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
          {Array.from({length: 10}).map((_, i) => (
            <img key={i} src="/logo.png" alt="" className="opacity-[0.04] w-10 h-10 object-contain absolute animate-fall" style={{ left: `${(i*97)%100}%`, animationDelay: `${i*0.7}s`, animationDuration: `${12 + (i%5)}s` }} />
          ))}
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight animate-rise">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">NammaKoda</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in delay-150">
            Smart umbrella sharing system for your campus. Borrow umbrellas when you need them, 
            return them when you're done. Simple, convenient, and weather-ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300">
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-rise delay-150">
            <div className="text-4xl mb-4">☂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Borrowing</h3>
            <p className="text-gray-600">
              Borrow umbrellas instantly from any station on campus with just a few taps.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-rise delay-300">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Stations</h3>
            <p className="text-gray-600">
              Find umbrella stations conveniently located across your campus.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-rise delay-500">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Affordable Rates</h3>
            <p className="text-gray-600">
              Pay only for what you use with our transparent pricing system.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white/90 backdrop-blur rounded-xl shadow-lg p-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">System Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">250+</div>
              <div className="text-gray-600">Umbrellas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">30+</div>
              <div className="text-gray-600">Stations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">1000+</div>
              <div className="text-gray-600">Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">99%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </main>

      {/* No modal; direct links used above */}
    </div>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom'
import IntroPage from './pages/IntroPage.jsx'
import Login from './pages/Login.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminLayout from './pages/AdminLayout.jsx'
import { Dashboard, Users, Stations, Inventory, Transactions, Ads, Reports, Settings } from './pages/admin-pages.jsx'
import Register from './pages/Register.jsx'
import Deposit from './pages/Deposit.jsx'
import TabsLayout from './pages/TabsLayout.jsx'
import HomeTab from './tabs/HomeTab.jsx'
import MapTab from './tabs/MapTab.jsx'
import HistoryTab from './tabs/HistoryTab.jsx'
import ProfileTab from './tabs/ProfileTab.jsx'

function RequireAuth({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="stations" element={<Stations />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="ads" element={<Ads />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/register" element={<Register />} />
      <Route path="/deposit" element={<RequireAuth><Deposit /></RequireAuth>} />
      <Route path="/app" element={<RequireAuth><TabsLayout /></RequireAuth>}>
        <Route index element={<HomeTab />} />
        <Route path="map" element={<MapTab />} />
        <Route path="history" element={<HistoryTab />} />
        <Route path="profile" element={<ProfileTab />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}



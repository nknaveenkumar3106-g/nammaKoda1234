import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://nammakoda1234.onrender.com/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// API methods
export const authAPI = {
  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password })
    return res.data
  },
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },
  async updateProfile(name, email) {
    const res = await api.put('/auth/profile', { name, email })
    return res.data
  },
  async deleteAccount() {
    const res = await api.delete('/auth/account')
    return res.data
  },
  async explore(body) {
    const res = await api.post('/auth/explore', body || {})
    return res.data
  }
}

export const adminAPI = {
  async seedInitial(){
    const res = await api.post('/admin/seed-initial')
    return res.data
  },
  async login(userId, password){
    const res = await api.post('/admin/login', { userId, password })
    return res.data
  },
  async addAdmin(accessPassword, name, userId, password, role){
    const token = localStorage.getItem('adminToken')
    const res = await api.post('/admin/add', { accessPassword, name, userId, password, role }, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  }
}

export const walletAPI = {
  async deposit(amount) {
    const res = await api.post('/wallet/deposit', { amount })
    return res.data
  },
  async getBalance() {
    const res = await api.get('/wallet/balance')
    return res.data
  },
  async borrow(stationId, stationName){
    const res = await api.post('/wallet/borrow', { stationId, stationName })
    return res.data
  },
  async returnUmbrella(){
    const res = await api.post('/wallet/return')
    return res.data
  }
}



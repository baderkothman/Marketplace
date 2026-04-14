import axios from 'axios'

const API_BASE = '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage on every request
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth_user')
  if (raw) {
    try {
      const user = JSON.parse(raw)
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
    } catch { /* ignore */ }
  }
  return config
})

// Global error handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client

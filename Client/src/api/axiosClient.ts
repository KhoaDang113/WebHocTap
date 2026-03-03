import axios from 'axios'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi cookie (JWT) theo mỗi request
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect đến trang login khi token hết hạn
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/components/AuthProvider'

const API_URL = 'http://localhost:3000'

interface User {
  id: string
  email: string
  createdAt: string
  updatedAt: string
  twoFactorEnabled: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()
  const { token, logout } = useAuth()

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      const [profileRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/auth/users`)
      ])
      setUser(profileRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account?')) return

    try {
      await axios.delete(`${API_URL}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      logout()
    } catch (error: any) {
      alert('Error deleting account: ' + error.response?.data?.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
          >
            Logout
          </button>
        </div>

        <div className="flex space-x-4 mb-6 border-b border-primary-600">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 transition-all ${
              activeTab === 'profile'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 transition-all ${
              activeTab === 'users'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`pb-3 px-4 transition-all ${
              activeTab === '2fa'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2FA Settings
          </button>
        </div>

        {activeTab === 'profile' && user && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-primary-600">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-primary-600">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-primary-600">
                <span className="text-gray-400">2FA Status:</span>
                <span className={`font-medium ${user.twoFactorEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                  {user.twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/2fa-setup')}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                {user.twoFactorEnabled ? 'Manage 2FA' : 'Setup 2FA'}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6">All Users ({users.length})</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-primary-700 rounded-lg border border-primary-600 hover:border-blue-500/50 transition-all"
                >
                  <div>
                    <p className="text-white font-medium">{u.email}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {u.twoFactorEnabled ? '🔒 2FA Enabled' : 'No 2FA'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === '2fa' && user && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Two-Factor Authentication</h2>
            
            <div className="bg-primary-700 rounded-lg p-6 mb-6 border border-primary-600">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Status</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {user.twoFactorEnabled ? 'Your account is protected with 2FA' : '2FA is not enabled'}
                  </p>
                </div>
                <div className={`text-3xl ${user.twoFactorEnabled ? 'text-green-400' : 'text-gray-600'}`}>
                  {user.twoFactorEnabled ? '🔒' : '🔓'}
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/2fa-setup')}
              className="btn-primary w-full"
            >
              {user.twoFactorEnabled ? 'Manage 2FA Settings' : 'Enable 2FA Now'}
            </button>

            <p className="text-gray-400 text-sm mt-4 text-center">
              Add an extra layer of security with Google Authenticator
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

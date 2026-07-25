import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { CheckSquare, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allowRegistration, setAllowRegistration] = useState(true)

  // Message from register redirect
  const registrationSuccess = location.state?.registrationSuccess

  useEffect(() => {
    // If user is already logged in, send them straight to task board
    if (localStorage.getItem('taskflow_token')) {
      navigate('/', { replace: true })
    }

    // Check if registration is allowed from health endpoint
    api
      .getHealth()
      .then((data) => {
        setAllowRegistration(data.allowRegistration)
      })
      .catch(() => {
        // Fallback to true if server check fails
        setAllowRegistration(true)
      })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await api.login({
        username: username.trim(),
        password,
      })
      localStorage.setItem('taskflow_token', data.accessToken)
      localStorage.setItem('taskflow_user', JSON.stringify(data.user))
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5">
            <CheckSquare className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to manage your tasks and workflow in real time.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6">
          {registrationSuccess && !error && (
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm leading-relaxed">
              <span>
                Account created successfully! Please log in using your newly created credentials.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="px-3.5 py-2.5 border border-border rounded-xl bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  to="/recover"
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-3.5 pr-10 py-2.5 border border-border rounded-xl bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium shadow-md hover:bg-primary/95 transition-colors cursor-pointer"
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {allowRegistration && (
            <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

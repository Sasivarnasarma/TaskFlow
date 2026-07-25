import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Download,
  Copy,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { api } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()

  // Registration control
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [pageLoading, setPageLoading] = useState(true)

  // Form states
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Processing states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Success states (when recovery key is retrieved)
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [savedConfirmed, setSavedConfirmed] = useState(false)

  useEffect(() => {
    // Redirect if logged in
    if (localStorage.getItem('taskflow_token')) {
      navigate('/', { replace: true })
      return
    }

    // Verify registration configuration
    api
      .getHealth()
      .then((data) => {
        setAllowRegistration(data.allowRegistration)
      })
      .catch(() => {
        setAllowRegistration(true)
      })
      .finally(() => {
        setPageLoading(false)
      })
  }, [navigate])

  // Live password validation checks
  const meetsMinLength = password.length >= 12
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password && password === confirmPassword

  const isFormValid =
    username.trim().length > 0 &&
    meetsMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    setError(null)

    try {
      const result = await api.register({
        username: username.trim(),
        password,
        confirmPassword,
      })

      setRecoveryKey(result.recoveryKey)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different username.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!recoveryKey) return
    navigator.clipboard.writeText(recoveryKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!recoveryKey) return
    const element = document.createElement('a')
    const file = new Blob(
      [
        `=== TASKFLOW RECOVERY KEY ===\n\n`,
        `Username: ${username.trim()}\n`,
        `Recovery Key: ${recoveryKey}\n\n`,
        `WARNING: Keep this key safe. You will need it to reset your password if forgotten.`,
      ],
      { type: 'text/plain' }
    )
    element.href = URL.createObjectURL(file)
    element.download = `taskflow_recovery_key_${username.trim()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleFinish = () => {
    if (!savedConfirmed) return
    navigate('/login', { state: { registrationSuccess: true } })
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!allowRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-5">
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Registration Disabled</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              New user registration is currently disabled by the administrator. Please log in with
              existing credentials.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium shadow-md hover:bg-primary/95 transition-colors cursor-pointer block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5">
            <CheckSquare className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Setup credentials to access your secure task flow.
            </p>
          </div>
        </div>

        {/* Display Recovery Key Mode */}
        {recoveryKey ? (
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 p-4 rounded-xl text-sm leading-relaxed flex flex-col gap-2">
              <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-xs">
                ⚠️ Critical Security Warning
              </span>
              <span>
                Save this recovery key now. You will <b>never</b> see it again. It is the only way
                to reset your password if you forget it.
              </span>
            </div>

            {/* Key Presentation Box */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Recovery Key
              </span>
              <div className="bg-secondary/50 border border-border p-4 rounded-xl text-center relative group">
                <code className="text-sm font-mono break-all text-foreground select-all leading-relaxed block tracking-wide">
                  {recoveryKey}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 border border-border bg-transparent hover:bg-secondary/50 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Key'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 border border-border bg-transparent hover:bg-secondary/50 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Download File</span>
              </button>
            </div>

            {/* Acknowledgment checkbox */}
            <label className="flex items-start gap-3 text-sm select-none cursor-pointer">
              <input
                type="checkbox"
                checked={savedConfirmed}
                onChange={(e) => setSavedConfirmed(e.target.checked)}
                className="mt-1 accent-primary h-4 w-4 cursor-pointer"
              />
              <span className="text-muted-foreground font-medium">
                I have securely saved my recovery key. I understand that if I lose it, I cannot
                recover my account.
              </span>
            </label>

            {/* Go Login */}
            <button
              onClick={handleFinish}
              disabled={!savedConfirmed}
              className={`w-full py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                savedConfirmed
                  ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                  : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
              }`}
            >
              <span>Continue to Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Standard Input Form Mode */
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6">
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
                  placeholder="Choose username"
                  className="px-3.5 py-2.5 border border-border rounded-xl bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="px-3.5 py-2.5 border border-border rounded-xl bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password checklist (beautiful, interactive UI) */}
              <div className="bg-secondary/40 border border-border rounded-xl p-4 flex flex-col gap-2.5 text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Password requirements
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {meetsMinLength ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={meetsMinLength ? 'text-foreground' : ''}>12+ characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasUppercase ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={hasUppercase ? 'text-foreground' : ''}>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasLowercase ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={hasLowercase ? 'text-foreground' : ''}>Lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasNumber ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={hasNumber ? 'text-foreground' : ''}>Number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasSpecial ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={hasSpecial ? 'text-foreground' : ''}>Special symbol</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordsMatch ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={passwordsMatch ? 'text-foreground' : ''}>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium shadow-md transition-colors cursor-pointer ${
                  isFormValid && !loading
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                    : 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
                }`}
              >
                <span>{loading ? 'Creating account...' : 'Register'}</span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

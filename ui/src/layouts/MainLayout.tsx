import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sun, Moon, CheckSquare, Heart, LogOut, User as UserIcon } from 'lucide-react'
import { useTheme } from '../lib/theme-provider'
import { api } from '../lib/api'

export default function MainLayout() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [apiVersion, setApiVersion] = useState<string | null>(null)
  const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.0'
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    // Read user from localStorage
    const storedUser = localStorage.getItem('taskflow_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUsername(parsed.username || '')
      } catch {
        setUsername('')
      }
    }

    api
      .getVersion()
      .then((data) => setApiVersion(data?.version || null))
      .catch(() => setApiVersion(null))
  }, [])

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch {
      // Proceed with local logout even if network call fails
    }
    localStorage.removeItem('taskflow_token')
    localStorage.removeItem('taskflow_user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <div className="flex items-center gap-2.5 text-sm bg-secondary/40 border border-border px-3 py-1.5 rounded-xl">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hello,</span>
                <span className="font-semibold text-foreground">{username}</span>
              </div>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-border hover:bg-secondary cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {username && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-sm font-semibold"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border py-4 bg-card/50 text-xs text-muted-foreground">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">TaskFlow</span>
            <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-[11px] font-mono border border-border">
              <span>UI v{appVersion}</span>
              {apiVersion && (
                <>
                  <span className="opacity-40">•</span>
                  <span>API v{apiVersion}</span>
                </>
              )}
            </span>
          </div>

          <a
            href="https://github.com/Sasivarnasarma/TaskFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span>Developed with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by Sasivarnasarma</span>
          </a>
        </div>
      </footer>
    </div>
  )
}

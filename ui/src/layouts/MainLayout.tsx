import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sun, Moon, CheckSquare, LayoutDashboard } from 'lucide-react'
import { useTheme } from '../lib/theme-provider'

export default function MainLayout() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()

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
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-secondary cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 container">
        {/* Sidebar (Desktop only) */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border py-6 pr-4 gap-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 py-6 md:pl-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

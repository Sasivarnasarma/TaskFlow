import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './lib/theme-provider'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import Recover from './pages/Recover'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="taskflow-theme">
      <BrowserRouter>
        <Routes>
          {/* Public authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Recover />} />

          {/* Secure authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

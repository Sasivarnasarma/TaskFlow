import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import { api } from '../lib/api'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the API client
vi.mock('../lib/api', () => ({
  api: {
    login: vi.fn(),
    getHealth: vi.fn(),
  },
}))

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(api.getHealth).mockResolvedValue({ success: true, allowRegistration: true })
  })

  it('renders login form items correctly', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('handles login form submission and successful login redirects to /', async () => {
    const mockUser = { id: 1, username: 'testuser', createdAt: '2026-07-22' }
    vi.mocked(api.login).mockResolvedValueOnce({
      accessToken: 'test_token',
      tokenType: 'bearer',
      user: mockUser,
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^Username$/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'ValidPassword123!' } })

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({ username: 'testuser', password: 'ValidPassword123!' })
      expect(localStorage.getItem('taskflow_token')).toBe('test_token')
      expect(localStorage.getItem('taskflow_user')).toBe(JSON.stringify(mockUser))
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('displays API error messages upon failed login attempts', async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error('Invalid username or password'))

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^Username$/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'WrongPassword!' } })

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
    })
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Register from './Register'
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
    register: vi.fn(),
    getHealth: vi.fn(),
  },
}))

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getHealth).mockResolvedValue({ success: true, allowRegistration: true } as any)
    // Mock global URL object creator
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('renders register form items and interactive rules checklist', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /Create an account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument()

    // Requirements checklist should be visible
    expect(screen.getByText(/12\+ characters/i)).toBeInTheDocument()
    expect(screen.getByText(/Uppercase letter/i)).toBeInTheDocument()
    expect(screen.getByText(/Lowercase letter/i)).toBeInTheDocument()
    expect(screen.getByText(/Number/i)).toBeInTheDocument()
    expect(screen.getByText(/Special symbol/i)).toBeInTheDocument()
  })

  it('requires matching confirmation password and correct format strength to submit', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    const passInput = await screen.findByLabelText(/^Password$/i)
    const confirmInput = screen.getByLabelText(/^Confirm Password$/i)
    const submitBtn = screen.getByRole('button', { name: /Register/i })

    // Weak password
    fireEvent.change(passInput, { target: { value: 'weak' } })
    fireEvent.change(confirmInput, { target: { value: 'weak' } })
    fireEvent.click(submitBtn)

    // Form submission should be blocked (doesn't trigger API)
    expect(api.register).not.toHaveBeenCalled()
  })

  it('shows recovery key screen upon successful registration and allows navigation to login', async () => {
    vi.mocked(api.register).mockResolvedValueOnce({
      recoveryKey: 'mock-recovery-key-123456',
    })

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(await screen.findByLabelText(/^Username$/i), { target: { value: 'validuser' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'StrongPassword123!' } })
    fireEvent.change(screen.getByLabelText(/^Confirm Password$/i), { target: { value: 'StrongPassword123!' } })

    fireEvent.click(screen.getByRole('button', { name: /Register/i }))

    // Success screen should render
    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        username: 'validuser',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
      })
      expect(screen.getByText(/Critical Security Warning/i)).toBeInTheDocument()
      expect(screen.getByText('mock-recovery-key-123456')).toBeInTheDocument()
    })

    // Click confirmation checkbox
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    // Go to login button should be active now
    const finishBtn = screen.getByRole('button', { name: /Continue to Login/i })
    fireEvent.click(finishBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { registrationSuccess: true } })
  })
})

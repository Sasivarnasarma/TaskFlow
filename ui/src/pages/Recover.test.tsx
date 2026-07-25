import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Recover from './Recover'
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
    recoverPassword: vi.fn(),
  },
}))

describe('Recover Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('renders recovery form items correctly', () => {
    render(
      <MemoryRouter>
        <Recover />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Reset password/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Recovery Key$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument()
  })

  it('verifies inputs are validated and calls recoverPassword api on submit', async () => {
    vi.mocked(api.recoverPassword).mockResolvedValueOnce({
      recoveryKey: 'new-recovery-key-567890',
    })

    render(
      <MemoryRouter>
        <Recover />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^Username$/i), { target: { value: 'recoveruser' } })
    fireEvent.change(screen.getByLabelText(/^Recovery Key$/i), {
      target: { value: 'old-recovery-key' },
    })
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: 'NewStrongPassword123!' },
    })
    fireEvent.change(screen.getByLabelText(/^Confirm Password$/i), {
      target: { value: 'NewStrongPassword123!' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }))

    await waitFor(() => {
      expect(api.recoverPassword).toHaveBeenCalledWith({
        username: 'recoveruser',
        recoveryKey: 'old-recovery-key',
        newPassword: 'NewStrongPassword123!',
        confirmPassword: 'NewStrongPassword123!',
      })
      expect(screen.getByText(/New Recovery Key Generated/i)).toBeInTheDocument()
      expect(screen.getByText('new-recovery-key-567890')).toBeInTheDocument()
    })

    // Tick checkbox and navigate to login
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /Go to Login/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })
})

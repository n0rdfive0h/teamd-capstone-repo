import { useState } from 'react'
import { ApiError } from '../../api/ApiError'
import './LoginForm.css'

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = username.trim().length > 0 && password.length > 0 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onLogin(username.trim(), password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid username or password.')
      } else if (err instanceof ApiError && err.kind === 'network') {
        setError("Can't reach the server right now. Check your connection and try again.")
      } else {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="login-form card" onSubmit={handleSubmit} aria-label="Sign in">
      <div className="login-form__field">
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="agent1"
          value={username}
          onChange={e => setUsername(e.target.value)}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <div className="login-form__field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      {error && (
        <p id="login-error" role="alert" className="login-form__error">{error}</p>
      )}

      <button type="submit" className="login-form__submit" disabled={!canSubmit}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

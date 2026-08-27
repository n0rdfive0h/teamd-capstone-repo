// Where the signed-in user's JWT lives between page loads. Kept in one place so
// both the React layer (useAuth) and the plain fetch wrapper (http.ts) agree on it.

export const SESSION_STORAGE_KEY = 'crm.session'

export interface StoredSession {
  username: string
  token: string
}

export function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (typeof parsed.username === 'string' && typeof parsed.token === 'string') {
      return { username: parsed.username, token: parsed.token }
    }
    return null
  } catch {
    // Malformed JSON or storage unavailable — treat as signed out.
    return null
  }
}

export function writeStoredSession(session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Private mode / quota — the in-memory state still gates the UI for this tab.
  }
}

export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Nothing we can do; ignore.
  }
}

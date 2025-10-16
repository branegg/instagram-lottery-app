import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const ADMIN_PASSWORD = 'admin123' // Simple password protection

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(true)
  const [winner, setWinner] = useState(null)
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchEntries(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries(showAll)
    }
  }, [showAll, isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      fetchEntries(true)
    } else {
      alert('Nieprawidłowe hasło')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setPassword('')
    setEntries([])
  }

  const fetchEntries = async (all = true) => {
    setLoading(true)
    try {
      const endpoint = all ? `${API_URL}/admin/entries` : `${API_URL}/admin/entries/verified`
      const response = await fetch(endpoint)
      const data = await response.json()

      setEntries(data.entries || [])

      // Calculate stats
      const total = data.entries?.length || 0
      const verified = data.entries?.filter(e => e.verified === 1).length || 0
      setStats({
        total,
        verified,
        unverified: total - verified
      })
    } catch (error) {
      console.error('Error fetching entries:', error)
      alert('Nie udało się pobrać zgłoszeń')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/verify/${id}`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchEntries(showAll)
        alert('Zgłoszenie zostało pomyślnie zweryfikowane!')
      } else {
        alert('Nie udało się zweryfikować zgłoszenia')
      }
    } catch (error) {
      console.error('Error verifying entry:', error)
      alert('Nie udało się zweryfikować zgłoszenia')
    }
  }

  const handlePickWinner = async () => {
    if (!confirm('Czy na pewno chcesz wybrać losowego zwycięzcę spośród zweryfikowanych zgłoszeń?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/pick-winner`)
      const data = await response.json()

      if (response.ok && data.winner) {
        setWinner(data.winner)
      } else {
        alert(data.error || 'Nie znaleziono zweryfikowanych zgłoszeń')
      }
    } catch (error) {
      console.error('Error picking winner:', error)
      alert('Nie udało się wybrać zwycięzcy')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>Logowanie administratora</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wpisz hasło administratora"
              required
              autoFocus
            />
            <button type="submit">Zaloguj</button>
          </form>
          <button onClick={() => navigate('/')} className="back-btn">
            Powrót do strony głównej
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Panel administratora loterii</h1>
          <p>Zarządzaj zgłoszeniami i wybieraj zwycięzców</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">
            Strona główna
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Wyloguj
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Wszystkie zgłoszenia</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card verified">
          <h3>Zweryfikowane</h3>
          <p className="stat-number">{stats.verified}</p>
        </div>
        <div className="stat-card unverified">
          <h3>Niezweryfikowane</h3>
          <p className="stat-number">{stats.unverified}</p>
        </div>
      </div>

      <div className="actions-bar">
        <div className="filter-buttons">
          <button
            className={showAll ? 'active' : ''}
            onClick={() => setShowAll(true)}
          >
            Wszystkie zgłoszenia
          </button>
          <button
            className={!showAll ? 'active' : ''}
            onClick={() => setShowAll(false)}
          >
            Tylko zweryfikowane
          </button>
        </div>
        <button onClick={handlePickWinner} className="btn-primary pick-winner">
          🎲 Wybierz losowego zwycięzcę
        </button>
      </div>

      {winner && (
        <div className="winner-card">
          <h2>🎉 Wybrano zwycięzcę!</h2>
          <div className="winner-info">
            <p><strong>Imię:</strong> {winner.name}</p>
            <p><strong>E-mail:</strong> {winner.email}</p>
            <p><strong>Instagram:</strong> @{winner.instagram_username}</p>
            <p><strong>Data zgłoszenia:</strong> {new Date(winner.created_at).toLocaleDateString('pl-PL')}</p>
          </div>
          <button onClick={() => setWinner(null)} className="btn-secondary">
            Zamknij
          </button>
        </div>
      )}

      <div className="entries-container">
        <h2>Zgłoszenia do loterii ({entries.length})</h2>

        {loading ? (
          <p>Ładowanie zgłoszeń...</p>
        ) : entries.length === 0 ? (
          <p>Nie znaleziono zgłoszeń</p>
        ) : (
          <div className="entries-table">
            <table>
              <thead>
                <tr>
                  <th>Imię</th>
                  <th>E-mail</th>
                  <th>Instagram</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Akcja</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.name}</td>
                    <td>{entry.email}</td>
                    <td>
                      <a
                        href={`https://www.instagram.com/${entry.instagram_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @{entry.instagram_username}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${entry.verified === 1 ? 'verified' : 'unverified'}`}>
                        {entry.verified === 1 ? '✓ Zweryfikowano' : '⏳ Oczekujące'}
                      </span>
                    </td>
                    <td>{new Date(entry.created_at).toLocaleDateString('pl-PL')}</td>
                    <td>
                      {entry.verified === 0 && (
                        <button
                          onClick={() => handleVerify(entry.id)}
                          className="btn-verify"
                        >
                          Zweryfikuj
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin

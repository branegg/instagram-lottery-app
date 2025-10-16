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
      alert('Invalid password')
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
      alert('Failed to fetch entries')
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
        alert('Entry verified successfully!')
      } else {
        alert('Failed to verify entry')
      }
    } catch (error) {
      console.error('Error verifying entry:', error)
      alert('Failed to verify entry')
    }
  }

  const handlePickWinner = async () => {
    if (!confirm('Are you sure you want to pick a random winner from verified entries?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/admin/pick-winner`)
      const data = await response.json()

      if (response.ok && data.winner) {
        setWinner(data.winner)
      } else {
        alert(data.error || 'No verified entries found')
      }
    } catch (error) {
      console.error('Error picking winner:', error)
      alert('Failed to pick winner')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
            />
            <button type="submit">Login</button>
          </form>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Lottery Admin Dashboard</h1>
          <p>Manage lottery entries and pick winners</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn-secondary">
            Home
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card verified">
          <h3>Verified</h3>
          <p className="stat-number">{stats.verified}</p>
        </div>
        <div className="stat-card unverified">
          <h3>Unverified</h3>
          <p className="stat-number">{stats.unverified}</p>
        </div>
      </div>

      <div className="actions-bar">
        <div className="filter-buttons">
          <button
            className={showAll ? 'active' : ''}
            onClick={() => setShowAll(true)}
          >
            All Entries
          </button>
          <button
            className={!showAll ? 'active' : ''}
            onClick={() => setShowAll(false)}
          >
            Verified Only
          </button>
        </div>
        <button onClick={handlePickWinner} className="btn-primary pick-winner">
          🎲 Pick Random Winner
        </button>
      </div>

      {winner && (
        <div className="winner-card">
          <h2>🎉 Winner Selected!</h2>
          <div className="winner-info">
            <p><strong>Name:</strong> {winner.name}</p>
            <p><strong>Email:</strong> {winner.email}</p>
            <p><strong>Instagram:</strong> @{winner.instagram_username}</p>
            <p><strong>Entry Date:</strong> {new Date(winner.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={() => setWinner(null)} className="btn-secondary">
            Close
          </button>
        </div>
      )}

      <div className="entries-container">
        <h2>Lottery Entries ({entries.length})</h2>

        {loading ? (
          <p>Loading entries...</p>
        ) : entries.length === 0 ? (
          <p>No entries found</p>
        ) : (
          <div className="entries-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Instagram</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
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
                        {entry.verified === 1 ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td>
                      {entry.verified === 0 && (
                        <button
                          onClick={() => handleVerify(entry.id)}
                          className="btn-verify"
                        >
                          Verify
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

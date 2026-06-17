import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { UsersIcon, WrenchIcon, ClockIcon, BookingsIcon, AlertIcon } from '../components/Icons'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    )
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your SWARAMA platform</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--accent': 'var(--color-blue)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-blue-muted)', color: 'var(--color-blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <UsersIcon size={20} />
          </div>
          <div className="stat-value">{stats?.users?.total || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card" style={{ '--accent': 'var(--color-indigo)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-indigo-muted)', color: 'var(--color-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <WrenchIcon size={20} />
          </div>
          <div className="stat-value">{stats?.mechanics?.total || 0}</div>
          <div className="stat-label">Total Mechanics</div>
        </div>

        <div className="stat-card" style={{ '--accent': 'var(--color-amber)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-amber-muted)', color: 'var(--color-amber)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClockIcon size={20} />
          </div>
          <div className="stat-value">{stats?.mechanics?.pending || 0}</div>
          <div className="stat-label">Pending Approvals</div>
        </div>

        <div className="stat-card" style={{ '--accent': 'var(--color-emerald)' }}>
          <div className="stat-icon" style={{ background: 'var(--color-emerald-muted)', color: 'var(--color-emerald)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookingsIcon size={20} />
          </div>
          <div className="stat-value">{stats?.bookings?.today || 0}</div>
          <div className="stat-label">Bookings Today</div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-emerald)' }}>
            {stats?.mechanics?.approved || 0}
          </div>
          <div className="stat-label">Approved Mechanics</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-emerald)' }}>
            {stats?.bookings?.done || 0}
          </div>
          <div className="stat-label">Completed Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-amber)' }}>
            {stats?.bookings?.pending || 0}
          </div>
          <div className="stat-label">Active Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-red)' }}>
            {stats?.bookings?.rejected || 0}
          </div>
          <div className="stat-label">Rejected Bookings</div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {stats?.mechanics?.pending > 0 && (
        <div
          className="stat-card"
          style={{
            background: 'var(--color-amber-muted)',
            borderColor: 'var(--color-amber)',
            marginBottom: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
          onClick={() => navigate('/mechanics')}
        >
          <div style={{ color: 'var(--color-amber)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertIcon size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-amber)' }}>
              {stats.mechanics.pending} mechanic{stats.mechanics.pending > 1 ? 's' : ''} waiting for approval
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Click to review and approve pending registrations
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Bookings</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/bookings')}>
            View all
          </button>
        </div>

        {stats?.recentBookings?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Mechanic</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => (
                <tr 
                  key={b.id} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/bookings', { state: { selectedBookingId: b.id } })}
                  className="hover-row"
                >
                  <td>
                    <div className="cell-main">{b.user_name || 'Unknown'}</div>
                    <div className="cell-sub">{b.user_phone}</div>
                  </td>
                  <td>
                    <div className="cell-main">{b.mechanic_name}</div>
                    <div className="cell-sub">{b.mechanic_phone}</div>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.issue}
                  </td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {formatDate(b.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-text-tertiary)' }}>
              <BookingsIcon size={36} />
            </div>
            <p>No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { adminAPI } from '../services/api'

export default function BookingsPage() {
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [filter])

  useEffect(() => {
    if (location.state?.selectedBookingId && bookings.length > 0) {
      const b = bookings.find(x => x.id === location.state.selectedBookingId)
      if (b) setSelectedBooking(b)
    }
  }, [location.state, bookings])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const data = await adminAPI.getBookings(filter, searchQuery)
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteBooking = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking record? This action cannot be undone.')
    if (!confirmed) return

    try {
      await adminAPI.deleteBooking(id)
      alert('Booking deleted successfully')
      loadBookings()
      if (selectedBooking?.id === id) {
        closeDetail()
      }
    } catch (err) {
      console.error('Failed to delete booking:', err)
      alert(err.message || 'Failed to delete booking')
    }
  }

  const filters = ['all', 'pending', 'confirmed', 'done', 'rejected']
  
  const closeDetail = () => setSelectedBooking(null);

  return (
    <div>
      <div className="page-header">
        <h2>Bookings</h2>
        <p>All booking records on the platform</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>All Bookings ({bookings.length})</h3>
          <div className="table-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search by ID, name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
                className="input"
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              />
              <button className="btn btn-outline btn-sm" onClick={loadBookings}>Search</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {filters.map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : bookings.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Mechanic</th>
                <th>Vehicle</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {b.id.substring(0, 8)}...
                  </td>
                  <td>
                    <div className="cell-main">{b.user_name || 'Unknown'}</div>
                    <div className="cell-sub">{b.user_phone}</div>
                  </td>
                  <td className="cell-main">{b.mechanic_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{b.vehicle_type}</td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.issue}
                  </td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {formatDate(b.created_at)}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-outline btn-sm" onClick={() => setSelectedBooking(b)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBooking(b.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{filter !== 'all' ? `No ${filter} bookings` : 'No bookings yet'}</p>
          </div>
        )}
      </div>

      {selectedBooking && (
        <>
          <div className="side-panel-overlay" onClick={closeDetail} />
          <div className="side-panel">
            <div className="side-panel-header">
              <h3>Booking Details</h3>
              <button className="side-panel-close" onClick={closeDetail}>✕</button>
            </div>
            <div className="side-panel-body">
              <div className="detail-section">
                <h4>General Info</h4>
                <div className="detail-row">
                  <span className="label">Booking ID</span>
                  <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedBooking.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status</span>
                  <span className={`badge badge-${selectedBooking.status}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Date Created</span>
                  <span className="value">{formatDate(selectedBooking.created_at)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>User Info</h4>
                <div className="detail-row">
                  <span className="label">Name</span>
                  <span className="value">{selectedBooking.user_name || 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{selectedBooking.user_phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Mechanic Info</h4>
                <div className="detail-row">
                  <span className="label">Shop/Name</span>
                  <span className="value">{selectedBooking.mechanic_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mechanic Phone</span>
                  <span className="value">{selectedBooking.mechanic_phone || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Service Details</h4>
                <div className="detail-row">
                  <span className="label">Vehicle Type</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>{selectedBooking.vehicle_type}</span>
                </div>
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="label" style={{ marginBottom: '8px' }}>Issue Description</span>
                  <span className="value" style={{ textAlign: 'left', maxWidth: '100%', color: 'var(--color-text-primary)' }}>
                    {selectedBooking.issue}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                >
                  🗑️ Delete Booking
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMechanic, setSelectedMechanic] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadMechanics()
  }, [filter])

  const loadMechanics = async () => {
    setLoading(true)
    try {
      const data = await adminAPI.getMechanics(filter, searchQuery)
      setMechanics(data.mechanics || [])
    } catch (err) {
      console.error('Failed to load mechanics:', err)
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (mechanic) => {
    setSelectedMechanic(mechanic)
    try {
      const data = await adminAPI.getMechanicDetail(mechanic.id)
      setDetailData(data)
    } catch (err) {
      console.error('Failed to load detail:', err)
    }
  }

  const closeDetail = () => {
    setSelectedMechanic(null)
    setDetailData(null)
  }

  const handleAction = async (id, action) => {
    setActionLoading(id + action)
    try {
      if (action === 'approve') await adminAPI.approveMechanic(id)
      else if (action === 'reject') await adminAPI.rejectMechanic(id)
      else if (action === 'block') await adminAPI.blockMechanic(id)

      loadMechanics()
      if (selectedMechanic?.id === id) {
        closeDetail()
      }
    } catch (err) {
      console.error(`Failed to ${action} mechanic:`, err)
    } finally {
      setActionLoading(null)
    }
  }

  const filters = ['all', 'pending', 'approved', 'rejected', 'blocked']

  return (
    <div>
      <div className="page-header">
        <h2>Mechanics</h2>
        <p>Manage and verify mechanic registrations</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>All Mechanics ({mechanics.length})</h3>
          <div className="table-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search by name, shop, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadMechanics()}
                className="input"
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              />
              <button className="btn btn-outline btn-sm" onClick={loadMechanics}>Search</button>
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
        ) : mechanics.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Contact</th>
                <th>Skills</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mechanics.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="cell-main">{m.shop_name}</div>
                    <div className="cell-sub">{m.name}</div>
                  </td>
                  <td>
                    <div className="cell-main">{m.phone}</div>
                    <div className="cell-sub">{m.working_hours_from} - {m.working_hours_to}</div>
                  </td>
                  <td>
                    {(m.skills || []).slice(0, 3).map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </td>
                  <td>
                    <div className="cell-main">{m.city || 'N/A'}</div>
                    <div className="cell-sub" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.address}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${m.status}`}>{m.status}</span>
                  </td>
                  <td>
                    <div className="btn-group">
                      {m.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(m.id, 'approve')}
                            disabled={actionLoading === m.id + 'approve'}
                          >
                            ✓
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(m.id, 'reject')}
                            disabled={actionLoading === m.id + 'reject'}
                          >
                            ✗
                          </button>
                        </>
                      )}
                      {m.status === 'approved' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(m.id, 'block')}
                          disabled={actionLoading === m.id + 'block'}
                        >
                          Block
                        </button>
                      )}
                      {m.status === 'rejected' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAction(m.id, 'approve')}
                          disabled={actionLoading === m.id + 'approve'}
                        >
                          Approve
                        </button>
                      )}
                      {m.status === 'blocked' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAction(m.id, 'approve')}
                          disabled={actionLoading === m.id + 'approve'}
                        >
                          Unblock
                        </button>
                      )}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openDetail(m)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <p>No mechanics found{filter !== 'all' ? ` with status "${filter}"` : ''}</p>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedMechanic && (
        <>
          <div className="side-panel-overlay" onClick={closeDetail} />
          <div className="side-panel">
            <div className="side-panel-header">
              <h3>Mechanic Details</h3>
              <button className="side-panel-close" onClick={closeDetail}>✕</button>
            </div>
            <div className="side-panel-body">
              {/* Identity */}
              <div className="detail-section">
                <h4>Identity</h4>
                <div className="detail-row">
                  <span className="label">Shop Name</span>
                  <span className="value">{selectedMechanic.shop_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Owner Name</span>
                  <span className="value">{selectedMechanic.name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{selectedMechanic.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status</span>
                  <span className={`badge badge-${selectedMechanic.status}`}>
                    {selectedMechanic.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience</span>
                  <span className="value">{selectedMechanic.years_of_experience || 'N/A'} years</span>
                </div>
              </div>

              {/* Location */}
              <div className="detail-section">
                <h4>Location & Hours</h4>
                <div className="detail-row">
                  <span className="label">Address</span>
                  <span className="value">{selectedMechanic.address}</span>
                </div>
                <div className="detail-row">
                  <span className="label">City</span>
                  <span className="value">{selectedMechanic.city || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Coordinates</span>
                  <span className="value">{selectedMechanic.lat?.toFixed(4)}, {selectedMechanic.lng?.toFixed(4)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Service Radius</span>
                  <span className="value">{selectedMechanic.service_radius_km} km</span>
                </div>
                <div className="detail-row">
                  <span className="label">Working Hours</span>
                  <span className="value">{selectedMechanic.working_hours_from} - {selectedMechanic.working_hours_to}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Available</span>
                  <span className="value">{selectedMechanic.is_available ? '🟢 Online' : '🔴 Offline'}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="detail-section">
                <h4>Skills & Services</h4>
                <div style={{ marginBottom: '12px' }}>
                  <div className="label" style={{ marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Vehicle Types</div>
                  {(selectedMechanic.skills || []).map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                  {(!selectedMechanic.skills || selectedMechanic.skills.length === 0) && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>None specified</span>
                  )}
                </div>
                <div>
                  <div className="label" style={{ marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Services</div>
                  {(selectedMechanic.services || []).map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                  {(!selectedMechanic.services || selectedMechanic.services.length === 0) && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>None specified</span>
                  )}
                </div>
              </div>

              {/* Performance */}
              <div className="detail-section">
                <h4>Performance</h4>
                <div className="detail-row">
                  <span className="label">Rating</span>
                  <span className="value">⭐ {selectedMechanic.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Jobs</span>
                  <span className="value">{selectedMechanic.total_jobs || 0}</span>
                </div>
                {detailData?.bookingStats && (
                  <>
                    <div className="detail-row">
                      <span className="label">Completed Bookings</span>
                      <span className="value">{detailData.bookingStats.completed || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Rejected Bookings</span>
                      <span className="value">{detailData.bookingStats.rejected || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Registration Info */}
              <div className="detail-section">
                <h4>Registration</h4>
                <div className="detail-row">
                  <span className="label">Registered On</span>
                  <span className="value">
                    {new Date(selectedMechanic.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Firebase UID</span>
                  <span className="value" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                    {selectedMechanic.firebase_uid}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {selectedMechanic.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      onClick={() => handleAction(selectedMechanic.id, 'approve')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => handleAction(selectedMechanic.id, 'reject')}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {selectedMechanic.status === 'approved' && (
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => handleAction(selectedMechanic.id, 'block')}
                  >
                    🚫 Block Mechanic
                  </button>
                )}
                {(selectedMechanic.status === 'rejected' || selectedMechanic.status === 'blocked') && (
                  <button
                    className="btn btn-success"
                    style={{ flex: 1 }}
                    onClick={() => handleAction(selectedMechanic.id, 'approve')}
                  >
                    ✓ Approve Mechanic
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

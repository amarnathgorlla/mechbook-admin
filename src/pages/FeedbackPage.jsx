import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [senderType, setSenderType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState(null)

  useEffect(() => {
    loadFeedback()
  }, [senderType])

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const data = await adminAPI.getFeedback(senderType, searchQuery)
      setFeedbackList(data.feedback || [])
    } catch (err) {
      console.error('Failed to load feedback:', err)
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

  const renderStars = (rating) => {
    if (!rating) return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>N/A</span>
    return (
      <span style={{ color: 'var(--color-amber)', letterSpacing: '2px' }}>
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      </span>
    )
  }

  const filters = [
    { key: 'all', label: 'All Reviews' },
    { key: 'user', label: '👤 User Feedback' },
    { key: 'mechanic', label: '🔧 Mechanic Feedback' },
  ]

  const closeDetail = () => setSelectedFeedback(null)

  return (
    <div>
      <div className="page-header">
        <h2>Feedback Log</h2>
        <p>Reviews and queries submitted by users and mechanic partners</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>All Feedback ({feedbackList.length})</h3>
          <div className="table-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search by name, phone, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadFeedback()}
                className="form-input"
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '240px' }}
              />
              <button className="btn btn-outline btn-sm" onClick={loadFeedback}>Search</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`filter-btn ${senderType === f.key ? 'active' : ''}`}
                  onClick={() => setSenderType(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : feedbackList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Rating</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className={`badge ${f.sender_type === 'user' ? 'badge-pending' : 'badge-approved'}`}>
                      {f.sender_type === 'user' ? '👤 User' : '🔧 Partner'}
                    </span>
                  </td>
                  <td className="cell-main">{f.sender_name || 'Anonymous'}</td>
                  <td>{f.sender_phone || 'N/A'}</td>
                  <td>{renderStars(f.rating)}</td>
                  <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.message}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatDate(f.created_at)}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedFeedback(f)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>{senderType !== 'all' ? `No ${senderType} feedback logs` : 'No feedback logs yet'}</p>
          </div>
        )}
      </div>

      {selectedFeedback && (
        <>
          <div className="side-panel-overlay" onClick={closeDetail} />
          <div className="side-panel">
            <div className="side-panel-header">
              <h3>Feedback Details</h3>
              <button className="side-panel-close" onClick={closeDetail}>✕</button>
            </div>
            <div className="side-panel-body">
              <div className="detail-section">
                <h4>Sender Identity</h4>
                <div className="detail-row">
                  <span className="label">Account Type</span>
                  <span className={`badge ${selectedFeedback.sender_type === 'user' ? 'badge-pending' : 'badge-approved'}`}>
                    {selectedFeedback.sender_type === 'user' ? '👤 User App Client' : '🔧 Mechanic Partner'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Name</span>
                  <span className="value">{selectedFeedback.sender_name || 'Anonymous'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{selectedFeedback.sender_phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Submission Details</h4>
                <div className="detail-row">
                  <span className="label">Star Rating</span>
                  <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderStars(selectedFeedback.rating)}
                    {selectedFeedback.rating ? `(${selectedFeedback.rating}/5)` : ''}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Submitted At</span>
                  <span className="value">{formatDate(selectedFeedback.created_at)}</span>
                </div>
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none' }}>
                  <span className="label" style={{ marginBottom: '10px' }}>Feedback Message / Query</span>
                  <div
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.93rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selectedFeedback.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

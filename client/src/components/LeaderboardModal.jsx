import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function LeaderboardModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('highScores'); // 'highScores' | 'history'
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lbRes, histRes] = await Promise.all([
        api.getLeaderboard(15),
        api.getHistory(20)
      ]);
      setLeaderboard(lbRes.leaderboard || []);
      setHistory(histRes.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return 'Recently';
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Leaderboard and History">
      <div className="modal-card modal-large">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">🏆</span>
            <div>
              <h2>Hall of Fame</h2>
              <p className="modal-subtitle">
                Local Leaderboard &bull; Offline SQLite Storage
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'highScores' ? 'active' : ''}`}
            onClick={() => setActiveTab('highScores')}
          >
            🥇 Top High Scores
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Recent Matches
          </button>
        </div>

        <div className="modal-body leaderboard-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching records from local database...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button className="btn btn-secondary" onClick={loadData}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && activeTab === 'highScores' && (
            <>
              {leaderboard.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🎴</span>
                  <h3>No High Scores Yet</h3>
                  <p>Complete a level to record your first legendary record!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Level</th>
                        <th>Score</th>
                        <th>Moves</th>
                        <th>Time</th>
                        <th>Stars</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((item, idx) => {
                        const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                        return (
                          <tr key={item.id}>
                            <td className="rank-col">{rankMedal}</td>
                            <td>
                              <span className="level-tag">Lv {item.level_number}</span>
                            </td>
                            <td className="score-col">{item.score.toLocaleString()}</td>
                            <td>{item.moves}</td>
                            <td>{formatDuration(item.duration_seconds)}</td>
                            <td className="stars-col">
                              {'★'.repeat(item.stars)}
                              {'☆'.repeat(3 - item.stars)}
                            </td>
                            <td className="date-col">{formatDate(item.completed_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!loading && !error && activeTab === 'history' && (
            <>
              {history.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">⌛</span>
                  <h3>No Matches Recorded</h3>
                  <p>Play a round to start building your personal match log.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Level</th>
                        <th>Mode</th>
                        <th>Score</th>
                        <th>Moves</th>
                        <th>Time</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            <span className="level-tag">Lv {item.level_number}</span>
                          </td>
                          <td>
                            <span className="mode-badge">{item.mode}</span>
                          </td>
                          <td className="score-col">{item.score.toLocaleString()}</td>
                          <td>{item.moves}</td>
                          <td>{formatDuration(item.duration_seconds)}</td>
                          <td className="date-col">{formatDate(item.completed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

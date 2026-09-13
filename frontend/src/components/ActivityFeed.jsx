import React from 'react';
import { useStore } from '../store.js';

function formatTime(ts) {
  if (!ts) return '—';
  // Timestamps from the backend are ms since epoch
  const d = new Date(typeof ts === 'number' && ts < 1e12 ? ts * 1000 : ts);
  return d.toLocaleTimeString();
}

const TYPE_COLORS = {
  INCIDENT_CREATED:  '#f59e0b',
  INCIDENT_CLOSED:   '#22c55e',
  INCIDENT_ACKNOWLEDGED: '#ef4444',
  STATE_CHANGED:     '#3b82f6'
};

export default function ActivityFeed() {
  const activityFeed = useStore((s) => s.activityFeed);

  return (
    <div className="activity-feed">
      <h2 className="section-title">Activity Feed</h2>
      <table className="feed-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Machine</th>
            <th>Event</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {activityFeed.length === 0 ? (
            <tr>
              <td colSpan={4} className="feed-empty">No events yet — waiting for data…</td>
            </tr>
          ) : (
            activityFeed.map((ev) => (
              <tr key={ev.id}>
                <td className="feed-time">{formatTime(ev.timestamp)}</td>
                <td className="feed-machine">{ev.machine_id}</td>
                <td>
                  <span
                    className="feed-type"
                    style={{ color: TYPE_COLORS[ev.type] || '#94a3b8' }}
                  >
                    {ev.type}
                  </span>
                </td>
                <td className="feed-reason">{ev.reason || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

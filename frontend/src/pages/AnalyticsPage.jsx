import React from 'react';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Translation Accuracy', value: '98.4%', change: '+2.1%', color: '#10b981' },
    { label: 'Motion Frame Rate', value: '60 FPS', change: 'Smooth WebGL', color: '#38bdf8' },
    { label: 'Kinematic Latency', value: '42 ms', change: 'Zero Lag', color: '#ec4899' },
    { label: 'Supported Vocab', value: '100%', change: 'Dynamic Spline Fallback', color: '#f59e0b' }
  ];

  const recentLogs = [
    { time: 'Just now', query: 'Tomorrow I am going to college because I have an important project review.', tokens: 8, latency: '38ms', status: 'Optimal' },
    { time: '2m ago', query: 'Good morning what to do next to learn', tokens: 6, latency: '31ms', status: 'Optimal' },
    { time: '5m ago', query: 'Hello everyone, my name is Jashwan Karan.', tokens: 6, latency: '44ms', status: 'Optimal' },
    { time: '12m ago', query: 'Welcome to our computer science class.', tokens: 5, latency: '29ms', status: 'Optimal' }
  ];

  return (
    <div className="analytics-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">📊 REAL-TIME TELEMETRY</span>
          <h2>Rainbow Analytics & Performance Dashboard</h2>
          <p>Live metrics on linguistic accuracy, kinematic frame rates, speech synthesis, and translation speed.</p>
        </div>
      </header>

      {/* Rainbow Metric Cards */}
      <section className="analytics-stat-grid">
        {stats.map((st) => (
          <div key={st.label} className="rainbow-metric-card" style={{ '--metric-color': st.color }}>
            <span className="metric-label">{st.label}</span>
            <strong className="metric-value">{st.value}</strong>
            <span className="metric-change" style={{ color: st.color }}>{st.change}</span>
          </div>
        ))}
      </section>

      {/* Rainbow Architecture Diagram */}
      <RainbowPipelineDiagram activeStep="all" />

      {/* Translation Logs Table */}
      <section className="logs-card-section">
        <h3>Recent Real-Time Sign Translations</h3>
        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>English Input Sentence</th>
                <th>ASL Kinematic Units</th>
                <th>Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.time}</td>
                  <td><strong style={{ color: '#e2e8f0' }}>"{log.query}"</strong></td>
                  <td><span className="token-count-pill">{log.tokens} Signs</span></td>
                  <td><span className="latency-tag">{log.latency}</span></td>
                  <td><span className="status-badge optimal">{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

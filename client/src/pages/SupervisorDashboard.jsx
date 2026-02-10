import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function SupervisorDashboard() {
    const { logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchAllLogs();
    }, []);

    const fetchAllLogs = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/dtr/all-logs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setLogs(await res.json());
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!filterDate) return true;
        return new Date(log.timestamp).toISOString().startsWith(filterDate);
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Supervisor Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Overview of all employee logs</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '8px 16px', borderRadius: '8px' }}>
                    Logout
                </button>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    style={{ maxWidth: '200px' }}
                />
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '1rem' }}>Employee</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Time</th>
                            <th style={{ padding: '1rem' }}>Snapshot</th>
                            <th style={{ padding: '1rem' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{log.full_name || log.username}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: log.type === 'IN' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: log.type === 'IN' ? '#34d399' : '#ef4444'
                                    }}>
                                        {log.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    {log.snapshot_image ? (
                                        <a href={`http://localhost:3000/${log.snapshot_image}`} target="_blank" style={{ color: 'var(--accent-primary)' }}>View</a>
                                    ) : '-'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {(log.verification_score * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

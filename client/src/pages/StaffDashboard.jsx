import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useAuth } from '../auth/AuthProvider';

export default function StaffDashboard() {
    const { user, logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [logType, setLogType] = useState(null); // 'IN' or 'OUT'
    const webcamRef = useRef(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/dtr/my-logs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setLogs(await res.json());
        }
    };

    const handleClockClick = (type) => {
        setLogType(type);
        setShowCamera(true);
        setMessage('');
    };

    const captureAndLog = async () => {
        const imageSrc = webcamRef.current.getScreenshot();

        // Convert base64 to blob
        const blob = await (await fetch(imageSrc)).blob();
        const formData = new FormData();
        formData.append('snapshot', blob, 'capture.jpg');
        formData.append('type', logType);
        formData.append('verification_score', 0.99); // Stubbed score from client AI

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3000/api/dtr/log', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setMessage(`Successfully Clocked ${logType}!`);
                setShowCamera(false);
                fetchLogs();
            } else {
                setMessage('Error generating log.');
            }
        } catch (e) {
            console.error(e);
            setMessage('Network error.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Hello, {user?.username}</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Staff Dashboard</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn-primary" onClick={() => handleClockClick('IN')} style={{ fontSize: '1.2rem', padding: '2rem' }}>
                    🕒 Clock In
                </button>
                <button className="btn-primary" onClick={() => handleClockClick('OUT')} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-secondary)', fontSize: '1.2rem', padding: '2rem' }}>
                    👋 Clock Out
                </button>
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Verify Face to Clock {logType}</h3>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--accent-primary)', marginBottom: '1rem' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={320}
                            height={240}
                            videoConstraints={{ facingMode: "user" }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" onClick={captureAndLog}>Capture & Verify</button>
                        <button onClick={() => setShowCamera(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '8px', marginBottom: '1rem' }}>{message}</div>}

            {/* Logs List */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {logs.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <span style={{ fontWeight: 600, color: log.type === 'IN' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{log.type}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                    ))}
                    {logs.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No logs found.</p>}
                </div>
            </div>
        </div>
    );
}

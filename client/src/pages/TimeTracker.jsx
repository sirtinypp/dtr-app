import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function TimeTracker() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [showWebcam, setShowWebcam] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [workSetup, setWorkSetup] = useState('ONSITE');
    const [loading, setLoading] = useState(false);
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (!u) navigate('/');
        setUser(u);

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchLogs();
        return () => clearInterval(timer);
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('logs/');
            setLogs(res.data.slice(0, 5)); // Only show last 5
        } catch (err) {
            console.error(err);
        }
    };

    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        });
    };

    const handleCapture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            alert("Camera not ready!");
            return;
        }

        setLoading(true);
        try {
            // Get Location
            let location;
            try {
                location = await getCurrentPosition();
            } catch (err) {
                console.error("Location error:", err);
                alert("Location access is MANDATORY. Please enable location services in your browser settings.");
                setLoading(false);
                return;
            }

            const blob = await (await fetch(imageSrc)).blob();
            const file = new File([blob], `${actionType}_${Date.now()}.jpg`, { type: "image/jpeg" });

            const formData = new FormData();

            // Add Location Data
            if (actionType === 'in') {
                formData.append('latitude_in', location.latitude);
                formData.append('longitude_in', location.longitude);
                formData.append('image_in', file);
                formData.append('work_setup', workSetup);
                await api.post('logs/clock_in/', formData);
            } else {
                const lastLog = logs.find(l => !l.time_out);
                if (lastLog) {
                    formData.append('latitude_out', location.latitude);
                    formData.append('longitude_out', location.longitude);
                    formData.append('image_out', file);
                    await api.post(`logs/${lastLog.id}/clock_out/`, formData);
                } else {
                    alert("No active log found to clock out!");
                    setLoading(false);
                    return;
                }
            }

            setShowWebcam(false);
            fetchLogs();
            alert("Successfully logged with location!");
        } catch (err) {
            console.error(err);
            alert(`Error: ${err.response?.data?.detail || err.message || "Something went wrong"}`);
        } finally {
            setLoading(false);
        }
    };

    const openCamera = (type) => {
        setActionType(type);
        setShowWebcam(true);
    };

    const activeLog = logs.find(l => !l.time_out && new Date(l.date).toDateString() === new Date().toDateString());

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
                {/* Admin Panel Button (Staff Only) */}
                {user?.is_staff && (
                    <div className="mb-6 flex justify-end">
                        <a
                            href="http://localhost:8000/admin/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Admin Panel</span>
                        </a>
                    </div>
                )}

                {/* Time Display Card */}
                <div className="card mb-6 text-center">
                    <div className="text-5xl md:text-6xl font-tech font-bold text-primary-700 mb-2 tracking-wider">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-lg text-gray-600">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Status Card */}
                <div className={`card mb-6 ${activeLog ? 'border-2 border-success-500' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${activeLog ? 'status-active' : 'status-inactive'}`}></div>
                            <div>
                                <p className="text-sm text-gray-600">Current Status</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {activeLog ? 'Clocked In' : 'Not Clocked In'}
                                </p>
                            </div>
                        </div>
                        {activeLog && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Since</p>
                                <p className="text-sm font-mono font-medium text-success-600">
                                    {new Date(activeLog.time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Work Setup Selection (only when not clocked in) */}
                {!activeLog && (
                    <div className="card mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Work Arrangement</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'ONSITE', label: 'Office', icon: '🏢' },
                                { value: 'WFH', label: 'WFH', icon: '🏠' },
                                { value: 'FIELD', label: 'Field', icon: '🌍' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setWorkSetup(option.value)}
                                    className={`touch-target flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${workSetup === option.value
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{option.icon}</span>
                                    <span className="text-sm font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => openCamera('in')}
                        disabled={!!activeLog}
                        className={`btn btn-lg touch-target flex flex-col items-center justify-center gap-2 ${activeLog ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-success'
                            }`}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-lg font-bold">Time In</span>
                    </button>

                    <button
                        onClick={() => openCamera('out')}
                        disabled={!activeLog}
                        className={`btn btn-lg touch-target flex flex-col items-center justify-center gap-2 ${!activeLog ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-danger'
                            }`}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-lg font-bold">Time Out</span>
                    </button>
                </div>

                {/* Recent Logs */}
                <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No logs yet</p>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">
                                                {new Date(log.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {new Date(log.date).getDate()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-primary text-xs">{log.work_setup}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-success-600 font-mono">
                                            ↓ {new Date(log.time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {log.time_out && (
                                            <p className="text-xs text-danger-600 font-mono">
                                                ↑ {new Date(log.time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Webcam Modal */}
            {showWebcam && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full animate-scale-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                            {actionType === 'in' ? 'Clock In' : 'Clock Out'} - Capture Photo
                        </h3>
                        <div className="mb-4 rounded-xl overflow-hidden">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full"
                                videoConstraints={{
                                    facingMode: 'user'
                                }}
                                onUserMediaError={(err) => alert("Camera Error: " + err)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWebcam(false)}
                                disabled={loading}
                                className="btn btn-outline flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCapture}
                                disabled={loading}
                                className={`btn flex-1 ${actionType === 'in' ? 'btn-success' : 'btn-danger'}`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    `Capture & ${actionType === 'in' ? 'Time In' : 'Time Out'}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

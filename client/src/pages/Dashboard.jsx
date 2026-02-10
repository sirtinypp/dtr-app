import { useState, useEffect } from 'react';
import api from '../api';
import Layout from '../components/Layout';

export default function Dashboard() {
    const [logs, setLogs] = useState([]);
    const [offices, setOffices] = useState([]);
    const [filterOffice, setFilterOffice] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [printYear, setPrintYear] = useState(new Date().getFullYear());
    const [printMonth, setPrintMonth] = useState(new Date().getMonth() + 1);
    const [printPeriod, setPrintPeriod] = useState('1');

    useEffect(() => {
        fetchLogs();
        fetchOffices();
    }, [filterOffice, filterDate]);

    const fetchLogs = async () => {
        try {
            let query = '?';
            if (filterOffice) query += `office=${filterOffice}&`;
            if (filterDate) query += `date=${filterDate}&`;
            const res = await api.get(`logs/${query}`);
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOffices = async () => {
        try {
            const res = await api.get('offices/');
            setOffices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadPDF = async () => {
        let startDate, endDate;
        const y = parseInt(printYear);
        const m = parseInt(printMonth);

        if (printPeriod === '1') {
            startDate = `${y}-${String(m).padStart(2, '0')}-01`;
            endDate = `${y}-${String(m).padStart(2, '0')}-15`;
        } else {
            startDate = `${y}-${String(m).padStart(2, '0')}-16`;
            const lastDay = new Date(y, m, 0).getDate();
            endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("You are not logged in!");
            return;
        }

        const url = `/api/logs/download_dtr/?start_date=${startDate}&end_date=${endDate}&token=${token}`;
        window.open(url, '_blank');
    };

    const todayLogs = logs.filter(l => l.date === new Date().toISOString().split('T')[0]);
    const activeNow = todayLogs.filter(l => !l.time_out).length;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Total Logs</p>
                        <p className="text-2xl md:text-3xl font-bold text-primary-700">{logs.length}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Today</p>
                        <p className="text-2xl md:text-3xl font-bold text-success-600">{todayLogs.length}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Active Now</p>
                        <div className="flex items-center gap-2">
                            <div className="status-dot status-active"></div>
                            <p className="text-2xl md:text-3xl font-bold text-gray-900">{activeNow}</p>
                        </div>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Offices</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-700">{offices.length}</p>
                    </div>
                </div>

                {/* PDF Generation Card */}
                <div className="card mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-base md:text-lg font-bold text-gray-900">Generate DTR (PDF)</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <select
                            className="input text-sm"
                            value={printMonth}
                            onChange={(e) => setPrintMonth(e.target.value)}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="input text-sm"
                            value={printYear}
                            onChange={(e) => setPrintYear(e.target.value)}
                            placeholder="Year"
                        />
                        <select
                            className="input text-sm"
                            value={printPeriod}
                            onChange={(e) => setPrintPeriod(e.target.value)}
                        >
                            <option value="1">1st Period (1-15)</option>
                            <option value="2">2nd Period (16-End)</option>
                        </select>
                        <button
                            onClick={handleDownloadPDF}
                            className="btn btn-danger text-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden md:inline">Download PDF</span>
                            <span className="md:hidden">PDF</span>
                        </button>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="card mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h2 className="text-base md:text-lg font-bold text-gray-900">Table Filters</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                            className="input text-sm"
                            value={filterOffice}
                            onChange={(e) => setFilterOffice(e.target.value)}
                        >
                            <option value="">All Offices</option>
                            {offices.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            className="input text-sm"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto scrollbar-thin">
                        <table className="w-full">
                            <thead className="bg-primary-600 text-white">
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold">Employee</th>
                                    <th className="p-3 text-left text-sm font-semibold hidden md:table-cell">Office</th>
                                    <th className="p-3 text-left text-sm font-semibold">Date</th>
                                    <th className="p-3 text-left text-sm font-semibold">Time In</th>
                                    <th className="p-3 text-left text-sm font-semibold">Time Out</th>
                                    <th className="p-3 text-left text-sm font-semibold hidden md:table-cell">Setup</th>
                                    <th className="p-3 text-left text-sm font-semibold hidden lg:table-cell">Images</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                            No logs found
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-sm font-medium text-gray-900">
                                                {log.user_details?.first_name} {log.user_details?.last_name}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600 hidden md:table-cell">
                                                {log.office_name || '-'}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="p-3 text-sm font-mono text-success-600">
                                                {new Date(log.time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-3 text-sm font-mono">
                                                {log.time_out ? (
                                                    <span className="text-danger-600">
                                                        {new Date(log.time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-success">Active</span>
                                                )}
                                            </td>
                                            <td className="p-3 hidden md:table-cell">
                                                <span className={`badge ${log.work_setup === 'ONSITE' ? 'badge-primary' :
                                                    log.work_setup === 'WFH' ? 'badge-warning' :
                                                        'badge-success'
                                                    }`}>
                                                    {log.work_setup}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm hidden lg:table-cell">
                                                <div className="flex gap-2">
                                                    {log.image_in && (
                                                        <a
                                                            href={log.image_in}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-success-600 hover:text-success-700 font-medium"
                                                        >
                                                            In
                                                        </a>
                                                    )}
                                                    {log.image_out && (
                                                        <a
                                                            href={log.image_out}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-danger-600 hover:text-danger-700 font-medium"
                                                        >
                                                            Out
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

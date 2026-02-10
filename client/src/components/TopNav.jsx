import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function TopNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">OVPA DTR</h1>
                            <p className="text-xs text-gray-500">Daily Time Record</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            to="/tracker"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/tracker'
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Time Tracker
                        </Link>

                        <Link
                            to="/dashboard"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/dashboard'
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Dashboard
                        </Link>

                        {/* User Menu */}
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{user.username}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-ghost text-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

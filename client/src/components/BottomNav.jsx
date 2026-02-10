import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navItems = [
        {
            name: 'Tracker',
            path: '/tracker',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    navItems.push({
        name: 'Dashboard',
        path: '/dashboard',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    });

    navItems.push({
        name: 'Logout',
        action: handleLogout,
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        ),
    });

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = item.path && location.pathname === item.path;

                    if (item.action) {
                        return (
                            <button
                                key={item.name}
                                onClick={item.action}
                                className="flex-1 flex flex-col items-center justify-center py-3 touch-target text-gray-600 hover:text-danger-600 transition-colors"
                            >
                                {item.icon}
                                <span className="text-xs mt-1 font-medium">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex-1 flex flex-col items-center justify-center py-3 touch-target transition-colors ${isActive
                                ? 'text-primary-600'
                                : 'text-gray-600 hover:text-primary-600'
                                }`}
                        >
                            {item.icon}
                            <span className="text-xs mt-1 font-medium">{item.name}</span>
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

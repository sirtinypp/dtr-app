import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate user from token if persists (simple check, ideally verify with backend)
        if (token) {
            try {
                // Decode payload simply for role/id (JWT is 3 parts)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: payload.id, role: payload.role, username: payload.username });
            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

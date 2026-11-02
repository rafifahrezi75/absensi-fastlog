import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const initialUser = typeof window !== 'undefined' && window.__INITIAL_USER__ !== undefined
        ? window.__INITIAL_USER__
        : null;

    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(typeof window !== 'undefined' && window.__INITIAL_USER__ === undefined);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.__INITIAL_USER__ !== undefined) {
            return;
        }

        api.get('/api/user')
            .then(res => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

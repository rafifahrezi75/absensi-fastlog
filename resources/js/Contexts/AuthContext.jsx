import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cek sesi aktif saat aplikasi pertama kali dimuat
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

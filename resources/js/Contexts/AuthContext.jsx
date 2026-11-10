import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const initialAuth = typeof window !== 'undefined' && window.__INITIAL_AUTH__ !== undefined
        ? window.__INITIAL_AUTH__
        : null;

    const [user, setUser] = useState(initialAuth ? initialAuth.user : (typeof window !== 'undefined' ? window.__INITIAL_USER__ || null : null));
    const [roles, setRoles] = useState(initialAuth ? initialAuth.roles : []);
    const [permissions, setPermissions] = useState(initialAuth ? initialAuth.permissions : []);
    const [loading, setLoading] = useState(typeof window !== 'undefined' && window.__INITIAL_AUTH__ === undefined && window.__INITIAL_USER__ === undefined);

    const refreshAuth = async () => {
        try {
            const res = await api.get('/api/user');
            setUser(res.data.user);
            setRoles(res.data.roles || []);
            setPermissions(res.data.permissions || []);
            return res.data;
        } catch {
            setUser(null);
            setRoles([]);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.__INITIAL_AUTH__ !== undefined) {
            return;
        }
        refreshAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        setUser(res.data.user);
        setRoles(res.data.roles || []);
        setPermissions(res.data.permissions || []);
        return res.data.user;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            setUser(null);
            setRoles([]);
            setPermissions([]);
        }
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'admin' || roles.includes('super_admin')) return true;
        return permissions.includes(permission);
    };

    const hasRole = (role) => {
        if (!user) return false;
        if (user.role === 'admin' && (role === 'super_admin' || role === 'admin')) return true;
        if (Array.isArray(role)) return role.some(r => roles.includes(r));
        return roles.includes(role);
    };

    return (
        <AuthContext.Provider value={{ user, roles, permissions, hasPermission, hasRole, refreshAuth, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error('Error fetching user:', err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // Register User
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', userData);
            return { success: true, message: res.data.message };
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            return { success: false, error: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };

    // Login User
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, user };
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };

    // Google Login
    const googleLogin = async (tokenId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/google', { tokenId });
            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, user };
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
            return { success: false, error: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, register, login, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

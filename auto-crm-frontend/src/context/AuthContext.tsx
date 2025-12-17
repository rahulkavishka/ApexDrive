import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Define the API Base URL dynamically
// If VITE_API_URL is set (Production), use it. Otherwise use localhost (Development).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthContextType {
    user: any;
    token: string | null;
    isManager: boolean;
    login: (username: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isManager, setIsManager] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to fetch profile
    const fetchProfile = async (currentToken: string) => {
        try {
            axios.defaults.headers.common['Authorization'] = `Token ${currentToken}`;
            // UPDATED: Use API_URL constant
            const res = await axios.get(`${API_URL}/api/me/`);

            console.log("🔍 API CHECK:", res.data);
            setUser({ username: res.data.username });
            setIsManager(res.data.is_manager);
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const login = async (username: string, pass: string) => {
        // UPDATED: Use API_URL constant
        const res = await axios.post(`${API_URL}/api-token-auth/`, {
            username: username,
            password: pass
        });
        const newToken = res.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);

        await fetchProfile(newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsManager(false);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        if (token) {
            fetchProfile(token).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, isManager, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
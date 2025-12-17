import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: any;
    token: string | null;
    isManager: boolean;  // <--- NEW: Simple flag for permissions
    login: (username: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isManager, setIsManager] = useState(false); // <--- NEW
    const [isLoading, setIsLoading] = useState(true);

    // Helper to fetch profile
    const fetchProfile = async (currentToken: string) => {
        try {
            axios.defaults.headers.common['Authorization'] = `Token ${currentToken}`;
            const res = await axios.get('http://localhost:8000/api/me/');

            // --- ADD THESE DEBUG LOGS ---
            console.log("🔍 API CHECK:", res.data);
            console.log("👤 User:", res.data.username);
            console.log("🛡️ Is Manager?", res.data.is_manager);
            // ----------------------------

            setUser({ username: res.data.username });
            setIsManager(res.data.is_manager);
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const login = async (username: string, pass: string) => {
        const res = await axios.post('http://localhost:8000/api-token-auth/', {
            username: username,
            password: pass
        });
        const newToken = res.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);

        // Fetch Role immediately after login
        await fetchProfile(newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsManager(false);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Restore session on refresh
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
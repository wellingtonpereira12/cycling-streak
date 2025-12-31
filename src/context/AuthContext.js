import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            setUserToken(token);
            setUser(user);
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (e) {
            console.error('Login error in AuthContext');
            console.error('Error status:', e.response?.status);
            console.error('Error message:', e.response?.data?.msg);
            throw e;
        }
    };

    const register = async (nome, email, password) => {
        try {
            const res = await api.post('/auth/register', { nome, email, password });
            const { token, user } = res.data;
            setUserToken(token);
            setUser(user);
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (e) {
            console.error('Register error', e);
            throw e;
        }
    };

    const logout = async () => {
        console.log("Logging out function called");

        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');

            // Also clear localStorage for web compatibility
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('userToken');
                window.localStorage.removeItem('userData');
                window.localStorage.clear(); // Clear everything
            }

            console.log("Storage cleared");
        } catch (e) {
            console.error("Error clearing storage", e);
        }

        // Update UI
        setUserToken(null);
        setUser(null);

        // Force reload on web to clear all state
        // Force reload on web to clear all state
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    const isLoggedIn = async () => {
        try {
            let userToken = await AsyncStorage.getItem('userToken');
            let userData = await AsyncStorage.getItem('userData');
            if (userToken) {
                setUserToken(userToken);
                setUser(JSON.parse(userData));
            }
        } catch (e) {
            console.log('isLoggedIn error', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, register, userToken, isLoading, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

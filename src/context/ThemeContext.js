import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState('automatic'); // 'automatic', 'light', 'dark'
    const [currentTheme, setCurrentTheme] = useState(systemColorScheme === 'dark' ? darkTheme : lightTheme);

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        if (themePreference === 'automatic') {
            setCurrentTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        } else if (themePreference === 'dark') {
            setCurrentTheme(darkTheme);
        } else {
            setCurrentTheme(lightTheme);
        }
    }, [themePreference, systemColorScheme]);

    const loadThemePreference = async () => {
        try {
            const savedPreference = await AsyncStorage.getItem('themePreference');
            if (savedPreference) {
                setThemePreference(savedPreference);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const updateThemePreference = async (preference) => {
        try {
            setThemePreference(preference);
            await AsyncStorage.setItem('themePreference', preference);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme: currentTheme,
            themePreference,
            setThemePreference: updateThemePreference,
            isDark: themePreference === 'automatic' ? systemColorScheme === 'dark' : themePreference === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

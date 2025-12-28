import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
    const { userToken } = useAuth();
    const [rides, setRides] = useState([]);
    const [streakData, setStreakData] = useState({
        streak: 0,
        record: 0,
        riskLevel: 'safe',
        daysMissed: 0,
        lastRideDate: null
    });
    const [loading, setLoading] = useState(false);

    const fetchDashboard = useCallback(async () => {
        if (!userToken) return;
        setLoading(true);
        try {
            const res = await api.get('/rides/dashboard');
            const { streak, recentRides } = res.data;

            // Calculate Risk
            let riskLevel = 'safe';
            let daysMissed = 0;
            let currentStreak = streak ? streak.ofensiva_atual : 0;

            if (streak && streak.ultimo_pedal) {
                const lastDate = new Date(streak.ultimo_pedal);
                const today = new Date();
                // Reset time part for accurate day diff
                lastDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                const diffTime = Math.abs(today - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysMissed = diffDays;

                // If 4 or more days passed, streak is lost
                if (diffDays >= 4) {
                    currentStreak = 0;
                    riskLevel = 'lost';
                } else if (diffDays >= 2) {
                    riskLevel = 'danger'; // 2 days gap means if you don't ride today, you lose it
                } else if (diffDays === 1) {
                    riskLevel = 'safe';
                }
            } else {
                // No rides yet or streak 0
                daysMissed = 0; // or null
            }

            setStreakData({
                streak: currentStreak,
                record: streak ? streak.ofensiva_recorde : 0,
                lastRideDate: streak ? streak.ultimo_pedal : null,
                riskLevel,
                daysMissed
            });

            setRides(recentRides || []);

        } catch (e) {
            console.error("Failed to fetch dashboard", e);
        } finally {
            setLoading(false);
        }
    }, [userToken]);

    useEffect(() => {
        if (userToken) {
            fetchDashboard();
        }
    }, [userToken, fetchDashboard]);

    const addRide = async (distancia, duracao) => {
        try {
            // Default dummy values if not provided, for the "One Click" button
            const payload = {
                distancia_km: distancia || 10,
                duracao_min: duracao || 30,
                data_pedal: new Date().toISOString()
            };

            const res = await api.post('/rides', payload);
            console.log("Ride added:", res.data);

            // Refresh dashboard and history
            await fetchDashboard();

            return res.data;
        } catch (e) {
            console.error("Failed to add ride", e.response ? e.response.data : e.message);
            throw e;
        }
    };

    const loadHistory = async () => {
        try {
            const res = await api.get('/rides');
            return res.data;
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    };

    const refresh = async () => {
        await fetchDashboard();
    };

    return (
        <RideContext.Provider value={{
            rides,
            streakData,
            addRide,
            loadHistory,
            refresh: fetchDashboard,
            loading
        }}>
            {children}
        </RideContext.Provider>
    );
};

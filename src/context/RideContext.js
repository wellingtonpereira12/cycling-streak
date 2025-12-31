import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const RideContext = createContext();

import * as LocationTracker from '../services/LocationTracking';

export const RideProvider = ({ children }) => {
    const { userToken } = useAuth();
    const [rides, setRides] = useState([]);
    const [streakData, setStreakData] = useState({
        streak: 0,
        record: 0,
        riskLevel: 'safe',
        daysMissed: 0,
        lastRideDate: null,
        totalDistance: 0,
        totalDuration: 0
    });
    const [loading, setLoading] = useState(false);

    // Live Ride State
    const [isRecording, setIsRecording] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [liveStats, setLiveStats] = useState({ distance: 0, duration: 0, path: [] });

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
                totalDistance: streak ? Number(streak.km_total || 0) : 0,
                totalDuration: streak ? Number(streak.tempo_total || 0) : 0,
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

    // Check if tracking is already running (e.g. after reload or app restart)
    useEffect(() => {
        const checkTracking = async () => {
            const tracking = await LocationTracker.isTracking();
            if (tracking) {
                console.log("Found lingering recording on startup. Cancelling as requested...");
                // User requested to CANCEL if app was closed
                await LocationTracker.stopTracking();
                setIsRecording(false);
                setLiveStats({ distance: 0, duration: 0, path: [] });
            }
        };
        checkTracking();
    }, []);

    const startLiveRide = async () => {
        try {
            await LocationTracker.startTracking((stats) => {
                setLiveStats(stats);
            });
            setIsRecording(true);
            setIsModalVisible(true);
            return true;
        } catch (error) {
            console.error("Error starting ride:", error);
            throw error;
        }
    };

    const stopLiveRide = async (save = true) => {
        try {
            setIsRecording(false);
            const result = await LocationTracker.stopTracking();

            if (save) {
                // Save to backend
                await addRide(result.distance, result.duration);
            }

            setLiveStats({ distance: 0, duration: 0, path: [] });
            setIsModalVisible(false);
            return result;
        } catch (error) {
            console.error("Error stopping ride:", error);
            throw error;
        }
    };

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
            loading,
            isRecording,
            isModalVisible,
            setIsModalVisible,
            liveStats,
            startLiveRide,
            stopLiveRide
        }}>
            {children}
        </RideContext.Provider>
    );
};

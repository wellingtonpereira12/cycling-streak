import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const RideContext = createContext();

import * as LocationTracker from '../services/LocationTracking';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
    const [isPaused, setIsPaused] = useState(false);
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Daily Stats Calculation
    const [todayStats, setTodayStats] = useState({ distance: 0, duration: 0 });

    useEffect(() => {
        if (!rides || rides.length === 0) {
            setTodayStats({ distance: 0, duration: 0 });
            return;
        }

        const todayStr = getLocalDateString();

        const todaysRides = rides.filter(ride => {
            if (!ride.data_pedal) return false;
            const rideDateStr = ride.data_pedal.split('T')[0];
            return rideDateStr === todayStr;
        });

        const totalDist = todaysRides.reduce((acc, ride) => acc + Number(ride.distancia_km || 0), 0);
        // Map duracao_seg if available, fallback to duracao_min * 60
        const totalDur = todaysRides.reduce((acc, ride) => {
            const seg = ride.duracao_seg ? Number(ride.duracao_seg) : (Number(ride.duracao_min || 0) * 60);
            return acc + seg;
        }, 0);

        setTodayStats({
            distance: totalDist,
            duration: totalDur // Duration is now in SECONDS
        });
    }, [rides]);

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
                totalDuration: streak ? Number(streak.tempo_total || 0) : 0, // tempo_total from dash is now in SECONDS
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

    // Cleanup on logout
    useEffect(() => {
        const handleLogout = async () => {
            if (!userToken && isRecordingRef.current) {
                console.log("Stopping recording due to logout");
                try {
                    await stopLiveRide(false); // Stop without saving
                    cleanupLiveRide();
                } catch (error) {
                    console.error("Error stopping ride on logout:", error);
                }
            }
        };
        handleLogout();
    }, [userToken]);

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
            LocationTracker.setOnPauseChange((paused) => {
                setIsPaused(paused);
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
            const result = await LocationTracker.stopTracking();

            if (save) {
                // Calculate total to save (Daily accumulated total)
                const totalDist = (todayStats.distance || 0) + result.distance;
                const sessionDur = (typeof result.durationSec === 'number' && !isNaN(result.durationSec)) ? result.durationSec : 0;
                const totalDur = (todayStats.duration || 0) + Math.round(sessionDur);

                // Save combined total to backend using seconds
                await addRide(totalDist, totalDur);
            }

            return result;
        } catch (error) {
            console.error("Error stopping ride:", error);
            throw error;
        }
    };

    const cleanupLiveRide = () => {
        setIsRecording(false);
        setIsPaused(false);
        setIsModalVisible(false);
        setLiveStats({ distance: 0, duration: 0, path: [] });
    };

    const pauseRide = () => {
        setIsPaused(true);
        LocationTracker.pauseTracking();
    };

    const resumeRide = () => {
        setIsPaused(false);
        LocationTracker.resumeTracking();
    };

    const addRide = async (distancia, duracao) => {
        try {
            const payload = {
                distancia_km: (typeof distancia === 'number' && !isNaN(distancia)) ? distancia : 0,
                duracao_seg: (typeof duracao === 'number' && !isNaN(duracao)) ? Math.round(duracao) : 0,
                data_pedal: getLocalDateString()
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
            stopLiveRide,
            cleanupLiveRide,
            isPaused,
            pauseRide,
            resumeRide,
            todayStats
        }}>
            {children}
        </RideContext.Provider>
    );
};

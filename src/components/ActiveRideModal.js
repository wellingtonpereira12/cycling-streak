import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { RideContext } from '../context/RideContext';
import { useTheme } from '../context/ThemeContext';
import { StopCircle, MapPin, Watch, ChevronDown, Play, Pause } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ActiveRideModal = () => {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const {
        isRecording,
        isModalVisible,
        setIsModalVisible,
        liveStats,
        stopLiveRide,
        cleanupLiveRide,
        isPaused,
        pauseRide,
        resumeRide,
        todayStats
    } = useContext(RideContext);
    const [durationString, setDurationString] = useState('00:00:00');
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmingStop, setIsConfirmingStop] = useState(false);
    const webViewRef = useRef(null);

    // Memoize HTML content to prevent WebView reloads on every render
    const leafletHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <style>
            body { margin: 0; padding: 0; background-color: ${theme.colors.background}; }
            #map { height: 100vh; width: 100vw; background-color: ${theme.colors.background}; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([-23.55052, -46.633309], 15);

            L.tileLayer('${isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'}', {
                maxZoom: 19
            }).addTo(map);

            var polyline = L.polyline([], {color: '#FF4D4D', weight: 5}).addTo(map);
            var currentMarker = null;

            // Icon for current position
            var icon = L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#FF4D4D; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;'></div>",
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            // React Native WebView uses document.addEventListener instead of window
            document.addEventListener('message', function(event) {
                try {
                    var data = JSON.parse(event.data);
                    
                    if (data.type === 'setCenter') {
                        // Center map on current location
                        var pos = [data.payload.latitude, data.payload.longitude];
                        map.setView(pos, 16);
                        
                        // Add marker if not exists
                        if (!currentMarker) {
                            currentMarker = L.marker(pos, {icon: icon}).addTo(map);
                        }
                    }
                    
                    if (data.type === 'updatePath') {
                        var path = data.payload;
                        var latlngs = path.map(p => [p.latitude, p.longitude]);
                        
                        polyline.setLatLngs(latlngs);

                        if (latlngs.length > 0) {
                            var lastPos = latlngs[latlngs.length - 1];
                            
                            // Update or create marker
                            if (currentMarker) {
                                currentMarker.setLatLng(lastPos);
                            } else {
                                currentMarker = L.marker(lastPos, {icon: icon}).addTo(map);
                            }

                            // Center map
                            map.panTo(lastPos);
                        }
                    }
                } catch (e) {
                    // Silent error handling
                }
            });
            
            // Also support window.ReactNativeWebView for newer versions
            if (window.ReactNativeWebView) {
                window.addEventListener('message', function(event) {
                    document.dispatchEvent(new MessageEvent('message', { data: event.data }));
                });
            }
        </script>
    </body>
    </html>
    `, [isDark, theme.colors.background]);

    useEffect(() => {
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // duration is already in seconds in todayStats
        const totalSeconds = (todayStats?.duration || 0) + liveStats.duration;
        setDurationString(formatTime(totalSeconds));
    }, [liveStats.duration, todayStats]);

    // Send updates to WebView
    const updateMap = (path) => {
        if (webViewRef.current && path && path.length > 0) {
            const message = JSON.stringify({
                type: 'updatePath',
                payload: path
            });
            webViewRef.current.postMessage(message);
        }
    };

    useEffect(() => {
        updateMap(liveStats.path);
    }, [liveStats.path]);

    // Center map on first GPS point received
    useEffect(() => {
        if (isModalVisible && liveStats.path && liveStats.path.length === 1 && webViewRef.current) {
            // When we get the first GPS point, center the map
            const firstPoint = liveStats.path[0];
            const message = JSON.stringify({
                type: 'setCenter',
                payload: {
                    latitude: firstPoint.latitude,
                    longitude: firstPoint.longitude
                }
            });
            webViewRef.current.postMessage(message);
        }
    }, [liveStats.path, isModalVisible]);

    // Send path updates when WebView loads
    const handleWebViewLoad = () => {
        if (liveStats.path && liveStats.path.length > 0 && webViewRef.current) {
            updateMap(liveStats.path);
        }
    };

    const handleStop = () => {
        setIsConfirmingStop(true);
    };

    const onConfirmStop = async () => {
        // Allow saving if either distance > 0 OR duration > 0 (for testing/stationary)
        if (liveStats.distance === 0 && liveStats.duration === 0) {
            await stopLiveRide(false); // False = do not save
            cleanupLiveRide();
            setIsConfirmingStop(false);
        } else {
            try {
                setIsSaving(true);
                setIsConfirmingStop(false);

                // Capture FINAL daily totals for the summary
                const finalDailyStats = {
                    distance: (todayStats?.distance || 0) + liveStats.distance,
                    duration: (todayStats?.duration || 0) + liveStats.duration
                };

                // Stop tracking and save to API
                await stopLiveRide(true);

                // Navigate immediately to summary screen with DAILY TOTALS
                navigation.navigate('RideSummary', { rideData: finalDailyStats });

                // Clean up the modal AFTER navigation has been triggered
                cleanupLiveRide();
                setIsSaving(false);
            } catch (e) {
                setIsSaving(false);
                Alert.alert("Erro", "Falha ao salvar o pedal.");
            }
        }
    };

    const onCancelStop = () => {
        setIsConfirmingStop(false);
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        map: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'space-between',
            pointerEvents: 'box-none',
        },
        header: {
            flexDirection: 'row',
            paddingTop: Platform.OS === 'ios' ? 50 : 40,
            paddingHorizontal: 20,
        },
        minimizeButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
            borderColor: theme.colors.surfaceLight,
            borderWidth: 1,
        },
        bottomSection: {
            justifyContent: 'flex-end',
            pointerEvents: 'box-none',
        },
        statsFloatingCard: {
            backgroundColor: theme.colors.surface,
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            borderColor: theme.colors.surfaceLight,
            borderWidth: 1,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text,
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        statItem: {
            alignItems: 'center',
            flex: 1,
        },
        statValueMain: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text,
            fontVariant: ['tabular-nums'],
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
            fontWeight: '600',
        },
        verticalLine: {
            width: 1,
            height: 30,
            backgroundColor: theme.colors.surfaceLight,
        },
        controlSheet: {
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            paddingHorizontal: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 10,
        },
        sheetHandle: {
            width: 40,
            height: 4,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 24,
        },
        controlsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        circleActionButton: {
            alignItems: 'center',
            gap: 6,
        },
        iconCircleRed: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isDark ? 'rgba(255, 107, 53, 0.1)' : '#FFF1EC',
            alignItems: 'center',
            justifyContent: 'center',
        },
        actionLabel: {
            fontSize: 12,
            color: theme.colors.text,
            fontWeight: '600',
        },
        playButtonContainer: {
            marginTop: -10,
        },
        largePlayButton: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#FF6B35',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FF6B35',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
        },
        loadingCard: {
            backgroundColor: theme.colors.surface,
            padding: 30,
            borderRadius: 20,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
        },
        loadingText: {
            marginTop: 20,
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
        },
        loadingSubtext: {
            marginTop: 8,
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        confirmationContainer: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
        },
        confirmationText: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 20,
            textAlign: 'center',
        },
        confirmationButtons: {
            flexDirection: 'row',
            gap: 16,
            width: '100%',
            justifyContent: 'center',
        },
        confirmButton: {
            backgroundColor: '#FF6B35',
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 30,
            minWidth: 120,
            alignItems: 'center',
            shadowColor: '#FF6B35',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        confirmButtonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '800',
        },
        cancelButton: {
            backgroundColor: theme.colors.surfaceLight,
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 30,
            minWidth: 120,
            alignItems: 'center',
        },
        cancelButtonText: {
            color: theme.colors.textSecondary,
            fontSize: 16,
            fontWeight: '700',
        },
    });

    if (!isRecording) return null;

    return (
        <Modal visible={isModalVisible} animationType="slide" transparent={false}>
            <View style={dynamicStyles.container}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHtml }}
                    style={dynamicStyles.map}
                    scrollEnabled={false}
                    onLoadEnd={() => {
                        updateMap(liveStats.path);
                        handleWebViewLoad();
                    }}
                />

                <View style={dynamicStyles.overlay}>
                    <View style={dynamicStyles.header}>
                        <TouchableOpacity
                            style={dynamicStyles.minimizeButton}
                            onPress={() => setIsModalVisible(false)}
                            activeOpacity={0.7}
                        >
                            <ChevronDown size={28} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={dynamicStyles.bottomSection}>
                        <View style={dynamicStyles.statsFloatingCard}>
                            <View style={dynamicStyles.cardHeader}>
                                <Text style={dynamicStyles.cardTitle}>Pedalada</Text>
                            </View>

                            <View style={dynamicStyles.statsRow}>
                                <View style={dynamicStyles.statItem}>
                                    <Text style={dynamicStyles.statValueMain}>{durationString}</Text>
                                    <Text style={dynamicStyles.statLabel}>Tempo</Text>
                                </View>

                                <View style={dynamicStyles.verticalLine} />

                                <View style={dynamicStyles.statItem}>
                                    <Text style={dynamicStyles.statValueMain}>
                                        {((todayStats?.distance || 0) + liveStats.distance).toFixed(1)}
                                    </Text>
                                    <Text style={dynamicStyles.statLabel}>km</Text>
                                </View>
                            </View>
                        </View>

                        <View style={dynamicStyles.controlSheet}>
                            <View style={dynamicStyles.sheetHandle} />

                            <View style={dynamicStyles.controlsRow}>
                                {isConfirmingStop ? (
                                    <View style={dynamicStyles.confirmationContainer}>
                                        <Text style={dynamicStyles.confirmationText}>Deseja finalizar esta atividade?</Text>
                                        <View style={dynamicStyles.confirmationButtons}>
                                            <TouchableOpacity
                                                style={dynamicStyles.confirmButton}
                                                onPress={onConfirmStop}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={dynamicStyles.confirmButtonText}>SIM</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={dynamicStyles.cancelButton}
                                                onPress={onCancelStop}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={dynamicStyles.cancelButtonText}>NÃO</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={dynamicStyles.circleActionButton}
                                            onPress={handleStop}
                                            activeOpacity={0.8}
                                        >
                                            <View style={dynamicStyles.iconCircleRed}>
                                                <StopCircle size={24} color="#FF6B35" />
                                            </View>
                                            <Text style={dynamicStyles.actionLabel}>Finalizar</Text>
                                        </TouchableOpacity>

                                        <View style={dynamicStyles.playButtonContainer}>
                                            <TouchableOpacity
                                                style={dynamicStyles.largePlayButton}
                                                onPress={isPaused ? resumeRide : pauseRide}
                                                activeOpacity={0.9}
                                            >
                                                {isPaused ? (
                                                    <Play size={42} color="#FFF" fill="#FFF" style={{ marginLeft: 6 }} />
                                                ) : (
                                                    <Pause size={42} color="#FFF" fill="#FFF" />
                                                )}
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ width: 60 }} />
                                    </>
                                )}
                            </View>
                        </View>
                        {isSaving && (
                            <View style={dynamicStyles.loadingOverlay}>
                                <View style={dynamicStyles.loadingCard}>
                                    <ActivityIndicator size="large" color="#FF6B35" />
                                    <Text style={dynamicStyles.loadingText}>Processando sua pedalada...</Text>
                                    <Text style={dynamicStyles.loadingSubtext}>Quase lá!</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ActiveRideModal;

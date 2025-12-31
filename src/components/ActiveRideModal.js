import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { RideContext } from '../context/RideContext';
import { theme } from '../styles/theme';
import { StopCircle, MapPin, Watch, ChevronDown, Play, Pause } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ActiveRideModal = () => {
    const navigation = useNavigation();
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

    // Initial HTML content with Leaflet
    const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <style>
            body { margin: 0; padding: 0; background-color: #000; }
            #map { height: 100vh; width: 100vw; background-color: #000; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([-23.55052, -46.633309], 15);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
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
    `;

    useEffect(() => {
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // Calculate total seconds: daily total (min -> sec) + live session (sec)
        const totalSeconds = (todayStats?.duration || 0) * 60 + liveStats.duration;
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
        // If distance is zero, we just cleanup. If not, we save.
        if (liveStats.distance === 0) {
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
                    duration: (todayStats?.duration || 0) * 60 + liveStats.duration
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

    const oldHandleStopPlaceholder = () => {
        // Even if we have daily totals, we only care if the CURRENT ride has distance to save
        if (liveStats.distance === 0) {
            Alert.alert(
                "Pedal Zerado",
                "Você não percorreu nenhuma distância nesta sessão. Deseja descartar?",
                [
                    {
                        text: "Continuar",
                        style: "cancel"
                    },
                    {
                        text: "Descartar",
                        style: "destructive",
                        onPress: async () => {
                            await stopLiveRide(false); // False = do not save
                            cleanupLiveRide();
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                "Finalizar Pedal",
                "O que deseja fazer com esta atividade?",
                [
                    { text: "Continuar", style: "cancel" },
                    {
                        text: "Descartar",
                        style: "destructive",
                        onPress: async () => {
                            await stopLiveRide(false); // Don't save
                            cleanupLiveRide();
                        }
                    },
                    {
                        text: "Salvar",
                        onPress: async () => {
                            try {
                                setIsSaving(true);

                                // Capture FINAL daily totals for the summary
                                const finalDailyStats = {
                                    distance: (todayStats?.distance || 0) + liveStats.distance,
                                    duration: (todayStats?.duration || 0) * 60 + liveStats.duration
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
                    }
                ]
            );
        }
    };

    if (!isRecording) return null;

    return (
        <Modal visible={isModalVisible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHtml }}
                    style={styles.map}
                    scrollEnabled={false}
                    onLoadEnd={() => {
                        updateMap(liveStats.path);
                        handleWebViewLoad();
                    }}
                />

                <View style={styles.overlay}>
                    {/* Header: Minimalist Top Bar */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.minimizeButton}
                            onPress={() => setIsModalVisible(false)}
                            activeOpacity={0.7}
                        >
                            <ChevronDown size={28} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Content: Floating Stats & Bottom Controls */}
                    <View style={styles.bottomSection}>

                        {/* 1. Floating Stats Card */}
                        <View style={styles.statsFloatingCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Pedalada</Text>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValueMain}>{durationString}</Text>
                                    <Text style={styles.statLabel}>Tempo</Text>
                                </View>

                                <View style={styles.verticalLine} />

                                <View style={styles.statItem}>
                                    <Text style={styles.statValueMain}>
                                        {((todayStats?.distance || 0) + liveStats.distance).toFixed(1)}
                                    </Text>
                                    <Text style={styles.statLabel}>km</Text>
                                </View>
                            </View>
                        </View>

                        {/* 2. Bottom Controls Sheet */}
                        <View style={styles.controlSheet}>
                            {/* Grip Handle */}
                            <View style={styles.sheetHandle} />

                            <View style={styles.controlsRow}>
                                {isConfirmingStop ? (
                                    <View style={styles.confirmationContainer}>
                                        <Text style={styles.confirmationText}>Deseja finalizar esta atividade?</Text>
                                        <View style={styles.confirmationButtons}>
                                            <TouchableOpacity
                                                style={styles.confirmButton}
                                                onPress={onConfirmStop}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.confirmButtonText}>SIM</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={onCancelStop}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.cancelButtonText}>NÃO</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        {/* Left: Stop/Finish Button */}
                                        <TouchableOpacity
                                            style={styles.circleActionButton}
                                            onPress={handleStop}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.iconCircleRed}>
                                                <StopCircle size={24} color="#FF6B35" />
                                            </View>
                                            <Text style={styles.actionLabel}>Finalizar</Text>
                                        </TouchableOpacity>

                                        {/* Center: Large Play/Pause */}
                                        <View style={styles.playButtonContainer}>
                                            <TouchableOpacity
                                                style={styles.largePlayButton}
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

                                        {/* Right: Balance spacer */}
                                        <View style={{ width: 60 }} />
                                    </>
                                )}
                            </View>
                        </View>
                        {/* Loading Overlay */}
                        {isSaving && (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingCard}>
                                    <ActivityIndicator size="large" color="#FF6B35" />
                                    <Text style={styles.loadingText}>Processando sua pedalada...</Text>
                                    <Text style={styles.loadingSubtext}>Quase lá!</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAEAEA',
    },
    map: {
        flex: 1,
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
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    bottomSection: {
        justifyContent: 'flex-end',
        pointerEvents: 'box-none',
    },
    statsFloatingCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
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
        color: '#333',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF6B35',
        marginRight: 4,
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
        fontSize: 28, // Reduced slightly to fit 3 items
        fontWeight: '800',
        color: '#1A1A1A',
        fontVariant: ['tabular-nums'],
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontWeight: '600',
    },
    verticalLine: {
        width: 1,
        height: 30,
        backgroundColor: '#EEE',
    },
    controlSheet: {
        backgroundColor: '#FFF',
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
        backgroundColor: '#E0E0E0',
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
        backgroundColor: '#FFF1EC', // Light orange tint
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleGray: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    playButtonContainer: {
        marginTop: -10, // Slight offset to visually balance
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
        backgroundColor: '#FFF',
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
        color: '#1A1A1A',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#888',
    },
    confirmationContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    confirmationText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
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
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        minWidth: 120,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ActiveRideModal;

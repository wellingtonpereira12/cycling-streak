import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { RideContext } from '../context/RideContext';
import { theme } from '../styles/theme';
import { StopCircle, MapPin, Watch, ChevronDown } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ActiveRideModal = () => {
    const { isRecording, isModalVisible, setIsModalVisible, liveStats, stopLiveRide } = useContext(RideContext);
    const [durationString, setDurationString] = useState('00:00:00');
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
        setDurationString(formatTime(liveStats.duration));
    }, [liveStats.duration]);

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
        if (liveStats.distance === 0) {
            Alert.alert(
                "Pedal Zerado",
                "Você não percorreu nenhuma distância. Deseja descartar?",
                [
                    { text: "Continuar", style: "cancel" },
                    {
                        text: "Descartar",
                        style: "destructive",
                        onPress: async () => {
                            await stopLiveRide(false); // Don't save
                        }
                    }
                ]
            );
            return;
        }

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
                    }
                },
                {
                    text: "Salvar",
                    onPress: async () => {
                        try {
                            const result = await stopLiveRide(true); // Save
                            Alert.alert("Sucesso", `Pedal de ${result.distance}km salvo!`);
                        } catch (e) {
                            Alert.alert("Erro", "Falha ao salvar o pedal.");
                        }
                    }
                }
            ]
        );
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
                        // Sync immediately when loaded
                        updateMap(liveStats.path);
                        handleWebViewLoad();
                    }}
                />

                {/* Overlay UI */}
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.minimizeButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <ChevronDown size={28} color="#FFF" />
                        </TouchableOpacity>

                        <View style={styles.indicatorContainer}>
                            <View style={styles.blinkingDot} />
                            <Text style={styles.headerTitle}>GRAVANDO ATIVIDADE</Text>
                        </View>

                        {/* Placeholder for balance */}
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.statsCard}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{liveStats.distance.toFixed(2)}</Text>
                                <Text style={styles.statLabel}>KM</Text>
                            </View>
                            <View style={styles.dividerVertical} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{durationString}</Text>
                                <Text style={styles.statLabel}>TEMPO</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.stopButton}
                        onPress={handleStop}
                        activeOpacity={0.8}
                    >
                        <StopCircle size={32} color="#FFF" />
                        <Text style={styles.stopButtonText}>FINALIZAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    map: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
        pointerEvents: 'box-none', // Allow clicks to pass through to map where no UI exists? 
        // Note: react-native View pointerEvents might need to be 'box-none' to let map interactions work if overlay covers it.
        // However, map is below overlay in Z-index. The touches on empty space of overlay need to passthrough.
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    minimizeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    indicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    blinkingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF4D4D',
        marginRight: 10,
    },
    headerTitle: {
        color: '#FF4D4D',
        fontWeight: 'bold',
        letterSpacing: 1.2,
        fontSize: 12,
    },
    statsCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black 
        // OR theme.colors.surface with opacity
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 10,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        fontVariant: ['tabular-nums'],
    },
    statLabel: {
        fontSize: 12,
        color: '#BBB',
        marginTop: 4,
        fontWeight: 'bold',
    },
    dividerVertical: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    stopButton: {
        backgroundColor: '#FF4D4D',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 50,
        gap: 12,
        shadowColor: '#FF4D4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
        marginHorizontal: 20,
    },
    stopButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default ActiveRideModal;

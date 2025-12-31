import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import StreakCounter from '../components/StreakCounter';
import RideButton from '../components/RideButton';
import RiskNotification from '../components/RiskNotification';
const ShareCard = Platform.OS === 'web' ? null : require('../components/ShareCard').default;
import { theme } from '../styles/theme';
import { Share2 } from 'lucide-react-native';
import * as Location from 'expo-location';
const ActiveRideModal = Platform.OS === 'web' ? null : require('../components/ActiveRideModal').default;
// Mobile-only imports moved inside handleShare to prevent web crash

const HomeScreen = ({ navigation }) => {
    const { streakData = {}, addRide, refresh, loading, startLiveRide, isRecording, isModalVisible, setIsModalVisible } = useContext(RideContext);
    const { user } = useAuth();
    const { streak = 0, riskLevel = 'safe', daysMissed = 0 } = streakData;
    const [modalVisible, setModalVisible] = useState(false);
    const [sharing, setSharing] = useState(false);
    const viewRef = React.useRef();

    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                // Check status first to see if we need to ask
                const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

                let finalStatus = existingStatus;

                // Only request if not already granted
                if (existingStatus !== 'granted') {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus === 'granted') {
                    // console.log("Permissão já concedida ou aceita agora.");
                    // Optional: remove this alert later, but good for confirmation now
                    // Alert.alert("GPS Ativado", "Permissão de localização concedida.");
                } else {
                    Alert.alert("Permissão Necessária", "Para registrar pedais, precisamos de acesso à sua localização.");
                }
            } catch (error) {
                console.warn("Erro ao solicitar permissão de localização:", error);
            }
        };

        requestLocationPermission();
    }, []);

    const handleRidePress = () => {
        navigation.navigate('RideOptions');
    };

    const handleRide = async (distance, duration) => {
        await addRide(distance, duration);
    };

    const handleShare = async () => {
        if (sharing) return;
        if (Platform.OS === 'web') {
            Alert.alert('Indisponível', 'A função de compartilhar via imagem está disponível apenas no aplicativo móvel.');
            return;
        }

        try {
            setSharing(true);

            // Dynamic imports to prevent web crashes
            const { captureRef } = await import('react-native-view-shot');
            const Sharing = await import('expo-sharing');

            // Give it a moment to ensure layout is ready
            await new Promise(resolve => setTimeout(resolve, 300));

            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Compartilhe sua Ofensiva!',
            });
        } catch (error) {
            console.error('Error sharing streak:', error);
            Alert.alert('Erro', 'Não foi possível gerar a imagem para compartilhamento.');
        } finally {
            setSharing(false);
        }
    };

    const isTodayRidden = daysMissed === 0 && streak > 0;

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
            >
                <View style={styles.header}>
                    <Text style={styles.greeting}>Olá, {user?.nome || 'Ciclista'}!</Text>
                    <Text style={styles.subtext}>Mantenha o ritmo.</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Carregando ofensiva...</Text>
                    </View>
                ) : (
                    <>
                        <StreakCounter streak={streak} riskLevel={riskLevel} />
                        <RiskNotification riskLevel={riskLevel} />
                    </>
                )}

                <View style={styles.actionContainer}>
                    {isRecording ? (
                        <TouchableOpacity
                            style={styles.returnButton}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text style={styles.returnButtonText}>VOLTAR AO MAPA (GRAVANDO...)</Text>
                        </TouchableOpacity>
                    ) : (
                        <RideButton onPress={handleRidePress} />
                    )}

                    {daysMissed === 0 && streak > 0 && !isRecording && (
                        <Text style={styles.successText}>Pedal de hoje registrado!</Text>
                    )}
                </View>

                {streak > 0 && (
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        disabled={sharing}
                    >
                        {sharing ? (
                            <ActivityIndicator color={theme.colors.primary} />
                        ) : (
                            <>
                                <Share2 size={20} color={theme.colors.primary} />
                                <Text style={styles.shareButtonText}>COMPARTILHE SUA OFENSIVA</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
                {Platform.OS !== 'web' && ShareCard && (
                    <View
                        collapsable={false}
                        ref={viewRef}
                        style={{ position: 'absolute', left: -5000, width: 1080, height: 1080 }}
                    >
                        <ShareCard
                            streak={streak}
                            totalDistance={streakData.totalDistance ?? 0}
                            totalDuration={streakData.totalDuration ?? 0}
                            userName={user?.nome}
                        />
                    </View>
                )}



                {Platform.OS !== 'web' && ActiveRideModal && (
                    <ActiveRideModal />
                )}

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Última Atividade</Text>
                        <Text style={styles.statValue}>
                            {streakData.lastRideDate
                                ? new Date(streakData.lastRideDate).toLocaleDateString('pt-BR')
                                : '--'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.l,
        alignItems: 'center',
        flexGrow: 1,
    },
    header: {
        width: '100%',
        marginBottom: theme.spacing.m,
    },
    greeting: {
        ...theme.typography.h2,
    },
    subtext: {
        ...theme.typography.subtitle,
    },
    actionContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: theme.spacing.l,
    },
    successText: {
        color: theme.colors.secondary,
        marginTop: theme.spacing.s,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: 'auto',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        width: '100%',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        ...theme.typography.caption,
    },
    statValue: {
        ...theme.typography.body,
        fontWeight: 'bold',
        marginTop: 4,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        gap: 10,
        marginTop: -theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    shareButtonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    returnButton: {
        backgroundColor: theme.colors.error, // Red to indicate recording
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    returnButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14, // Slightly larger
        letterSpacing: 1,
    }
});

export default HomeScreen;

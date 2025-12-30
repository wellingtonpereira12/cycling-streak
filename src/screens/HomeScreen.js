import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import StreakCounter from '../components/StreakCounter';
import RideButton from '../components/RideButton';
import RiskNotification from '../components/RiskNotification';
import RideModal from '../components/RideModal';
const ShareCard = Platform.OS === 'web' ? null : require('../components/ShareCard').default;
import { theme } from '../styles/theme';
import { Share2 } from 'lucide-react-native';
// Mobile-only imports moved inside handleShare to prevent web crash

const HomeScreen = () => {
    const { streakData = {}, addRide, refresh, loading } = useContext(RideContext);
    const { user } = useAuth();
    const { streak = 0, riskLevel = 'safe', daysMissed = 0 } = streakData;
    const [modalVisible, setModalVisible] = useState(false);
    const [sharing, setSharing] = useState(false);
    const viewRef = React.useRef();

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

    const isTodayRidden = daysMissed === 0 && streak > 0; // Rough check, but simplified.
    // Actually daysMissed = 0 can mean today already checked.
    // We can double check if lastRideDate == today in Context, but logic handles it.

    // If we just added a ride, daysMissed becomes 0.
    // We can disable button if already ridden today to prevent spam?
    // User req: "Botão para registrar pedal (manual)". doesn't say disable.

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
                    <RideButton onPress={() => setModalVisible(true)} />
                    {daysMissed === 0 && streak > 0 && (
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

                {/* Hidden Share Card for Capture */}
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

                <RideModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={handleRide}
                />

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
    }
});

export default HomeScreen;

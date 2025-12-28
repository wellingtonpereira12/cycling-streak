import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import StreakCounter from '../components/StreakCounter';
import RideButton from '../components/RideButton';
import RiskNotification from '../components/RiskNotification';
import RideModal from '../components/RideModal';
import { theme } from '../styles/theme';

const HomeScreen = () => {
    const { streakData, addRide, refresh, loading } = useContext(RideContext);
    const { user } = useAuth();
    const { streak, riskLevel, daysMissed } = streakData;
    const [modalVisible, setModalVisible] = useState(false);

    const handleRide = async (distance, duration) => {
        await addRide(distance, duration);
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
    }
});

export default HomeScreen;

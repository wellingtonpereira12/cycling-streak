import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { ArrowLeft, Check } from 'lucide-react-native';
import { RideContext } from '../context/RideContext';

const ManualRideScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { addRide, todayStats } = useContext(RideContext);

    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [initialStats, setInitialStats] = useState({ distance: 0, duration: 0 });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Pre-fill with daily totals on mount
    useEffect(() => {
        if (todayStats) {
            setDistance(todayStats.distance ? todayStats.distance.toString() : '');
            setDuration(todayStats.duration ? todayStats.duration.toString() : '');
            setInitialStats({
                distance: todayStats.distance || 0,
                duration: todayStats.duration || 0
            });
        }
    }, [todayStats]);

    const handleSubmit = async () => {
        if (!distance || !duration) {
            setErrorMessage('Preencha o novo total do dia');
            return;
        }

        const inputDistance = parseFloat(distance);
        const inputDuration = parseInt(duration);

        if (isNaN(inputDistance) || inputDistance < 0) {
            setErrorMessage('Distância inválida');
            return;
        }

        if (isNaN(inputDuration) || inputDuration < 0) {
            setErrorMessage('Tempo inválido');
            return;
        }

        // Calculate Delta (What to Add)
        const deltaDistance = inputDistance - initialStats.distance;
        const deltaDuration = inputDuration - initialStats.duration;

        if (deltaDistance <= 0.01 && deltaDuration <= 0) {
            setErrorMessage('O novo total deve ser maior que o atual para adicionar um pedal.');
            return;
        }

        // Prevent adding negative values if user decreases the total
        if (deltaDistance < 0 || deltaDuration < 0) {
            setErrorMessage('Não é possível reduzir o total acumulado.');
            return;
        }

        setErrorMessage('');
        setLoading(true);
        try {
            // Captured NEW totals for the day
            const summaryData = {
                distance: inputDistance,
                duration: inputDuration * 60 // seconds for summary
            };

            // Start API call with the FULL daily total (not delta)
            addRide(inputDistance, inputDuration).catch(e => {
                console.error("Manual ride sync error:", e);
                Alert.alert("Erro", "Não foi possível sincronizar o pedal manual.");
            });

            setLoading(false);

            // Navigate immediately to summary screen with NEW DAILY TOTALS
            navigation.navigate('RideSummary', { rideData: summaryData });
        } catch (error) {
            setErrorMessage(error.response?.data?.msg || 'Erro ao registrar pedal');
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Entrada Manual</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Distância Total do Dia (km)</Text>
                <Text style={styles.helperText}>Atual: {initialStats.distance.toFixed(1)} km</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Total do dia"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="decimal-pad"
                    autoFocus
                />

                <Text style={styles.label}>Tempo Total do Dia (min)</Text>
                <Text style={styles.helperText}>Atual: {initialStats.duration} min</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 45"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="number-pad"
                />

                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.text} />
                    ) : (
                        <>
                            <Check size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>ATUALIZAR TOTAL</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    backButton: {
        marginRight: theme.spacing.m,
        padding: 8,
    },
    title: {
        ...theme.typography.h2,
        fontSize: 24,
    },
    content: {
        padding: theme.spacing.l,
        gap: theme.spacing.m,
    },
    label: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.s,
    },
    helperText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: theme.spacing.s,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        fontSize: 18,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    errorContainer: {
        padding: theme.spacing.m,
        backgroundColor: 'rgba(207, 102, 121, 0.1)',
        borderRadius: theme.borderRadius.m,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
        marginTop: theme.spacing.m,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 14,
    },
});

export default ManualRideScreen;

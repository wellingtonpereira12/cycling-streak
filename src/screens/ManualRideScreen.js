import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Check } from 'lucide-react-native';
import { RideContext } from '../context/RideContext';

const ManualRideScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { addRide, todayStats } = useContext(RideContext);
    const { theme } = useTheme();

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
            // RideContext.addRide now expects SECONDS
            addRide(inputDistance, inputDuration * 60).catch(e => {
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

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            marginBottom: 24,
        },
        backButton: {
            marginRight: 16,
            padding: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        content: {
            padding: 24,
            gap: 16,
        },
        label: {
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4,
            marginTop: 8,
        },
        helperText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
            marginBottom: 8,
        },
        input: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            padding: 16,
            borderRadius: 12,
            fontSize: 18,
            borderWidth: 1,
            borderColor: theme.colors.surfaceLight,
        },
        button: {
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginTop: 32,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        errorContainer: {
            padding: 16,
            backgroundColor: 'rgba(207, 102, 121, 0.1)',
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.error,
            marginTop: 16,
        },
        errorText: {
            color: theme.colors.error,
            fontSize: 14,
        },
    });

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top }]}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={dynamicStyles.title}>Entrada Manual</Text>
            </View>

            <ScrollView contentContainerStyle={dynamicStyles.content}>
                <Text style={dynamicStyles.label}>Distância Total do Dia (km)</Text>
                <Text style={dynamicStyles.helperText}>Atual: {initialStats.distance.toFixed(1)} km</Text>
                <TextInput
                    style={dynamicStyles.input}
                    placeholder="Total do dia"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="decimal-pad"
                    autoFocus
                />

                <Text style={dynamicStyles.label}>Tempo Total do Dia (min)</Text>
                <Text style={dynamicStyles.helperText}>Atual: {initialStats.duration} min</Text>
                <TextInput
                    style={dynamicStyles.input}
                    placeholder="Ex: 45"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="number-pad"
                />

                {errorMessage ? (
                    <View style={dynamicStyles.errorContainer}>
                        <Text style={dynamicStyles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[dynamicStyles.button, loading && dynamicStyles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Check size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={dynamicStyles.buttonText}>ATUALIZAR TOTAL</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default ManualRideScreen;

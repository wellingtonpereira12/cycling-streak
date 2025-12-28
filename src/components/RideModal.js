import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import { X } from 'lucide-react-native';
import api from '../services/api';

const RideModal = ({ visible, onClose, onSubmit }) => {
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchTodayRide = async () => {
            if (!visible) return;

            setFetchingData(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await api.get('/rides');
                const todayRide = res.data.find(ride => {
                    const rideDate = new Date(ride.data_pedal).toISOString().split('T')[0];
                    return rideDate === today;
                });

                if (todayRide) {
                    setDistance(todayRide.distancia_km.toString());
                    setDuration(todayRide.duracao_min.toString());
                } else {
                    setDistance('');
                    setDuration('');
                }
            } catch (error) {
                console.error('Error fetching today ride:', error);
            } finally {
                setFetchingData(false);
            }
        };

        fetchTodayRide();
    }, [visible]);

    const handleSubmit = async () => {
        if (!distance || !duration) {
            setErrorMessage('Preencha distância e tempo');
            return;
        }

        const distanceNum = parseFloat(distance);
        const durationNum = parseInt(duration);

        if (isNaN(distanceNum) || distanceNum <= 0) {
            setErrorMessage('Digite uma distância válida');
            return;
        }

        if (isNaN(durationNum) || durationNum <= 0) {
            setErrorMessage('Digite um tempo válido');
            return;
        }

        setErrorMessage('');
        setLoading(true);
        try {
            await onSubmit(distanceNum, durationNum);
            setDistance('');
            setDuration('');
            setErrorMessage('');
            onClose();
        } catch (error) {
            setErrorMessage(error.response?.data?.msg || 'Erro ao registrar pedal');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDistance('');
        setDuration('');
        setErrorMessage('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Pedal</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <X size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {fetchingData ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={styles.loadingText}>Carregando dados...</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.label}>Distância (km)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 15.5"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={distance}
                                    onChangeText={setDistance}
                                    keyboardType="decimal-pad"
                                />

                                <Text style={styles.label}>Tempo (minutos)</Text>
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
                                        <Text style={styles.buttonText}>Registrar</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.l,
    },
    modal: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    title: {
        ...theme.typography.h2,
    },
    form: {
        gap: theme.spacing.m,
    },
    label: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        marginTop: theme.spacing.s,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorContainer: {
        padding: theme.spacing.m,
        backgroundColor: 'rgba(207, 102, 121, 0.1)',
        borderRadius: theme.borderRadius.m,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 14,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.m,
    },
    loadingText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
});

export default RideModal;

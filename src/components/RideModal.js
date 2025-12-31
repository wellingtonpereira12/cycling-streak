import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react-native';
import api from '../services/api';

const RideModal = ({ visible, onClose, onSubmit }) => {
    const { theme } = useTheme();
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
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const today = `${year}-${month}-${day}`;

                const res = await api.get('/rides');
                const todayRide = res.data.find(ride => {
                    if (!ride.data_pedal) return false;
                    const rideDate = ride.data_pedal.split('T')[0];
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

    const dynamicStyles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        modal: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        form: {
            gap: 16,
        },
        label: {
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4,
        },
        input: {
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            borderWidth: 1,
            borderColor: theme.colors.surfaceLight,
        },
        button: {
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold',
        },
        errorContainer: {
            padding: 16,
            backgroundColor: 'rgba(207, 102, 121, 0.1)',
            borderRadius: 12,
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
            padding: 40,
            gap: 16,
        },
        loadingText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={dynamicStyles.overlay}>
                <View style={dynamicStyles.modal}>
                    <View style={dynamicStyles.header}>
                        <Text style={dynamicStyles.title}>Registrar Pedal</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <X size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={dynamicStyles.form}>
                        {fetchingData ? (
                            <View style={dynamicStyles.loadingContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={dynamicStyles.loadingText}>Carregando dados...</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={dynamicStyles.label}>Distância (km)</Text>
                                <TextInput
                                    style={dynamicStyles.input}
                                    placeholder="Ex: 15.5"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={distance}
                                    onChangeText={setDistance}
                                    keyboardType="decimal-pad"
                                />

                                <Text style={dynamicStyles.label}>Tempo (minutos)</Text>
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
                                        <Text style={dynamicStyles.buttonText}>Registrar</Text>
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

export default RideModal;

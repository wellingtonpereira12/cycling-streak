import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { ArrowLeft, Check } from 'lucide-react-native';
import { RideContext } from '../context/RideContext';

const ManualRideScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { addRide } = useContext(RideContext);

    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
            await addRide(distanceNum, durationNum);
            Alert.alert("Sucesso", "Pedal registrado!", [
                { text: "OK", onPress: () => navigation.popToTop() }
            ]);
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
                <Text style={styles.label}>Distância (km)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 15.5"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="decimal-pad"
                    autoFocus
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
                        <>
                            <Check size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>REGISTRAR PEDAL</Text>
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

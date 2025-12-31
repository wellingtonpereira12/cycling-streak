import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { MapPin, Edit3, ArrowLeft } from 'lucide-react-native';
import { RideContext } from '../context/RideContext';

const RideOptionsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { startLiveRide } = useContext(RideContext);

    const handleGPS = async () => {
        try {
            await startLiveRide();
            navigation.popToTop(); // Go back to Home which will show ActiveRideModal
        } catch (error) {
            Alert.alert("Erro", "Falha ao iniciar GPS. Verifique se a permissão foi concedida.");
        }
    };

    const handleManual = () => {
        navigation.navigate('ManualRide');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Registrar Pedal</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Como você deseja registrar sua atividade hoje?</Text>

                <TouchableOpacity style={styles.card} onPress={handleGPS}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 77, 77, 0.1)' }]}>
                        <MapPin size={40} color={theme.colors.primary} />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>GPS Automático</Text>
                        <Text style={styles.cardDescription}>Rastreie sua rota, distância e tempo em tempo real.</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={handleManual}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(77, 255, 148, 0.1)' }]}>
                        <Edit3 size={40} color={theme.colors.secondary} />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>Inserir Manualmente</Text>
                        <Text style={styles.cardDescription}>Adicione distância e tempo se você já pedalou.</Text>
                    </View>
                </TouchableOpacity>
            </View>
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
        gap: theme.spacing.l,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.m,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.h3,
        marginBottom: 4,
    },
    cardDescription: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontSize: 14,
    }
});

export default RideOptionsScreen;

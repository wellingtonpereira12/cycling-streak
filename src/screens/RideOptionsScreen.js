import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Edit3, ArrowLeft } from 'lucide-react-native';
import { RideContext } from '../context/RideContext';

const RideOptionsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { startLiveRide } = useContext(RideContext);
    const { theme } = useTheme();

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
            gap: 24,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 16,
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            borderColor: theme.colors.surfaceLight,
            borderWidth: 1,
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
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 4,
        },
        cardDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        }
    });

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top }]}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={dynamicStyles.title}>Registrar Ofensiva</Text>
            </View>

            <View style={dynamicStyles.content}>
                <Text style={dynamicStyles.subtitle}>Como você deseja registrar sua atividade hoje?</Text>

                <TouchableOpacity style={dynamicStyles.card} onPress={handleGPS}>
                    <View style={[dynamicStyles.iconContainer, { backgroundColor: 'rgba(255, 77, 77, 0.1)' }]}>
                        <MapPin size={40} color={theme.colors.primary} />
                    </View>
                    <View style={dynamicStyles.cardText}>
                        <Text style={dynamicStyles.cardTitle}>GPS Automático</Text>
                        <Text style={dynamicStyles.cardDescription}>Rastreie sua rota, distância e tempo em tempo real.</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={dynamicStyles.card} onPress={handleManual}>
                    <View style={[dynamicStyles.iconContainer, { backgroundColor: 'rgba(77, 255, 148, 0.1)' }]}>
                        <Edit3 size={40} color={theme.colors.secondary} />
                    </View>
                    <View style={dynamicStyles.cardText}>
                        <Text style={dynamicStyles.cardTitle}>Inserir Manualmente</Text>
                        <Text style={dynamicStyles.cardDescription}>Adicione distância e tempo se você já treinou.</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RideOptionsScreen;

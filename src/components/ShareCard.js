import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Flame, Bike, Clock, MapPin } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_SIZE = 1080; // High definition square
const FLAME_SIZE = 540;

const ShareCard = ({ streak, totalDistance, totalDuration, userName }) => {
    const { theme } = useTheme();

    const dynamicStyles = StyleSheet.create({
        container: {
            width: CARD_SIZE,
            height: CARD_SIZE,
            backgroundColor: '#000',
            padding: 60,
            justifyContent: 'space-between',
        },
        backgroundAccent: {
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: 300,
            backgroundColor: theme.colors.primary,
            opacity: 0.1,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 30,
        },
        logo: {
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 4,
            borderColor: theme.colors.primary,
        },
        appName: {
            fontSize: 42,
            fontWeight: '900',
            color: theme.colors.primary,
            letterSpacing: 4,
        },
        userName: {
            fontSize: 32,
            color: '#FFFFFF', // Keep white for dark background
            fontWeight: '600',
        },
        mainContent: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
        },
        streakOverlay: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 540,
            width: 540,
        },
        backgroundFlame: {
            position: 'absolute',
        },
        streakCount: {
            fontSize: 240,
            fontWeight: '900',
            color: '#FFFFFF',
            lineHeight: 240,
            zIndex: 1,
        },
        streakLabel: {
            fontSize: 42,
            fontWeight: 'bold',
            color: theme.colors.primary,
            letterSpacing: 12,
            marginTop: -10,
        },
        divider: {
            width: '50%',
            height: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            marginVertical: 35,
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
        },
        statItem: {
            alignItems: 'center',
            gap: 15,
        },
        statValue: {
            fontSize: 56,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        statLabelSmall: {
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: '600',
            letterSpacing: 2,
        },
        footer: {
            alignItems: 'center',
            gap: 20,
        },
        motoContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
        },
        footerText: {
            fontSize: 28,
            color: '#FFFFFF',
            fontStyle: 'italic',
        },
        watermark: {
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.4)',
        }
    });

    return (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.backgroundAccent} />

            <View style={dynamicStyles.header}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={dynamicStyles.logo}
                />
                <View>
                    <Text style={dynamicStyles.appName}>CYCLING STREAK</Text>
                    <Text style={dynamicStyles.userName}>{userName || 'Ciclista'}</Text>
                </View>
            </View>

            <View style={dynamicStyles.mainContent}>
                <View style={dynamicStyles.streakOverlay}>
                    <Flame
                        size={FLAME_SIZE}
                        color={theme.colors.primary}
                        fill={theme.colors.primary}
                        opacity={0.5}
                        style={dynamicStyles.backgroundFlame}
                    />
                    <Text style={[dynamicStyles.streakCount, { marginTop: 60 }]}>{streak}</Text>
                </View>
                <Text style={dynamicStyles.streakLabel}>DIAS DE OFENSIVA</Text>

                <View style={dynamicStyles.divider} />

                <View style={dynamicStyles.statsRow}>
                    <View style={dynamicStyles.statItem}>
                        <MapPin size={40} color="rgba(255, 255, 255, 0.6)" />
                        <Text style={dynamicStyles.statValue}>{totalDistance?.toFixed(1) || 0} KM</Text>
                        <Text style={dynamicStyles.statLabelSmall}>PEDALADOS</Text>
                    </View>
                    <View style={dynamicStyles.statItem}>
                        <Clock size={40} color="rgba(255, 255, 255, 0.6)" />
                        <Text style={dynamicStyles.statValue}>
                            {Math.floor(totalDuration / 3600).toString().padStart(2, '0')}:
                            {Math.floor((totalDuration % 3600) / 60).toString().padStart(2, '0')}:
                            {Math.floor(totalDuration % 60).toString().padStart(2, '0')}
                        </Text>
                        <Text style={dynamicStyles.statLabelSmall}>TEMPO TOTAL</Text>
                    </View>
                </View>
            </View>

            <View style={dynamicStyles.footer}>
                <View style={dynamicStyles.motoContainer}>
                    <Bike size={24} color={theme.colors.primary} />
                    <Text style={dynamicStyles.footerText}>Consistência é a chave.</Text>
                </View>
                <Text style={dynamicStyles.watermark}>Gerado pelo Cycling Streak App</Text>
            </View>
        </View>
    );
};

export default ShareCard;

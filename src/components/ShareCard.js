import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Flame, Bike, Clock, MapPin } from 'lucide-react-native';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = 1080; // High definition square
const FLAME_SIZE = 540;

const ShareCard = ({ streak, totalDistance, totalDuration, userName }) => {
    return (
        <View style={styles.container}>
            {/* Background Aesthetic */}
            <View style={styles.backgroundAccent} />

            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                />
                <View>
                    <Text style={styles.appName}>CYCLING STREAK</Text>
                    <Text style={styles.userName}>{userName || 'Ciclista'}</Text>
                </View>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.streakOverlay}>
                    <Flame
                        size={FLAME_SIZE}
                        color={theme.colors.primary}
                        fill={theme.colors.primary}
                        opacity={0.5}
                        style={styles.backgroundFlame}
                    />
                    <Text style={[styles.streakCount, { marginTop: 60 }]}>{streak}</Text>
                </View>
                <Text style={styles.streakLabel}>DIAS DE OFENSIVA</Text>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <MapPin size={40} color={theme.colors.textSecondary} />
                        <Text style={styles.statValue}>{totalDistance?.toFixed(1) || 0} KM</Text>
                        <Text style={styles.statLabelSmall}>PEDALADOS</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Clock size={40} color={theme.colors.textSecondary} />
                        <Text style={styles.statValue}>{Math.round(totalDuration || 0)} MIN</Text>
                        <Text style={styles.statLabelSmall}>EM MOVIMENTO</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.motoContainer}>
                    <Bike size={24} color={theme.colors.primary} />
                    <Text style={styles.footerText}>Consistência é a chave.</Text>
                </View>
                <Text style={styles.watermark}>Gerado pelo Cycling Streak App</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        backgroundColor: '#000',
        padding: 60, // Reduced from 80
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
        color: theme.colors.text,
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
        color: theme.colors.text,
        lineHeight: 240,
        zIndex: 1,
    },
    streakLabel: {
        fontSize: 42, // Larger
        fontWeight: 'bold',
        color: theme.colors.primary,
        letterSpacing: 12,
        marginTop: -10, // Overlap slightly with flame bottom for style
    },
    divider: {
        width: '50%',
        height: 2,
        backgroundColor: theme.colors.surfaceLight,
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
        color: theme.colors.text,
    },
    statLabelSmall: {
        fontSize: 24,
        color: theme.colors.textSecondary,
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
        color: theme.colors.text,
        fontStyle: 'italic',
    },
    watermark: {
        fontSize: 20,
        color: theme.colors.disabled,
    }
});

export default ShareCard;

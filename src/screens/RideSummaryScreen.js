import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import { Trophy, Clock, Milestone, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const RideSummaryScreen = ({ route, navigation }) => {
    // rideData format: { distance: number, duration: number, ... }
    const { rideData } = route.params || { rideData: { distance: 0, duration: 0 } };
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleHome = () => {
        navigation.navigate('MainTabs', { screen: 'Início' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[
                styles.content,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.trophyCircle}>
                        <Trophy size={60} color="#FF6B35" />
                    </View>
                    <Text style={styles.title}>Parabéns!</Text>
                    <Text style={styles.subtitle}>Seu total de hoje foi atualizado. Continue pedalando!</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconCircle}>
                            <Milestone size={24} color="#FF6B35" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Total de Hoje (km)</Text>
                            <Text style={styles.statValue}>{rideData.distance?.toFixed(1) || '0.0'} km</Text>
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconCircle}>
                            <Clock size={24} color="#FF6B35" />
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Total de Hoje (Tempo)</Text>
                            <Text style={styles.statValue}>{formatDuration(rideData.duration || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Encouragement */}
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                        "A persistência é o caminho do êxito." Continue assim!
                    </Text>
                </View>

                {/* Bottom Action */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleHome}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>VOLTAR PARA O INÍCIO</Text>
                    <ArrowRight size={20} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    trophyCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF1EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: theme.colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    statsContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 40,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    statIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    statLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    messageBox: {
        backgroundColor: '#FFF1EC',
        padding: 20,
        borderRadius: 16,
        marginBottom: 40,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    messageText: {
        fontSize: 14,
        color: '#FF6B35',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    primaryButton: {
        width: '100%',
        height: 60,
        backgroundColor: theme.colors.primary,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
});

export default RideSummaryScreen;

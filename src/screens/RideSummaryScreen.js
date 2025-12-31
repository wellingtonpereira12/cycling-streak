import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Trophy, Clock, Milestone, ArrowRight } from 'lucide-react-native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const RideSummaryScreen = ({ route, navigation }) => {
    // rideData format: { distance: number, duration: number, ... }
    const { rideData } = route.params || { rideData: { distance: 0, duration: 0 } };
    const { theme, isDark } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Animation
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

        // Sound Effect
        let soundObject = null;
        const playSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' }, // Joyful achievement sound
                    { shouldPlay: true }
                );
                soundObject = sound;
            } catch (error) {
                console.log('Error playing sound:', error);
            }
        };

        playSound();

        return () => {
            if (soundObject) {
                soundObject.unloadAsync();
            }
        };
    }, []);

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleHome = () => {
        navigation.navigate('MainTabs', { screen: 'Início' });
    };

    const dynamicStyles = StyleSheet.create({
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
            backgroundColor: isDark ? 'rgba(255, 107, 53, 0.1)' : '#FFF1EC',
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
            borderColor: theme.colors.surfaceLight,
            borderWidth: 1,
        },
        statIconCircle: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F5F5',
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
            backgroundColor: isDark ? 'rgba(255, 107, 53, 0.1)' : '#FFF1EC',
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

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <Animated.View style={[
                dynamicStyles.content,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                {/* Header Section */}
                <View style={dynamicStyles.header}>
                    <View style={dynamicStyles.trophyCircle}>
                        <Trophy size={60} color="#FF6B35" />
                    </View>
                    <Text style={dynamicStyles.title}>Parabéns!</Text>
                    <Text style={dynamicStyles.subtitle}>Seu total de hoje foi atualizado. Continue pedalando!</Text>
                </View>

                {/* Stats Section */}
                <View style={dynamicStyles.statsContainer}>
                    <View style={dynamicStyles.statCard}>
                        <View style={dynamicStyles.statIconCircle}>
                            <Milestone size={24} color="#FF6B35" />
                        </View>
                        <View>
                            <Text style={dynamicStyles.statLabel}>Total de Hoje (km)</Text>
                            <Text style={dynamicStyles.statValue}>{rideData.distance?.toFixed(1) || '0.0'} km</Text>
                        </View>
                    </View>

                    <View style={dynamicStyles.statCard}>
                        <View style={dynamicStyles.statIconCircle}>
                            <Clock size={24} color="#FF6B35" />
                        </View>
                        <View>
                            <Text style={dynamicStyles.statLabel}>Total de Hoje (Tempo)</Text>
                            <Text style={dynamicStyles.statValue}>{formatDuration(rideData.duration || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Encouragement */}
                <View style={dynamicStyles.messageBox}>
                    <Text style={dynamicStyles.messageText}>
                        "A persistência é o caminho do êxito." Continue assim!
                    </Text>
                </View>

                {/* Bottom Action */}
                <TouchableOpacity
                    style={dynamicStyles.primaryButton}
                    onPress={handleHome}
                    activeOpacity={0.8}
                >
                    <Text style={dynamicStyles.buttonText}>VOLTAR PARA O INÍCIO</Text>
                    <ArrowRight size={20} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

export default RideSummaryScreen;

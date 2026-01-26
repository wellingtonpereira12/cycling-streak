import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StreakCounter from '../components/StreakCounter';
import RideButton from '../components/RideButton';
import RiskNotification from '../components/RiskNotification';
const ShareCard = Platform.OS === 'web' ? null : require('../components/ShareCard').default;
import { Share2 } from 'lucide-react-native';
import * as Location from 'expo-location';
const ActiveRideModal = Platform.OS === 'web' ? null : require('../components/ActiveRideModal').default;

const HomeScreen = ({ navigation }) => {
    const { streakData = {}, addRide, refresh, loading, startLiveRide, isRecording, isModalVisible, setIsModalVisible } = useContext(RideContext);
    const { user } = useAuth();
    const { theme } = useTheme();
    const { streak = 0, riskLevel = 'safe', daysMissed = 0 } = streakData;
    const [modalVisible, setModalVisible] = useState(false);
    const [sharing, setSharing] = useState(false);
    const viewRef = React.useRef();

    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    Alert.alert("Permissão Necessária", "Para registrar pedais, precisamos de acesso à sua localização.");
                }
            } catch (error) {
                console.warn("Erro ao solicitar permissão de localização:", error);
            }
        };

        requestLocationPermission();
    }, []);

    const handleRidePress = () => {
        navigation.navigate('RideOptions');
    };

    const handleShare = async () => {
        if (sharing) return;
        if (Platform.OS === 'web') {
            Alert.alert('Indisponível', 'A função de compartilhar via imagem está disponível apenas no aplicativo móvel.');
            return;
        }

        try {
            setSharing(true);
            const { captureRef } = await import('react-native-view-shot');
            const Sharing = await import('expo-sharing');
            await new Promise(resolve => setTimeout(resolve, 300));

            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Compartilhe sua Ofensiva!',
            });
        } catch (error) {
            console.error('Error sharing streak:', error);
            Alert.alert('Erro', 'Não foi possível gerar a imagem para compartilhamento.');
        } finally {
            setSharing(false);
        }
    };

    const insets = useSafeAreaInsets();

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            padding: 24,
            alignItems: 'center',
            flexGrow: 1,
        },
        header: {
            width: '100%',
            marginBottom: 16,
        },
        greeting: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        subtext: {
            fontSize: 18,
            color: theme.colors.textSecondary,
        },
        actionContainer: {
            width: '100%',
            alignItems: 'center',
            marginVertical: 24,
        },
        successText: {
            color: theme.colors.secondary,
            marginTop: 8,
            fontWeight: 'bold',
        },
        statsContainer: {
            flexDirection: 'row',
            marginTop: 'auto',
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: 16,
            width: '100%',
            justifyContent: 'space-around',
        },
        statItem: {
            alignItems: 'center',
        },
        statLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        statValue: {
            fontSize: 16,
            color: theme.colors.text,
            fontWeight: 'bold',
            marginTop: 4,
        },
        shareButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            gap: 10,
            marginTop: -16,
            marginBottom: 24,
        },
        shareButtonText: {
            color: theme.colors.primary,
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 1,
        },
        returnButton: {
            backgroundColor: theme.colors.error,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 50,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
        },
        returnButtonText: {
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 10,
            color: theme.colors.textSecondary,
        }
    });

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={dynamicStyles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
            >
                <View style={dynamicStyles.header}>
                    <Text style={dynamicStyles.greeting}>Olá, {user?.nome || 'Ciclista'}!</Text>
                    <Text style={dynamicStyles.subtext}>Mantenha o ritmo.</Text>
                </View>

                {loading ? (
                    <View style={dynamicStyles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={dynamicStyles.loadingText}>Carregando ofensiva...</Text>
                    </View>
                ) : (
                    <>
                        <StreakCounter streak={streak} riskLevel={riskLevel} />
                        <RiskNotification riskLevel={riskLevel} />
                    </>
                )}

                <View style={dynamicStyles.actionContainer}>
                    {isRecording ? (
                        <TouchableOpacity
                            style={dynamicStyles.returnButton}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text style={dynamicStyles.returnButtonText}>VOLTAR AO MAPA (GRAVANDO...)</Text>
                        </TouchableOpacity>
                    ) : (
                        <RideButton onPress={handleRidePress} />
                    )}

                    {daysMissed === 0 && streak > 0 && !isRecording && (
                        <Text style={dynamicStyles.successText}>Ofensiva de hoje registrada!</Text>
                    )}
                </View>

                {streak > 0 && (
                    <TouchableOpacity
                        style={dynamicStyles.shareButton}
                        onPress={handleShare}
                        disabled={sharing}
                    >
                        {sharing ? (
                            <ActivityIndicator color={theme.colors.primary} />
                        ) : (
                            <>
                                <Share2 size={20} color={theme.colors.primary} />
                                <Text style={dynamicStyles.shareButtonText}>COMPARTILHE SUA OFENSIVA</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
                {Platform.OS !== 'web' && ShareCard && (
                    <View
                        collapsable={false}
                        ref={viewRef}
                        style={{ position: 'absolute', left: -5000, width: 1080, height: 1080 }}
                    >
                        <ShareCard
                            streak={streak}
                            totalDistance={streakData.totalDistance ?? 0}
                            totalDuration={streakData.totalDuration ?? 0}
                            userName={user?.nome}
                        />
                    </View>
                )}

                {Platform.OS !== 'web' && ActiveRideModal && (
                    <ActiveRideModal />
                )}

                <View style={dynamicStyles.statsContainer}>
                    <View style={dynamicStyles.statItem}>
                        <Text style={dynamicStyles.statLabel}>Última Atividade</Text>
                        <Text style={dynamicStyles.statValue}>
                            {streakData.lastRideDate
                                ? new Date(streakData.lastRideDate).toLocaleDateString('pt-BR')
                                : '--'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HomeScreen;

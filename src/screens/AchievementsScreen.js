import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { useTheme } from '../context/ThemeContext';
import AchievementCard from '../components/AchievementCard';

const AchievementsScreen = () => {
    const { streakData } = useContext(RideContext);
    const { theme } = useTheme();
    const { streak } = streakData;

    const achievements = [
        { threshold: 1, title: 'Primeiro Dia', description: 'Registrou sua primeira atividade!' },
        { threshold: 3, title: 'Aquecimento', description: 'Manteve a ofensiva por 3 dias.' },
        { threshold: 7, title: 'Semana Completa', description: 'Uma semana inteira de foco!' },
        { threshold: 30, title: 'Hábito Formado', description: '30 dias de consistência.' },
        { threshold: 100, title: 'Lenda da Ofensiva', description: '100 dias. Você é imparável.' },
    ];

    const insets = useSafeAreaInsets();

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: 24,
            backgroundColor: theme.colors.surface,
            marginBottom: 16,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        subtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        list: {
            paddingHorizontal: 16,
            paddingBottom: 32,
        }
    });

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top }]}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.title}>Conquistas</Text>
                <Text style={dynamicStyles.subtitle}>Sua jornada até aqui</Text>
            </View>
            <ScrollView contentContainerStyle={dynamicStyles.list}>
                {achievements.map((item, index) => (
                    <AchievementCard
                        key={index}
                        title={item.title}
                        description={item.description}
                        unlocked={streak >= item.threshold}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default AchievementsScreen;

import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { RideContext } from '../context/RideContext';
import AchievementCard from '../components/AchievementCard';
import { theme } from '../styles/theme';

const AchievementsScreen = () => {
    const { streakData } = useContext(RideContext);
    const { streak } = streakData;

    const achievements = [
        { threshold: 1, title: 'Primeiro Pedal', description: 'Registrou sua primeira atividade!' },
        { threshold: 3, title: 'Aquecimento', description: 'Manteve a ofensiva por 3 dias.' },
        { threshold: 7, title: 'Semana Completa', description: 'Uma semana inteira de foco!' },
        { threshold: 30, title: 'Hábito Formado', description: '30 dias de consistência.' },
        { threshold: 100, title: 'Lenda do Pedal', description: '100 dias. Você é imparável.' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Conquistas</Text>
                <Text style={styles.subtitle}>Sua jornada até aqui</Text>
            </View>
            <ScrollView contentContainerStyle={styles.list}>
                {achievements.map((item, index) => (
                    <AchievementCard
                        key={index}
                        title={item.title}
                        description={item.description}
                        unlocked={streak >= item.threshold}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.l,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.m,
    },
    title: {
        ...theme.typography.h2,
    },
    subtitle: {
        ...theme.typography.caption,
        marginTop: 4,
    },
    list: {
        paddingHorizontal: theme.spacing.m,
        paddingBottom: theme.spacing.xl,
    }
});

export default AchievementsScreen;

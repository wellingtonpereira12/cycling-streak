import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { theme } from '../styles/theme';

const StreakCounter = ({ streak, riskLevel }) => {
    const getFlameColor = () => {
        if (streak === 0) return theme.colors.disabled;
        if (riskLevel === 'danger') return theme.colors.error;
        if (riskLevel === 'warning') return '#FF9800'; // Warning Orange
        return theme.colors.primary; // Standard Fire
    };

    return (
        <View style={styles.container}>
            <View style={[styles.circle, { borderColor: getFlameColor() }]}>
                <Flame size={64} color={getFlameColor()} fill={streak > 0 ? getFlameColor() : 'transparent'} />
                <Text style={styles.count}>{streak}</Text>
                <Text style={styles.label}>DIAS</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: theme.spacing.xl,
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    count: {
        ...theme.typography.h1,
        fontSize: 64,
        marginTop: theme.spacing.s,
    },
    label: {
        ...theme.typography.caption,
        textTransform: 'uppercase',
        letterSpacing: 2,
    }
});

export default StreakCounter;

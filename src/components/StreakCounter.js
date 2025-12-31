import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const StreakCounter = ({ streak, riskLevel }) => {
    const { theme } = useTheme();

    const getFlameColor = () => {
        if (streak === 0) return theme.colors.disabled;
        if (riskLevel === 'danger') return theme.colors.error;
        if (riskLevel === 'warning') return '#FF9800'; // Warning Orange
        return theme.colors.primary; // Standard Fire
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 32,
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
            fontSize: 64,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginTop: 8,
        },
        label: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 2,
        }
    });

    return (
        <View style={dynamicStyles.container}>
            <View style={[dynamicStyles.circle, { borderColor: getFlameColor() }]}>
                <Flame size={64} color={getFlameColor()} fill={streak > 0 ? getFlameColor() : 'transparent'} />
                <Text style={dynamicStyles.count}>{streak}</Text>
                <Text style={dynamicStyles.label}>DIAS</Text>
            </View>
        </View>
    );
};

export default StreakCounter;

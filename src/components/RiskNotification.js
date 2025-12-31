import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const RiskNotification = ({ riskLevel }) => {
    const { theme, isDark } = useTheme();
    if (riskLevel === 'safe') return null;

    const isDanger = riskLevel === 'danger';
    const bgColor = isDanger
        ? (isDark ? 'rgba(207, 102, 121, 0.15)' : 'rgba(207, 102, 121, 0.1)')
        : (isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)');
    const textColor = isDanger ? theme.colors.error : '#FF9800';
    const message = isDanger
        ? "Cuidado! Você perderá sua ofensiva se não pedalar hoje!"
        : "Não esqueça de pedalar! Aumente sua ofensiva.";

    const dynamicStyles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 24,
            borderWidth: 1,
            backgroundColor: bgColor,
            borderColor: textColor,
        },
        text: {
            marginLeft: 12,
            fontWeight: 'bold',
            flex: 1,
            color: textColor,
        }
    });

    return (
        <View style={dynamicStyles.container}>
            <AlertTriangle size={24} color={textColor} />
            <Text style={dynamicStyles.text}>{message}</Text>
        </View>
    );
};

export default RiskNotification;

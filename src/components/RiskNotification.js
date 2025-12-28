import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { theme } from '../styles/theme';

const RiskNotification = ({ riskLevel }) => {
    if (riskLevel === 'safe') return null;

    const isDanger = riskLevel === 'danger';
    const bgColor = isDanger ? 'rgba(207, 102, 121, 0.2)' : 'rgba(255, 152, 0, 0.2)';
    const textColor = isDanger ? theme.colors.error : '#FF9800';
    const message = isDanger
        ? "Cuidado! Você perderá sua ofensiva se não pedalar hoje!"
        : "Não esqueça de pedalar! Aumente sua ofensiva.";

    return (
        <View style={[styles.container, { backgroundColor: bgColor, borderColor: textColor }]}>
            <AlertTriangle size={24} color={textColor} />
            <Text style={[styles.text, { color: textColor }]}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
        borderWidth: 1,
    },
    text: {
        marginLeft: theme.spacing.s,
        fontWeight: 'bold',
        flex: 1,
    }
});

export default RiskNotification;

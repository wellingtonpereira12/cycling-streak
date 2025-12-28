import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Bike } from 'lucide-react-native';
import { theme } from '../styles/theme';

const RideButton = ({ onPress, disabled }) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
        >
            <Bike size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.text}>REGISTRAR PEDAL</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        paddingVertical: theme.spacing.l,
        paddingHorizontal: theme.spacing.xxl,
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        width: '80%',
    },
    disabled: {
        backgroundColor: theme.colors.disabled,
        shadowOpacity: 0,
        elevation: 0,
    },
    text: {
        ...theme.typography.button,
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 1,
    }
});

export default RideButton;

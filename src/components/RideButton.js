import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Bike } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const RideButton = ({ onPress, disabled }) => {
    const { theme } = useTheme();

    const dynamicStyles = StyleSheet.create({
        button: {
            backgroundColor: theme.colors.primary,
            flexDirection: 'row',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 30,
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
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: 18,
            letterSpacing: 1,
        }
    });

    return (
        <TouchableOpacity
            style={[dynamicStyles.button, disabled && dynamicStyles.disabled]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
        >
            <Bike size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={dynamicStyles.text}>REGISTRAR OFENSIVA</Text>
        </TouchableOpacity>
    );
};

export default RideButton;

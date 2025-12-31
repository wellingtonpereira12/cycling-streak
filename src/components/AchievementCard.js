import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const AchievementCard = ({ title, description, unlocked }) => {
    const { theme } = useTheme();

    const dynamicStyles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            alignItems: 'center',
            borderColor: theme.colors.surfaceLight,
            borderWidth: 1,
        },
        locked: {
            opacity: 0.6,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        iconUnlocked: {
            backgroundColor: theme.colors.secondary,
        },
        iconLocked: {
            backgroundColor: theme.colors.disabled,
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 4,
        },
        textLocked: {
            color: theme.colors.textSecondary,
        },
        description: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        }
    });

    return (
        <View style={[dynamicStyles.container, !unlocked && dynamicStyles.locked]}>
            <View style={[dynamicStyles.iconContainer, unlocked ? dynamicStyles.iconUnlocked : dynamicStyles.iconLocked]}>
                <Award size={24} color={unlocked ? '#FFF' : theme.colors.textSecondary} />
            </View>
            <View style={dynamicStyles.content}>
                <Text style={[dynamicStyles.title, !unlocked && dynamicStyles.textLocked]}>{title}</Text>
                <Text style={dynamicStyles.description}>{description}</Text>
            </View>
        </View>
    );
};

export default AchievementCard;

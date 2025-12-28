import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import { theme } from '../styles/theme';

const AchievementCard = ({ title, description, unlocked }) => {
    return (
        <View style={[styles.container, !unlocked && styles.locked]}>
            <View style={[styles.iconContainer, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
                <Award size={24} color={unlocked ? '#FFF' : theme.colors.textSecondary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, !unlocked && styles.textLocked]}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.m,
        alignItems: 'center',
    },
    locked: {
        backgroundColor: 'rgba(30, 30, 30, 0.5)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
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
        ...theme.typography.body,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    textLocked: {
        color: theme.colors.textSecondary,
    },
    description: {
        ...theme.typography.caption,
    }
});

export default AchievementCard;

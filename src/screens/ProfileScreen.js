import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RideContext } from '../context/RideContext';
import { theme } from '../styles/theme';
import { User, LogOut, Trash2 } from 'lucide-react-native';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const { clearHistory, loadHistory } = useContext(RideContext);

    const handleLogout = () => {
        logout();
    };

    const handleClearHistory = async () => {
        // Not actually supported by backend in this version, but showing intent
        Alert.alert("Aviso", "Funcionalidade de limpar histórico não implementada no backend ainda.");
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <User size={64} color={theme.colors.text} />
                </View>
                <Text style={styles.name}>{user?.nome || 'Usuário'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conta</Text>

                <TouchableOpacity style={styles.option} onPress={handleLogout}>
                    <View style={styles.optionLeft}>
                        <LogOut size={24} color={theme.colors.error} />
                        <Text style={[styles.optionText, { color: theme.colors.error }]}>Sair da conta</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceLight,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.m,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    name: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.xs,
    },
    email: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    section: {
        padding: theme.spacing.l,
    },
    sectionTitle: {
        ...theme.typography.subtitle,
        marginBottom: theme.spacing.m,
        textTransform: 'uppercase',
        fontSize: 14,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    optionText: {
        ...theme.typography.body,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;

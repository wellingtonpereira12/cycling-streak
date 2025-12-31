import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RideContext } from '../context/RideContext';
import { useTheme } from '../context/ThemeContext';
import { User, LogOut, Trash2, Settings, Sun, Moon, Monitor, Check } from 'lucide-react-native';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const { clearHistory, loadHistory, isRecording, stopLiveRide } = useContext(RideContext);
    const { theme, themePreference, setThemePreference } = useTheme();
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    const handleLogout = async () => {
        if (isRecording) {
            console.log("Stopping active ride before logout...");
            try {
                // Stop without saving
                await stopLiveRide(false);
            } catch (e) {
                console.error("Failed to stop ride on logout:", e);
            }
        }
        logout();
    };

    const insets = useSafeAreaInsets();

    const ThemeOption = ({ label, value, icon: Icon }) => (
        <TouchableOpacity
            style={[
                styles.themeOption,
                { backgroundColor: theme.colors.surfaceLight },
                themePreference === value && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setThemePreference(value)}
        >
            <View style={styles.optionLeft}>
                <Icon size={24} color={themePreference === value ? theme.colors.primary : theme.colors.text} />
                <Text style={[
                    styles.optionText,
                    { color: themePreference === value ? theme.colors.primary : theme.colors.text }
                ]}>
                    {label}
                </Text>
            </View>
            {themePreference === value && <Check size={20} color={theme.colors.primary} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.surfaceLight }]}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                    <User size={64} color={theme.colors.text} />
                </View>
                <Text style={[styles.name, { color: theme.colors.text }]}>{user?.nome || 'Usuário'}</Text>
                <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Configurações</Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setSettingsModalVisible(true)}
                >
                    <View style={styles.optionLeft}>
                        <Settings size={24} color={theme.colors.text} />
                        <Text style={[styles.optionText, { color: theme.colors.text }]}>Configurações de Tema</Text>
                    </View>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {themePreference === 'automatic' ? 'Automático' : themePreference}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Conta</Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: theme.colors.surface }]}
                    onPress={handleLogout}
                >
                    <View style={styles.optionLeft}>
                        <LogOut size={24} color={theme.colors.error} />
                        <Text style={[styles.optionText, { color: theme.colors.error }]}>Sair da conta</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={settingsModalVisible}
                onRequestClose={() => setSettingsModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setSettingsModalVisible(false)}
                >
                    <View
                        style={[
                            styles.modalContent,
                            { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20 }
                        ]}
                    >
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.surfaceLight }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Escolher Tema</Text>
                            <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Fechar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <ThemeOption label="Automático (Padrão)" value="automatic" icon={Monitor} />
                            <ThemeOption label="Light" value="light" icon={Sun} />
                            <ThemeOption label="Dark" value="dark" icon={Moon} />
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        marginBottom: 16,
        textTransform: 'uppercase',
        fontSize: 14,
        fontWeight: 'bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    optionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 20,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
});

export default ProfileScreen;

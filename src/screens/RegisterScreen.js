import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setErrorMessage('Preencha todos os campos');
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage('Email inválido. Digite um email válido.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setErrorMessage('');
        setLoading(true);
        try {
            await register(name, email, password);
        } catch (error) {
            const message = error.response?.data?.msg;
            if (message === 'User already exists') {
                setErrorMessage('Este email já está cadastrado. Faça login.');
            } else {
                setErrorMessage('Erro no cadastro. Verifique os dados e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Crie sua conta</Text>
                <Text style={styles.subtitle}>Comece sua jornada de pedaladas hoje.</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Seu Nome"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {errorMessage ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={theme.colors.text} />
                        ) : (
                            <Text style={styles.buttonText}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>
                            Já tem conta? <Text style={styles.linkHighlight}>Faça Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.m,
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        ...theme.typography.subtitle,
        marginBottom: theme.spacing.xl,
    },
    form: {
        gap: theme.spacing.m,
    },
    label: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        fontSize: 16,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        marginTop: theme.spacing.s,
    },
    buttonText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.m,
        fontSize: 16,
    },
    linkHighlight: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    errorContainer: {
        marginTop: theme.spacing.m,
        padding: theme.spacing.m,
        backgroundColor: 'rgba(207, 102, 121, 0.1)',
        borderRadius: theme.borderRadius.m,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 14,
    },
});

export default RegisterScreen;

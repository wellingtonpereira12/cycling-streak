import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage('Preencha todos os campos');
            return;
        }
        setErrorMessage('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.msg;

            if (status === 404 || message === 'User not found') {
                setErrorMessage('Conta não encontrada. Este email não está cadastrado.');
            } else {
                setErrorMessage(message || 'Credenciais inválidas. Verifique seu email e senha.');
            }
        } finally {
            setLoading(false);
        }
    };

    const insets = useSafeAreaInsets();

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: 16,
            justifyContent: 'center',
        },
        logoContainer: {
            alignItems: 'center',
            marginBottom: 32,
        },
        logo: {
            width: 120,
            height: 120,
            borderRadius: 60,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 18,
            color: theme.colors.textSecondary,
            marginBottom: 32,
        },
        form: {
            gap: 16,
        },
        label: {
            color: theme.colors.textSecondary,
            marginBottom: 4,
            fontSize: 16,
        },
        input: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            padding: 16,
            borderRadius: 8,
            fontSize: 16,
            borderWidth: 1,
            borderColor: theme.colors.surfaceLight,
        },
        button: {
            backgroundColor: theme.colors.primary,
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold',
        },
        linkText: {
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: 16,
            fontSize: 16,
        },
        linkHighlight: {
            color: theme.colors.primary,
            fontWeight: 'bold',
        },
        errorContainer: {
            marginTop: 16,
            padding: 16,
            backgroundColor: 'rgba(207, 102, 121, 0.1)',
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.error,
        },
        errorText: {
            color: theme.colors.error,
            fontSize: 14,
            marginBottom: 4,
        },
        errorLink: {
            color: theme.colors.primary,
            fontSize: 14,
            fontWeight: 'bold',
            textDecorationLine: 'underline',
        },
    });

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={dynamicStyles.content}>
                <View style={dynamicStyles.logoContainer}>
                    <Image source={require('../../assets/logo.png')} style={dynamicStyles.logo} />
                </View>
                <Text style={dynamicStyles.title}>Bem-vindo de volta!</Text>
                <Text style={dynamicStyles.subtitle}>Faça login para continuar suando a camisa.</Text>

                <View style={dynamicStyles.form}>
                    <Text style={dynamicStyles.label}>Email</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={dynamicStyles.label}>Senha</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="********"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {errorMessage ? (
                        <View style={dynamicStyles.errorContainer}>
                            <Text style={dynamicStyles.errorText}>{errorMessage}</Text>
                            {errorMessage.includes('não encontrada') && (
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={dynamicStyles.errorLink}>Criar uma conta agora</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null}

                    <TouchableOpacity style={dynamicStyles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={dynamicStyles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={dynamicStyles.linkText}>
                            Não tem uma conta? <Text style={dynamicStyles.linkHighlight}>Cadastre-se</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;

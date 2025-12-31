import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const { theme } = useTheme();
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
            width: 100,
            height: 100,
            borderRadius: 50,
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
        },
    });

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={dynamicStyles.content}>
                <View style={dynamicStyles.logoContainer}>
                    <Image source={require('../../assets/logo.png')} style={dynamicStyles.logo} />
                </View>
                <Text style={dynamicStyles.title}>Crie sua conta</Text>
                <Text style={dynamicStyles.subtitle}>Comece sua jornada de pedaladas hoje.</Text>

                <View style={dynamicStyles.form}>
                    <Text style={dynamicStyles.label}>Nome</Text>
                    <TextInput
                        style={dynamicStyles.input}
                        placeholder="Seu Nome"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />

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
                        </View>
                    ) : null}

                    <TouchableOpacity style={dynamicStyles.button} onPress={handleRegister} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={dynamicStyles.buttonText}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={dynamicStyles.linkText}>
                            Já tem conta? <Text style={dynamicStyles.linkHighlight}>Faça Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default RegisterScreen;

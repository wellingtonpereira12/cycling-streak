import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, History, Award, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MainTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: 'transparent',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Início"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Histórico"
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Conquistas"
                component={AchievementsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Award color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
};

const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    const { userToken, isLoading } = useAuth();
    console.log("AppNavigator render: userToken =", userToken);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? <MainTabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;

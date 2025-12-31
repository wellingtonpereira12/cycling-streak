import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = () => {
    const { loadHistory } = useContext(RideContext);
    const { theme } = useTheme();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        const data = await loadHistory();
        setHistory(data);
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchHistory();
        }, [])
    );

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        list: {
            padding: 16,
        },
        item: {
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: 8,
            marginBottom: 8,
        },
        dateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        dateText: {
            fontSize: 16,
            color: theme.colors.text,
            marginLeft: 8,
            textTransform: 'capitalize',
            fontWeight: 'bold',
        },
        detailsContainer: {
            flexDirection: 'row',
            gap: 24,
        },
        detail: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        detailText: {
            color: theme.colors.textSecondary,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            fontSize: 18,
            color: theme.colors.textSecondary,
        }
    });

    const renderItem = ({ item }) => {
        const date = new Date(item.data_pedal);
        const dateString = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' });

        return (
            <View style={dynamicStyles.item}>
                <View style={dynamicStyles.dateContainer}>
                    <Calendar size={18} color={theme.colors.primary} />
                    <Text style={dynamicStyles.dateText}>{dateString}</Text>
                </View>
                <View style={dynamicStyles.detailsContainer}>
                    {item.distancia_km && (
                        <View style={dynamicStyles.detail}>
                            <MapPin size={16} color={theme.colors.textSecondary} />
                            <Text style={dynamicStyles.detailText}>{item.distancia_km} km</Text>
                        </View>
                    )}
                    {item.duracao_seg ? (
                        <View style={dynamicStyles.detail}>
                            <Clock size={16} color={theme.colors.textSecondary} />
                            <Text style={dynamicStyles.detailText}>
                                {Math.floor(item.duracao_seg / 3600).toString().padStart(2, '0')}:
                                {Math.floor((item.duracao_seg % 3600) / 60).toString().padStart(2, '0')}:
                                {Math.floor(item.duracao_seg % 60).toString().padStart(2, '0')}
                            </Text>
                        </View>
                    ) : item.duracao_min ? (
                        <View style={dynamicStyles.detail}>
                            <Clock size={16} color={theme.colors.textSecondary} />
                            <Text style={dynamicStyles.detailText}>{item.duracao_min} min</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[dynamicStyles.container, { paddingTop: insets.top }]}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.title}>Histórico de Pedais</Text>
            </View>

            {loading ? (
                <View style={dynamicStyles.emptyContainer}>
                    <ActivityIndicator color={theme.colors.primary} />
                </View>
            ) : history.length === 0 ? (
                <View style={dynamicStyles.emptyContainer}>
                    <Text style={dynamicStyles.emptyText}>Nenhum pedal registrado ainda.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={dynamicStyles.list}
                    refreshing={loading}
                    onRefresh={fetchHistory}
                />
            )}
        </View>
    );
};

export default HistoryScreen;

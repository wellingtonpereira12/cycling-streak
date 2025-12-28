import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RideContext } from '../context/RideContext';
import { theme } from '../styles/theme';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = () => {
    const { loadHistory } = useContext(RideContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        const data = await loadHistory();
        setHistory(data);
        setLoading(false);
    };

    // Refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchHistory();
        }, [])
    );

    const renderItem = ({ item }) => {
        // item: { id, data_pedal, distancia_km, duracao_min }
        const date = new Date(item.data_pedal);
        // Correct for timezone offset if needed, or just display UTC date string
        // Assuming YYYY-MM-DD from backend
        const dateString = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' });

        return (
            <View style={styles.item}>
                <View style={styles.dateContainer}>
                    <Calendar size={18} color={theme.colors.primary} />
                    <Text style={styles.dateText}>{dateString}</Text>
                </View>
                <View style={styles.detailsContainer}>
                    {item.distancia_km && (
                        <View style={styles.detail}>
                            <MapPin size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{item.distancia_km} km</Text>
                        </View>
                    )}
                    {item.duracao_min && (
                        <View style={styles.detail}>
                            <Clock size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{item.duracao_min} min</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Histórico de Pedais</Text>
            </View>

            {loading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator color={theme.colors.primary} />
                </View>
            ) : history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhum pedal registrado ainda.</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={async () => {
                        setLoading(true);
                        const data = await loadHistory();
                        setHistory(data);
                        setLoading(false);
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    title: {
        ...theme.typography.h2,
    },
    list: {
        padding: theme.spacing.m,
    },
    item: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    dateText: {
        ...theme.typography.body,
        marginLeft: theme.spacing.s,
        textTransform: 'capitalize',
        fontWeight: 'bold',
    },
    detailsContainer: {
        flexDirection: 'row',
        gap: theme.spacing.l,
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
        ...theme.typography.subtitle,
    }
});

export default HistoryScreen;

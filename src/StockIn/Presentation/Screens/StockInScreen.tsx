import React, { useEffect, useState } from 'react'
import { View, FlatList, StyleSheet, ScrollView } from 'react-native'
import {
    Appbar,
    Searchbar,
    ActivityIndicator,
    Text,
    Chip,
    Card,
    Button,
    Badge,
    Divider,
    SegmentedButtons,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from 'src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { withProviders } from 'src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { useI18n } from 'src/Core/Presentation/Hooks/UseI18n'
import { useTheme } from 'src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'
import StockInEntity from '../../Domain/Entities/StockInEntity'

const StockInScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const stockInStore = useStockInStore()
    const theme = useTheme()
    const i18n = useI18n()

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Load stock in data when component mounts
        stockInStore.resetFilters() // Start with no filters applied
    }, [stockInStore])

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleSearch = () => {
        stockInStore.search(searchQuery)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        stockInStore.search('')
    }

    const handleProcess = (id: string) => {
        // Navigate to the process screen with the selected stock in ID
        navigation.navigate('StockInProcess', { id })
    }

    const handleFilter = (value: string) => {
        if (value === 'all') {
            stockInStore.resetFilters()
        } else {
            stockInStore.filterByStatus(value as any)
        }
    }

    const getStatusColor = (status: StockInEntity['status']) => {
        switch (status) {
            case 'DRAFT':
                return '#ff9800'; // Orange
            case 'PENDING':
                return '#2196f3'; // Blue
            case 'APPROVED':
                return '#4caf50'; // Green
            case 'REJECTED':
            case 'CANCELLED':
                return '#f44336'; // Red
            default:
                return '#757575'; // Grey
        }
    };
    const formatAmount = (amount: string) => {
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    const renderStockInItem = ({ item }: { item: StockInEntity }) => {
        const statusColor = getStatusColor(item.status);
        const isProcessable = ['DRAFT', 'PENDING'].includes(item.status);
    
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text variant="titleMedium">{item.code}</Text>
                            <Text variant="bodySmall">
                                Date: {formatDate(item.inDate)}
                            </Text>
                        </View>
                        <Badge
                            style={{
                                backgroundColor: statusColor,
                                color: 'white',
                            }}
                        >
                            {item.status}
                        </Badge>
                    </View>
    
                    <Divider style={styles.divider} />
    
                    <View style={styles.cardDetails}>
                        <View style={styles.detailRow}>
                            <Text
                                variant="bodyMedium"
                                style={styles.detailLabel}
                            >
                                Supplier:
                            </Text>
                            <Text
                                variant="bodyMedium"
                                style={styles.detailValue}
                            >
                                {item.supplier?.name || 'N/A'}
                            </Text>
                        </View>
    
                        <View style={styles.detailRow}>
                            <Text
                                variant="bodyMedium"
                                style={styles.detailLabel}
                            >
                                Total Items:
                            </Text>
                            <Text
                                variant="bodyMedium"
                                style={styles.detailValue}
                            >
                                {item.details.length}
                            </Text>
                        </View>
    
                        <View style={styles.detailRow}>
                            <Text
                                variant="bodyMedium"
                                style={styles.detailLabel}
                            >
                                Amount:
                            </Text>
                            <Text
                                variant="bodyMedium"
                                style={styles.detailValue}
                            >
                                ${formatAmount(item.totalAmount)}
                            </Text>
                        </View>
                    </View>
    
                    <Divider style={styles.divider} />
    
                    <Text variant="bodySmall">
                        Items ({item.details.length}):
                    </Text>
                    <View style={styles.productsPreview}>
                        {item.details.slice(0, 2).map((detail, index) => (
                            <Text
                                key={index}
                                variant="bodySmall"
                                style={styles.productItem}
                            >
                                • {detail.goods?.name || `Item #${index + 1}`} ({detail.quantity} units)
                            </Text>
                        ))}
                        {item.details.length > 2 && (
                            <Text
                                variant="bodySmall"
                                style={styles.moreProducts}
                            >
                                And {item.details.length - 2} more item(s)...
                            </Text>
                        )}
                    </View>
                </Card.Content>
    
                <Card.Actions>
                    <Button
                        mode="contained"
                        onPress={() => handleProcess(item.id)}
                        disabled={!isProcessable}
                    >
                        {isProcessable ? 'Process' : 'View Details'}
                    </Button>
                </Card.Actions>
            </Card>
        );
    };

    return (
        <View
            style={{ flex: 1, backgroundColor: theme.theme.colors.background }}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="Stock In" />
                </Appbar.Header>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Search stock ins"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        onSubmitEditing={handleSearch}
                        onClearIconPress={handleClearSearch}
                        style={styles.searchbar}
                    />
                </View>

                {/* Status Filter */}
                <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.filterScrollContent}
    style={styles.filterContainer}
>
    {[
        { value: 'all', label: 'All' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ].map(filter => (
        <Chip
            key={filter.value}
            selected={
                (filter.value === 'all' &&
                    !stockInStore.filters.status) ||
                stockInStore.filters.status === filter.value
            }
            onPress={() => handleFilter(filter.value)}
            style={[
                styles.filterChip,
                (filter.value === 'all' &&
                    !stockInStore.filters.status) ||
                stockInStore.filters.status === filter.value
                    ? styles.activeFilterChip
                    : styles.inactiveFilterChip,
            ]}
            showSelectedCheck={false}
            mode="flat"
            textStyle={[
                (filter.value === 'all' &&
                    !stockInStore.filters.status) ||
                stockInStore.filters.status === filter.value
                    ? styles.activeFilterText
                    : styles.inactiveFilterText,
            ]}
        >
            {filter.label}
        </Chip>
    ))}
</ScrollView>

                {/* Stock In List */}
                {stockInStore.isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loaderText}>
                            Loading stock ins...
                        </Text>
                    </View>
                ) : stockInStore.isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">
                            No stock in records found
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => stockInStore.resetFilters()}
                            style={styles.resetButton}
                        >
                            Reset Filters
                        </Button>
                    </View>
                ) : (
                    <FlatList
                        data={stockInStore.results}
                        keyExtractor={item => item.id}
                        renderItem={renderStockInItem}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </View>
    )
})

const styles = StyleSheet.create({
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchbar: {
        elevation: 0,
    },
    filterArea: {
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    filterContainer: {
        paddingVertical: 12,
    },
    filterScrollContent: {
        paddingHorizontal: 16,
        paddingRight: 24,
        gap: 12,
    },
    filterChip: {
        height: 36,
        minWidth: 100,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterChipText: {
        textAlign: 'center',
    },
    activeFilterChip: {
        backgroundColor: '#5D3FD3',
    },
    inactiveFilterChip: {
        backgroundColor: '#EDE9FE',
    },
    activeFilterText: {
        color: 'white',
        fontWeight: '500',
    },
    inactiveFilterText: {
        color: '#4B5563',
    },
    card: {
        marginBottom: 12,
        borderRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    divider: {
        marginVertical: 8,
    },
    cardDetails: {
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    detailLabel: {
        flex: 1,
        fontWeight: 'bold',
    },
    detailValue: {
        flex: 2,
    },
    productsPreview: {
        marginTop: 4,
    },
    productItem: {
        marginBottom: 2,
    },
    moreProducts: {
        fontStyle: 'italic',
        marginTop: 2,
    },
    listContent: {
        padding: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    resetButton: {
        marginTop: 16,
    },
})

export default withProviders(StockInStoreProvider)(StockInScreen)

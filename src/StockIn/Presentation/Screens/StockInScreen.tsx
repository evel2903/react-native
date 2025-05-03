import React, { useEffect, useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import {
    Appbar,
    Searchbar,
    ActivityIndicator,
    Text,
    Card,
    Button,
    IconButton,
    Divider,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'

// Define the StockIn type based on the actual API response
interface StockInItem {
    id: string
    code: string
    supplierId: string
    supplierCode: string
    supplierName: string
    inDate: string
    description: string
    status: string
    notes: string
    priority: number
    totalAmount: string
    count: number
    lotNumber: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
}

const StockInScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const stockInStore = useStockInStore()
    const theme = useTheme()

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Load stock in data when component mounts
        stockInStore.resetFilters()
    }, [])

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleAddStockIn = () => {
        // Navigate to add stock in screen
        // This would be implemented in a real app
        console.log('Add stock in pressed')
    }

    const handleSearch = () => {
        stockInStore.search(searchQuery)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        stockInStore.search('')
    }

    const handleApprove = (id: string) => {
        // Approve functionality would be implemented here
        console.log('Approve stock in:', id)
    }

    const handleView = (id: string) => {
        navigation.navigate('StockInProcess', { id })
    }

    const handleEdit = (id: string) => {
        // Edit functionality would be implemented here
        console.log('Edit stock in:', id)
    }

    const handleDelete = (id: string) => {
        // Delete functionality would be implemented here
        console.log('Delete stock in:', id)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-CA').replace(/-/g, '/')
    }

    const renderStockInItem = ({ item }: { item: StockInItem }) => {
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.stockInInfo}>
                        <Text style={styles.codeText}>Code: {item.code}</Text>
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationText}>1</Text>
                        </View>
                    </View>
                    <Text>Lot number: {item.lotNumber}</Text>
                    <Text>Stock in date: {formatDate(item.inDate)}</Text>
                    <Text>{item.supplierCode}-KSS</Text>
                    <View style={styles.detailsRow}>
                        <Text>Quantity of goods: {item.count || 2}</Text>
                        <Text>Total cost: {parseInt(item.totalAmount) || 500}</Text>
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.actionsRow}>
                        <Button 
                            mode="contained"
                            style={styles.approveButton}
                            onPress={() => handleApprove(item.id)}
                        >
                            Approve
                        </Button>
                        <View style={styles.iconButtons}>
                            <IconButton 
                                icon="eye"
                                size={20}
                                onPress={() => handleView(item.id)}
                            />
                            <IconButton 
                                icon="pencil"
                                size={20}
                                onPress={() => handleEdit(item.id)}
                            />
                            <IconButton 
                                icon="delete"
                                size={20}
                                onPress={() => handleDelete(item.id)}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="Stock In" />
                    <Appbar.Action icon="plus" onPress={handleAddStockIn} />
                </Appbar.Header>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="search"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        onSubmitEditing={handleSearch}
                        onClearIconPress={handleClearSearch}
                        style={styles.searchbar}
                        right={() => (
                            <IconButton icon="filter-variant" onPress={() => {}} />
                        )}
                    />
                </View>

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
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchbar: {
        elevation: 0,
    },
    card: {
        marginBottom: 12,
        borderRadius: 8,
    },
    stockInInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontWeight: 'bold',
    },
    notificationBadge: {
        backgroundColor: '#d32f2f',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    divider: {
        marginVertical: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    approveButton: {
        borderRadius: 4,
    },
    iconButtons: {
        flexDirection: 'row',
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
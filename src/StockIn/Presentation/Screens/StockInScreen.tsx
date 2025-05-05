import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Dimensions } from 'react-native'
import {
    Appbar,
    Searchbar,
    ActivityIndicator,
    Text,
    Button,
    IconButton,
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
import StockInListItem from '../Components/StockInListItem'
import StockInFilterForm from '../Components/StockInFilterForm'

const StockInScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const stockInStore = useStockInStore()
    const theme = useTheme()
    const [searchQuery, setSearchQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const windowHeight = Dimensions.get('window').height

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

    const handleToggleFilter = () => {
        stockInStore.toggleFilterVisible()
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

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        stockInStore.getStockIns().finally(() => {
            setRefreshing(false)
        })
    }, [stockInStore])

    // Calculate list height dynamically based on whether filter is visible
    const getListHeight = () => {
        const baseHeight = windowHeight - 160 // Height minus header and search bar
        return stockInStore.filterVisible ? baseHeight - 320 : baseHeight
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

                {/* Search and Filter Bar */}
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Search stock ins..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        onSubmitEditing={handleSearch}
                        onClearIconPress={handleClearSearch}
                        style={styles.searchbar}
                    />
                    <IconButton 
                        icon="filter-variant" 
                        onPress={handleToggleFilter}
                        style={[
                            styles.filterButton,
                            stockInStore.filterVisible ? styles.filterButtonActive : {}
                        ]}
                    />
                </View>

                {/* Filter Form */}
                {stockInStore.filterVisible && (
                    <View style={styles.filterContainer}>
                        <StockInFilterForm />
                    </View>
                )}

                {/* Stock In List */}
                {stockInStore.isLoading && !refreshing ? (
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
                        renderItem={({ item }) => (
                            <StockInListItem
                                item={item}
                                onApprove={handleApprove}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                        contentContainerStyle={[
                            styles.listContent,
                            { minHeight: getListHeight() }
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.theme.colors.primary]}
                            />
                        }
                    />
                )}

                {/* Removed FAB in favor of header action button */}
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
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    searchbar: {
        flex: 1,
        elevation: 2,
    },
    filterButton: {
        marginLeft: 8,
        elevation: 2,
    },
    filterButtonActive: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    filterContainer: {
        zIndex: 2,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20, // Reduced padding since we're not using FAB
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
    // FAB styles removed as we're using the header button instead
})

export default withProviders(StockInStoreProvider)(StockInScreen)
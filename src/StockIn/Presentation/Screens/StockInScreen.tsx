import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    Dimensions,
} from 'react-native'
import {
    Appbar,
    ActivityIndicator,
    Text,
    Button,
    IconButton,
    Card,
    Chip,
    Divider,
    Portal,
    Dialog,
    Snackbar,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
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
    const [refreshing, setRefreshing] = useState(false)
    const windowHeight = Dimensions.get('window').height

    // Add states for delete confirmation dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [stockToDelete, setStockToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Add snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    useEffect(() => {
        // Load stock in data when component mounts
        stockInStore.resetFilters()
    }, [])

    // Add useFocusEffect to refresh the list when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            stockInStore.getStockIns()
            return () => {}
        }, [stockInStore])
    )

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleAddStockIn = () => {
        // Navigate to add stock in screen
        navigation.navigate('StockInAdd')
    }

    const handleToggleFilter = () => {
        stockInStore.toggleFilterVisible()
    }

    const handleApprove = (id: string) => {
        // Approve functionality would be implemented here
        console.log('Approve stock in:', id)
    }

    const handleView = (id: string) => {
        navigation.navigate('StockInView', { id })
    }

    const handleEdit = (id: string) => {
        // Edit functionality would be implemented here
        navigation.navigate('StockInEdit', { id })
    }

    // Updated to show delete confirmation dialog
    const handleDelete = (id: string) => {
        setStockToDelete(id)
        setDeleteDialogVisible(true)
    }

    // Method to handle delete confirmation
    const confirmDelete = async () => {
        if (!stockToDelete) return

        setIsDeleting(true)

        try {
            const success = await stockInStore.deleteStockIn(stockToDelete)

            if (success) {
                showSnackbar('Stock in record deleted successfully')
            } else {
                showSnackbar('Failed to delete stock in record')
            }
        } catch (error) {
            console.error('Error during deletion:', error)
            showSnackbar('An error occurred while deleting')
        } finally {
            setIsDeleting(false)
            setDeleteDialogVisible(false)
            setStockToDelete(null)
        }
    }

    // Method to handle cancellation
    const cancelDelete = () => {
        setDeleteDialogVisible(false)
        setStockToDelete(null)
    }

    // Helper method to show snackbar message
    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        stockInStore.getStockIns().finally(() => {
            setRefreshing(false)
        })
    }, [stockInStore])

    // Calculate list height dynamically based on whether filter is visible
    const getListHeight = () => {
        const baseHeight = windowHeight - 120 // Height minus header
        return stockInStore.filterVisible ? baseHeight - 320 : baseHeight
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.theme.colors.background },
            ]}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="Stock In" />
                    <Appbar.Action
                        icon="magnify"
                        onPress={handleToggleFilter}
                        color={
                            stockInStore.filterVisible
                                ? theme.theme.colors.primary
                                : undefined
                        }
                    />
                    <Appbar.Action icon="plus" onPress={handleAddStockIn} />
                </Appbar.Header>

                {/* Filter Form */}
                {stockInStore.filterVisible && (
                    <View style={styles.filterContainer}>
                        <StockInFilterForm />
                    </View>
                )}

                {/* Applied Filters Indicator */}
                {Object.values(stockInStore.filters).some(
                    value => value !== undefined
                ) && (
                    <View style={styles.activeFiltersIndicator}>
                        <Text variant="bodySmall">Filters applied</Text>
                        <Button
                            mode="text"
                            compact
                            onPress={() => stockInStore.resetFilters()}
                        >
                            Clear
                        </Button>
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
                            { minHeight: getListHeight() },
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

                {/* Delete Confirmation Dialog */}
                <Portal>
                    <Dialog
                        visible={deleteDialogVisible}
                        onDismiss={cancelDelete}
                    >
                        <Dialog.Title>Confirm Deletion</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">
                                Are you sure you want to delete this stock in
                                record? This action cannot be undone.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={cancelDelete}>Cancel</Button>
                            <Button
                                onPress={confirmDelete}
                                loading={isDeleting}
                                disabled={isDeleting}
                                textColor={theme.theme.colors.error}
                            >
                                Delete
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Snackbar for notifications */}
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    action={{
                        label: 'Dismiss',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
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
    filterContainer: {
        zIndex: 2,
    },
    activeFiltersIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
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
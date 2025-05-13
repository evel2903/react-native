// src/StockOut/Presentation/Screens/StockOutScreen.tsx
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
    Portal,
    Dialog,
    Snackbar,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockOutStore } from '../Stores/StockOutStore/UseStockOutStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockOutStoreProvider } from '../Stores/StockOutStore/StockOutStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'
import StockOutListItem from '../Components/StockOutListItem'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'

const StockOutScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockOut'>>()
    const stockOutStore = useStockOutStore()
    const authStore = useAuthStore()
    const theme = useTheme()
    const [refreshing, setRefreshing] = useState(false)
    const windowHeight = Dimensions.get('window').height

    // Dialog states for delete
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [stockToDelete, setStockToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Dialog states for approval
    const [approvalDialogVisible, setApprovalDialogVisible] = useState(false)
    const [stockToApprove, setStockToApprove] = useState<string | null>(null)
    const [isApproving, setIsApproving] = useState(false)

    // Dialog states for rejection
    const [rejectDialogVisible, setRejectDialogVisible] = useState(false)
    const [stockToReject, setStockToReject] = useState<string | null>(null)
    const [isRejecting, setIsRejecting] = useState(false)

    // Dialog states for request approval
    const [requestApprovalDialogVisible, setRequestApprovalDialogVisible] =
        useState(false)
    const [stockToRequestApproval, setStockToRequestApproval] = useState<
        string | null
    >(null)
    const [isRequestingApproval, setIsRequestingApproval] = useState(false)

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    useEffect(() => {
        // Load stock out data when component mounts
        stockOutStore.resetFilters()
    }, [])

    // Add useFocusEffect to refresh the list when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            stockOutStore.getStockOuts()
            return () => {}
        }, [stockOutStore])
    )

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleAddStockOut = () => {
        // Navigate to add stock out screen
        // For now, show a message since we haven't implemented this screen yet
        showSnackbar('Add Stock Out functionality will be implemented soon')
    }

    const handleToggleFilter = () => {
        stockOutStore.toggleFilterVisible()
        
        // For now, show a message since we haven't implemented the filter component yet
        showSnackbar('Filter functionality will be implemented soon')
    }

    // Placeholder handlers for stock out actions
    const handleRequestApproval = (id: string) => {
        setStockToRequestApproval(id)
        setRequestApprovalDialogVisible(true)
    }

    const confirmRequestApproval = async () => {
        showSnackbar('Request approval functionality will be implemented soon')
        setRequestApprovalDialogVisible(false)
        setStockToRequestApproval(null)
    }

    const handleApprove = (id: string) => {
        setStockToApprove(id)
        setApprovalDialogVisible(true)
    }

    const confirmApprove = async () => {
        showSnackbar('Approve functionality will be implemented soon')
        setApprovalDialogVisible(false)
        setStockToApprove(null)
    }

    const handleReject = (id: string) => {
        setStockToReject(id)
        setRejectDialogVisible(true)
    }

    const confirmReject = async () => {
        showSnackbar('Reject functionality will be implemented soon')
        setRejectDialogVisible(false)
        setStockToReject(null)
    }

    const handleView = (id: string) => {
        showSnackbar('View functionality will be implemented soon')
    }

    const handleEdit = (id: string) => {
        showSnackbar('Edit functionality will be implemented soon')
    }

    const handleDelete = (id: string) => {
        setStockToDelete(id)
        setDeleteDialogVisible(true)
    }

    const confirmDelete = async () => {
        showSnackbar('Delete functionality will be implemented soon')
        setDeleteDialogVisible(false)
        setStockToDelete(null)
    }

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
        stockOutStore.getStockOuts().finally(() => {
            setRefreshing(false)
        })
    }, [stockOutStore])

    // Calculate list height dynamically based on whether filter is visible
    const getListHeight = () => {
        const baseHeight = windowHeight - 120 // Height minus header
        return stockOutStore.filterVisible ? baseHeight - 320 : baseHeight
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
                    <Appbar.Content title="Stock Out" />
                    <Appbar.Action
                        icon="magnify"
                        onPress={handleToggleFilter}
                        color={
                            stockOutStore.filterVisible
                                ? theme.theme.colors.primary
                                : undefined
                        }
                    />
                    <Appbar.Action icon="plus" onPress={handleAddStockOut} />
                </Appbar.Header>

                {/* Applied Filters Indicator */}
                {Object.values(stockOutStore.filters).some(
                    value => value !== undefined
                ) && (
                    <View style={styles.activeFiltersIndicator}>
                        <Text variant="bodySmall">Filters applied</Text>
                        <Button
                            mode="text"
                            compact
                            onPress={() => stockOutStore.resetFilters()}
                        >
                            Clear
                        </Button>
                    </View>
                )}

                {/* Stock Out List */}
                {stockOutStore.isLoading && !refreshing ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loaderText}>
                            Loading stock outs...
                        </Text>
                    </View>
                ) : stockOutStore.isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">
                            No stock out records found
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => stockOutStore.resetFilters()}
                            style={styles.resetButton}
                        >
                            Reset Filters
                        </Button>
                    </View>
                ) : (
                    <FlatList
                        data={stockOutStore.results}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <StockOutListItem
                                item={item}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onRequestApproval={handleRequestApproval}
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
                                Are you sure you want to delete this stock out
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

                {/* Request Approval Dialog */}
                <Portal>
                    <Dialog
                        visible={requestApprovalDialogVisible}
                        onDismiss={() => setRequestApprovalDialogVisible(false)}
                    >
                        <Dialog.Title>Request Approval</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">
                                Are you sure you want to request approval for
                                this stock out record? This will send it to the
                                approval workflow.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                onPress={() =>
                                    setRequestApprovalDialogVisible(false)
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={confirmRequestApproval}
                                loading={isRequestingApproval}
                                disabled={isRequestingApproval}
                            >
                                Request Approval
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Approve Dialog */}
                <Portal>
                    <Dialog
                        visible={approvalDialogVisible}
                        onDismiss={() => setApprovalDialogVisible(false)}
                    >
                        <Dialog.Title>Approve Stock Out</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">
                                Are you sure you want to approve this stock out
                                record?
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                onPress={() => setApprovalDialogVisible(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={confirmApprove}
                                loading={isApproving}
                                disabled={isApproving}
                            >
                                Approve
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Reject Dialog */}
                <Portal>
                    <Dialog
                        visible={rejectDialogVisible}
                        onDismiss={() => setRejectDialogVisible(false)}
                    >
                        <Dialog.Title>Reject Stock Out</Dialog.Title>
                        <Dialog.Content>
                            <Text variant="bodyMedium">
                                Are you sure you want to reject this stock out
                                record?
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                onPress={() => setRejectDialogVisible(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={confirmReject}
                                loading={isRejecting}
                                disabled={isRejecting}
                                textColor={theme.theme.colors.error}
                            >
                                Reject
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

export default withProviders(
    StockOutStoreProvider,
    AuthStoreProvider
)(StockOutScreen)
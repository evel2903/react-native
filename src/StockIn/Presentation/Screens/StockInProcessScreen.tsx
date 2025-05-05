import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import {
    Appbar,
    Card,
    Text,
    Divider,
    Button,
    Chip,
    DataTable,
    Dialog,
    Portal,
    Paragraph,
    ActivityIndicator,
    IconButton,
    Surface,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RootStackScreenProps } from 'src/Core/Presentation/Navigation/Types/Index'
import { StatusBar } from 'expo-status-bar'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { withProviders } from 'src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { useTheme } from 'src/Core/Presentation/Theme/ThemeProvider'
import { RefreshControl } from 'react-native'

const StockInProcessScreen = observer(
    ({ route, navigation }: RootStackScreenProps<'StockInProcess'>) => {
        const { id } = route.params
        const stockInStore = useStockInStore()
        const theme = useTheme()
        const [dialogVisible, setDialogVisible] = useState(false)
        const [confirmAction, setConfirmAction] = useState<
            'complete' | 'cancel' | null
        >(null)
        const [refreshing, setRefreshing] = useState(false)
        const windowWidth = Dimensions.get('window').width

        useEffect(() => {
            // Load stock in details when component mounts
            loadStockInDetails()
        }, [id])

        const loadStockInDetails = async () => {
            await stockInStore.getStockInDetails(id)
        }

        const onRefresh = useCallback(() => {
            setRefreshing(true)
            loadStockInDetails().finally(() => {
                setRefreshing(false)
            })
        }, [id])

        const handleGoBack = () => {
            navigation.goBack()
        }

        const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        }

        const handleStatusUpdate = async (
            status: 'completed' | 'cancelled'
        ) => {
            setConfirmAction(null)
            setDialogVisible(false)

            await stockInStore.updateStatus(id, status)

            // Navigate back to the stock in list after processing
            navigation.goBack()
        }

        const showConfirmDialog = (action: 'complete' | 'cancel') => {
            setConfirmAction(action)
            setDialogVisible(true)
        }

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'DRAFT':
                    return '#ff9800' // Orange
                case 'PENDING':
                    return '#2196f3' // Blue
                case 'APPROVED':
                    return '#4caf50' // Green
                case 'REJECTED':
                case 'CANCELLED':
                    return '#f44336' // Red
                default:
                    return '#757575' // Grey
            }
        }

        // Include the formatAmount function
        const formatAmount = (amount: string) => {
            return parseFloat(amount).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            })
        }

        if (stockInStore.isLoading && !refreshing) {
            return (
                <View
                    style={[
                        styles.loadingContainer,
                        { backgroundColor: theme.theme.colors.background },
                    ]}
                >
                    <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>
                        Loading stock in details...
                    </Text>
                </View>
            )
        }

        if (!stockInStore.selectedStockIn) {
            return (
                <View
                    style={[
                        styles.errorContainer,
                        { backgroundColor: theme.theme.colors.background },
                    ]}
                >
                    <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
                    <Text>Stock in record not found</Text>
                    <Button
                        mode="contained"
                        onPress={handleGoBack}
                        style={styles.errorButton}
                    >
                        Go Back
                    </Button>
                </View>
            )
        }

        const { selectedStockIn } = stockInStore
        const isProcessable = ['DRAFT', 'PENDING'].includes(
            selectedStockIn.status
        )

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.theme.colors.background,
                }}
            >
                <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
                <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={handleGoBack} />
                        <Appbar.Content
                            title="Process Stock In"
                            subtitle={selectedStockIn.code}
                        />
                    </Appbar.Header>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.theme.colors.primary]}
                            />
                        }
                    >
                        {/* Status Card */}
                        <Surface style={styles.statusCard} elevation={2}>
                            <View style={styles.statusContainer}>
                                <Text variant="bodyMedium">Status:</Text>
                                <Chip
                                    style={{
                                        backgroundColor: getStatusColor(
                                            selectedStockIn.status
                                        ),
                                    }}
                                    textStyle={{ color: 'white' }}
                                >
                                    {selectedStockIn.status}
                                </Chip>
                            </View>
                        </Surface>

                        {/* Header Section */}
                        <Card style={styles.headerCard}>
                            <Card.Content>
                                <View style={styles.headerRow}>
                                    <Text variant="titleLarge">
                                        {selectedStockIn.code}
                                    </Text>
                                    <Text variant="bodyMedium">
                                        Date:{' '}
                                        {formatDate(selectedStockIn.inDate)}
                                    </Text>
                                </View>

                                <Divider style={styles.divider} />

                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Supplier:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.supplier?.name ||
                                                'N/A'}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Lot Number:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.lotNumber || 'N/A'}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Total Amount:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            $
                                            {formatAmount(
                                                selectedStockIn.totalAmount
                                            )}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Items Count:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.details.length}
                                        </Text>
                                    </View>
                                </View>

                                {selectedStockIn.description && (
                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Description:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.description}
                                        </Text>
                                    </View>
                                )}

                                {selectedStockIn.notes && (
                                    <>
                                        <Divider style={styles.divider} />
                                        <View>
                                            <Text
                                                variant="bodySmall"
                                                style={styles.infoLabel}
                                            >
                                                Notes:
                                            </Text>
                                            <Text variant="bodyMedium">
                                                {selectedStockIn.notes}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </Card.Content>
                        </Card>

                        {/* Products Table */}
                        <Card style={styles.productsCard}>
                            <Card.Content>
                                <Text
                                    variant="titleMedium"
                                    style={styles.sectionTitle}
                                >
                                    Items
                                </Text>

                                {/* Horizontal scroll wrapper for the table */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={true}
                                >
                                    <View
                                        style={{
                                            width: Math.max(
                                                windowWidth - 48,
                                                650
                                            ),
                                        }}
                                    >
                                        <DataTable>
                                            <DataTable.Header>
                                                <DataTable.Title
                                                    style={styles.idColumn}
                                                >
                                                    ID
                                                </DataTable.Title>
                                                <DataTable.Title
                                                    style={
                                                        styles.productNameColumn
                                                    }
                                                >
                                                    Item
                                                </DataTable.Title>
                                                <DataTable.Title
                                                    numeric
                                                    style={
                                                        styles.quantityColumn
                                                    }
                                                >
                                                    Qty
                                                </DataTable.Title>
                                                <DataTable.Title
                                                    numeric
                                                    style={styles.priceColumn}
                                                >
                                                    Price
                                                </DataTable.Title>
                                                <DataTable.Title
                                                    numeric
                                                    style={
                                                        styles.subtotalColumn
                                                    }
                                                >
                                                    Subtotal
                                                </DataTable.Title>
                                            </DataTable.Header>

                                            {selectedStockIn.details.map(
                                                (detail, index) => (
                                                    <DataTable.Row
                                                        key={detail.id || index}
                                                    >
                                                        <DataTable.Cell
                                                            style={
                                                                styles.idColumn
                                                            }
                                                        >
                                                            {detail.goodsId.substring(
                                                                0,
                                                                8
                                                            )}
                                                            ...
                                                        </DataTable.Cell>
                                                        <DataTable.Cell
                                                            style={
                                                                styles.productNameColumn
                                                            }
                                                        >
                                                            {detail.goods
                                                                ?.name ||
                                                                `Item #${
                                                                    index + 1
                                                                }`}
                                                        </DataTable.Cell>
                                                        <DataTable.Cell
                                                            numeric
                                                            style={
                                                                styles.quantityColumn
                                                            }
                                                        >
                                                            {detail.quantity}
                                                        </DataTable.Cell>
                                                        <DataTable.Cell
                                                            numeric
                                                            style={
                                                                styles.priceColumn
                                                            }
                                                        >
                                                            $
                                                            {formatAmount(
                                                                detail.price
                                                            )}
                                                        </DataTable.Cell>
                                                        <DataTable.Cell
                                                            numeric
                                                            style={
                                                                styles.subtotalColumn
                                                            }
                                                        >
                                                            $
                                                            {formatAmount(
                                                                String(
                                                                    parseFloat(
                                                                        detail.price
                                                                    ) *
                                                                        detail.quantity
                                                                )
                                                            )}
                                                        </DataTable.Cell>
                                                    </DataTable.Row>
                                                )
                                            )}

                                            <DataTable.Row
                                                style={styles.totalRow}
                                            >
                                                <DataTable.Cell
                                                    style={[
                                                        styles.idColumn,
                                                        styles.totalLabelContainer,
                                                    ]}
                                                >
                                                    <Text
                                                        style={
                                                            styles.totalLabel
                                                        }
                                                    >
                                                        Total
                                                    </Text>
                                                </DataTable.Cell>
                                                <DataTable.Cell
                                                    style={
                                                        styles.productNameColumn
                                                    }
                                                ></DataTable.Cell>
                                                <DataTable.Cell
                                                    style={
                                                        styles.quantityColumn
                                                    }
                                                ></DataTable.Cell>
                                                <DataTable.Cell
                                                    style={styles.priceColumn}
                                                ></DataTable.Cell>
                                                <DataTable.Cell
                                                    numeric
                                                    style={
                                                        styles.subtotalColumn
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.totalValue
                                                        }
                                                    >
                                                        $
                                                        {formatAmount(
                                                            selectedStockIn.totalAmount
                                                        )}
                                                    </Text>
                                                </DataTable.Cell>
                                            </DataTable.Row>
                                        </DataTable>
                                    </View>
                                </ScrollView>
                            </Card.Content>
                        </Card>

                        {/* Action Buttons */}
                        {isProcessable && (
                            <View style={styles.actionsContainer}>
                                <Button
                                    mode="outlined"
                                    icon="close"
                                    onPress={() => showConfirmDialog('cancel')}
                                    style={[
                                        styles.actionButton,
                                        styles.cancelButton,
                                    ]}
                                >
                                    Cancel Stock In
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="check"
                                    onPress={() =>
                                        showConfirmDialog('complete')
                                    }
                                    style={styles.actionButton}
                                >
                                    Complete Stock In
                                </Button>
                            </View>
                        )}
                    </ScrollView>

                    {/* Quick Action Buttons */}
                    {isProcessable && (
                        <View style={styles.quickActionsContainer}>
                            <IconButton
                                icon="close"
                                size={24}
                                mode="contained"
                                containerColor="#f44336"
                                iconColor="white"
                                onPress={() => showConfirmDialog('cancel')}
                            />
                            <IconButton
                                icon="check"
                                size={24}
                                mode="contained"
                                containerColor="#4caf50"
                                iconColor="white"
                                onPress={() => showConfirmDialog('complete')}
                            />
                        </View>
                    )}

                    {/* Confirmation Dialog */}
                    <Portal>
                        <Dialog
                            visible={dialogVisible}
                            onDismiss={() => setDialogVisible(false)}
                        >
                            <Dialog.Title>
                                {confirmAction === 'complete'
                                    ? 'Complete Stock In'
                                    : 'Cancel Stock In'}
                            </Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>
                                    {confirmAction === 'complete'
                                        ? 'Are you sure you want to mark this stock in as completed? This will update inventory levels accordingly.'
                                        : 'Are you sure you want to cancel this stock in? This action cannot be undone.'}
                                </Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => setDialogVisible(false)}>
                                    No
                                </Button>
                                <Button
                                    onPress={() =>
                                        handleStatusUpdate(
                                            confirmAction === 'complete'
                                                ? 'completed'
                                                : 'cancelled'
                                        )
                                    }
                                >
                                    Yes
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </SafeAreaView>
            </View>
        )
    }
)

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 80, // Extra space for bottom actions
    },
    statusCard: {
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerCard: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    headerRow: {
        marginBottom: 8,
    },
    divider: {
        marginVertical: 12,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    infoItem: {
        width: '50%',
        marginBottom: 12,
        paddingRight: 8,
    },
    infoLabel: {
        color: '#757575',
        marginBottom: 2,
    },
    productsCard: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    idColumn: {
        flex: 2,
    },
    productNameColumn: {
        flex: 4,
    },
    quantityColumn: {
        flex: 1,
    },
    priceColumn: {
        flex: 2,
    },
    subtotalColumn: {
        flex: 2,
    },
    totalLabelContainer: {
        justifyContent: 'center',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalLabel: {
        fontWeight: 'bold',
    },
    totalValue: {
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    cancelButton: {
        borderColor: '#f44336',
    },
    quickActionsContainer: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        flexDirection: 'row',
        gap: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorButton: {
        marginTop: 16,
    },
})

export default withProviders(StockInStoreProvider)(StockInProcessScreen)

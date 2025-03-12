import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, FlatList } from 'react-native'
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
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    RootScreenNavigationProp,
    RootStackScreenProps,
} from 'src/Core/Presentation/Navigation/Types/Index'
import { StatusBar } from 'expo-status-bar'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { withProviders } from 'src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { useTheme } from 'src/Core/Presentation/Theme/ThemeProvider'
import { StockInProductItem } from '../../Domain/Entities/StockInGoodItem'

const StockInProcessScreen = observer(
    ({ route, navigation }: RootStackScreenProps<'StockInProcess'>) => {
        const { id } = route.params
        const stockInStore = useStockInStore()
        const theme = useTheme()
        const [dialogVisible, setDialogVisible] = useState(false)
        const [confirmAction, setConfirmAction] = useState<
            'complete' | 'cancel' | null
        >(null)

        useEffect(() => {
            // Load stock in details when component mounts
            loadStockInDetails()
        }, [id])

        const loadStockInDetails = async () => {
            await stockInStore.getStockInDetails(id)
        }

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

        const renderProductItem = ({ item }: { item: StockInProductItem }) => (
            <DataTable.Row>
                <DataTable.Cell>{item.productId}</DataTable.Cell>
                <DataTable.Cell style={styles.productNameCell}>
                    {item.productName}
                </DataTable.Cell>
                <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                <DataTable.Cell>{item.unit}</DataTable.Cell>
                <DataTable.Cell numeric>
                    {item.price ? `$${item.price.toFixed(2)}` : '-'}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                    {item.price
                        ? `$${(item.price * item.quantity).toFixed(2)}`
                        : '-'}
                </DataTable.Cell>
            </DataTable.Row>
        )

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'pending':
                    return '#ff9800' // Orange
                case 'processing':
                    return '#2196f3' // Blue
                case 'completed':
                    return '#4caf50' // Green
                case 'cancelled':
                    return '#f44336' // Red
                default:
                    return '#757575' // Grey
            }
        }

        // Calculate total value of the stock in
        const calculateTotal = () => {
            if (!stockInStore.selectedStockIn?.products) return 0

            return stockInStore.selectedStockIn.products.reduce(
                (sum, product) => {
                    return sum + (product.price || 0) * product.quantity
                },
                0
            )
        }

        if (stockInStore.isLoading) {
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
        const isProcessable =
            selectedStockIn.status === 'pending' ||
            selectedStockIn.status === 'processing'

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
                            subtitle={selectedStockIn.reference}
                        />
                    </Appbar.Header>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Header Section */}
                        <Card style={styles.headerCard}>
                            <Card.Content>
                                <View style={styles.headerRow}>
                                    <View>
                                        <Text variant="titleLarge">
                                            {selectedStockIn.reference}
                                        </Text>
                                        <Text variant="bodyMedium">
                                            Date:{' '}
                                            {formatDate(selectedStockIn.date)}
                                        </Text>
                                    </View>
                                    <Chip
                                        style={{
                                            backgroundColor: getStatusColor(
                                                selectedStockIn.status
                                            ),
                                        }}
                                        textStyle={{ color: 'white' }}
                                    >
                                        {selectedStockIn.status.toUpperCase()}
                                    </Chip>
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
                                            {selectedStockIn.supplierName ||
                                                'N/A'}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Invoice Ref:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.supplierInvoice ||
                                                'N/A'}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Received By:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.receivedBy}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Total Items:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedStockIn.totalItems}
                                        </Text>
                                    </View>
                                </View>

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
                                    Products
                                </Text>

                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title>ID</DataTable.Title>
                                        <DataTable.Title
                                            style={styles.productNameCell}
                                        >
                                            Product
                                        </DataTable.Title>
                                        <DataTable.Title numeric>
                                            Qty
                                        </DataTable.Title>
                                        <DataTable.Title>Unit</DataTable.Title>
                                        <DataTable.Title numeric>
                                            Price
                                        </DataTable.Title>
                                        <DataTable.Title numeric>
                                            Subtotal
                                        </DataTable.Title>
                                    </DataTable.Header>

                                    {selectedStockIn.products.map(
                                        (product, index) => (
                                            <DataTable.Row key={index}>
                                                <DataTable.Cell>
                                                    {product.productId}
                                                </DataTable.Cell>
                                                <DataTable.Cell
                                                    style={
                                                        styles.productNameCell
                                                    }
                                                >
                                                    {product.productName}
                                                </DataTable.Cell>
                                                <DataTable.Cell numeric>
                                                    {product.quantity}
                                                </DataTable.Cell>
                                                <DataTable.Cell>
                                                    {product.unit}
                                                </DataTable.Cell>
                                                <DataTable.Cell numeric>
                                                    {product.price
                                                        ? `$${product.price.toFixed(
                                                              2
                                                          )}`
                                                        : '-'}
                                                </DataTable.Cell>
                                                <DataTable.Cell numeric>
                                                    {product.price
                                                        ? `$${(
                                                              product.price *
                                                              product.quantity
                                                          ).toFixed(2)}`
                                                        : '-'}
                                                </DataTable.Cell>
                                            </DataTable.Row>
                                        )
                                    )}

                                    <DataTable.Row style={styles.totalRow}>
                                        <DataTable.Cell
                                            style={styles.productNameCell}
                                            colSpan={4}
                                        >
                                            <Text
                                                variant="bodyMedium"
                                                style={styles.totalLabel}
                                            >
                                                Total
                                            </Text>
                                        </DataTable.Cell>
                                        <DataTable.Cell
                                            numeric
                                        ></DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <Text
                                                variant="bodyLarge"
                                                style={styles.totalValue}
                                            >
                                                ${calculateTotal().toFixed(2)}
                                            </Text>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                </DataTable>
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
        paddingBottom: 32,
    },
    headerCard: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
    },
    infoLabel: {
        color: '#757575',
        marginBottom: 2,
    },
    productsCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    productNameCell: {
        flex: 3,
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

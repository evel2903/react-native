import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
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
    TextInput,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    RootScreenNavigationProp,
    RootStackScreenProps,
} from '@/src/Core/Presentation/Navigation/Types/Index'
import { StatusBar } from 'expo-status-bar'
import { observer } from 'mobx-react'
import { useInventoryStore } from '../Stores/InventoryStore/UseInventoryStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { InventoryStoreProvider } from '../Stores/InventoryStore/InventoryStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { InventoryProductItem } from '../../Domain/Entities/InventoryProductItem'

// Note: This screen would need to be added to the navigation stack in src/Core/Presentation/Navigation

const InventoryProcessScreen = observer(
    ({ route, navigation }: RootStackScreenProps<'InventoryProcess'>) => {
        const { id } = route.params
        const inventoryStore = useInventoryStore()
        const theme = useTheme()
        const [dialogVisible, setDialogVisible] = useState(false)
        const [confirmAction, setConfirmAction] = useState<
            'complete' | 'cancel' | null
        >(null)

        // Additional state for editing product quantities (for an actual implementation)
        const [editingProduct, setEditingProduct] = useState<string | null>(null)

        useEffect(() => {
            // Load inventory record details when component mounts
            loadInventoryRecordDetails()
        }, [id])

        const loadInventoryRecordDetails = async () => {
            await inventoryStore.getInventoryRecordDetails(id)
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

            await inventoryStore.updateStatus(id, status)

            // Navigate back to the inventory list after processing
            navigation.goBack()
        }

        const showConfirmDialog = (action: 'complete' | 'cancel') => {
            setConfirmAction(action)
            setDialogVisible(true)
        }

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'pending':
                    return '#ff9800' // Orange
                case 'in-progress':
                    return '#2196f3' // Blue
                case 'completed':
                    return '#4caf50' // Green
                case 'cancelled':
                    return '#f44336' // Red
                default:
                    return '#757575' // Grey
            }
        }

        const getDiscrepancyColor = (discrepancy: number) => {
            if (discrepancy === 0) return '#4caf50' // Green for match
            if (discrepancy > 0) return '#2196f3' // Blue for excess
            return '#f44336' // Red for shortage
        }

        const handleEditActualQuantity = (productId: string) => {
            setEditingProduct(productId)
        }

        if (inventoryStore.isLoading) {
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
                        Loading inventory details...
                    </Text>
                </View>
            )
        }

        if (!inventoryStore.selectedInventoryRecord) {
            return (
                <View
                    style={[
                        styles.errorContainer,
                        { backgroundColor: theme.theme.colors.background },
                    ]}
                >
                    <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
                    <Text>Inventory record not found</Text>
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

        const { selectedInventoryRecord } = inventoryStore
        const isProcessable =
            selectedInventoryRecord.status === 'pending' ||
            selectedInventoryRecord.status === 'in-progress'

        // Calculate total discrepancy
        const totalDiscrepancy = selectedInventoryRecord.products.reduce(
            (sum, product) => sum + product.discrepancy,
            0
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
                            title="Process Inventory"
                            subtitle={selectedInventoryRecord.reference}
                        />
                    </Appbar.Header>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Header Section */}
                        <Card style={styles.headerCard}>
                            <Card.Content>
                                <View style={styles.headerRow}>
                                    <View>
                                        <Text variant="titleLarge">
                                            {selectedInventoryRecord.reference}
                                        </Text>
                                        <Text variant="bodyMedium">
                                            Date:{' '}
                                            {formatDate(selectedInventoryRecord.date)}
                                        </Text>
                                    </View>
                                    <Chip
                                        style={{
                                            backgroundColor: getStatusColor(
                                                selectedInventoryRecord.status
                                            ),
                                        }}
                                        textStyle={{ color: 'white' }}
                                    >
                                        {selectedInventoryRecord.status.toUpperCase()}
                                    </Chip>
                                </View>

                                <Divider style={styles.divider} />

                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Location:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedInventoryRecord.location ||
                                                'N/A'}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Conducted By:
                                        </Text>
                                        <Text variant="bodyMedium">
                                            {selectedInventoryRecord.conductedBy}
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
                                            {selectedInventoryRecord.totalItems}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text
                                            variant="bodySmall"
                                            style={styles.infoLabel}
                                        >
                                            Total Discrepancy:
                                        </Text>
                                        <Text
                                            variant="bodyMedium"
                                            style={{
                                                color: getDiscrepancyColor(
                                                    totalDiscrepancy
                                                ),
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {totalDiscrepancy}
                                        </Text>
                                    </View>
                                </View>

                                {selectedInventoryRecord.notes && (
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
                                                {selectedInventoryRecord.notes}
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
                                        <DataTable.Title style={styles.productNameCell}>
                                            Product
                                        </DataTable.Title>
                                        <DataTable.Title numeric>
                                            Expected
                                        </DataTable.Title>
                                        <DataTable.Title numeric>
                                            Actual
                                        </DataTable.Title>
                                        <DataTable.Title numeric>
                                            +/-
                                        </DataTable.Title>
                                    </DataTable.Header>

                                    {selectedInventoryRecord.products.map(
                                        (product, index) => (
                                            <DataTable.Row key={index}>
                                                <DataTable.Cell
                                                    style={
                                                        styles.productNameCell
                                                    }
                                                >
                                                    <Text>
                                                        {product.productName}
                                                    </Text>
                                                    <Text
                                                        variant="bodySmall"
                                                        style={styles.productIdText}
                                                    >
                                                        {product.productId}
                                                    </Text>
                                                </DataTable.Cell>
                                                <DataTable.Cell numeric>
                                                    {product.expectedQuantity}
                                                </DataTable.Cell>
                                                <DataTable.Cell numeric>
                                                    {editingProduct === product.productId ? (
                                                        <TextInput
                                                            value={product.actualQuantity.toString()}
                                                            keyboardType="numeric"
                                                            style={styles.quantityInput}
                                                            // In a real implementation, this would update the actual quantity
                                                            // onChangeText={text => updateActualQuantity(product.productId, text)}
                                                        />
                                                    ) : (
                                                        <Text
                                                            onPress={() => isProcessable && handleEditActualQuantity(product.productId)}
                                                            style={isProcessable ? styles.editableText : undefined}
                                                        >
                                                            {product.actualQuantity}
                                                        </Text>
                                                    )}
                                                </DataTable.Cell>
                                                <DataTable.Cell numeric>
                                                    <Text
                                                        style={{
                                                            color: getDiscrepancyColor(
                                                                product.discrepancy
                                                            ),
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {product.discrepancy > 0 ? '+' : ''}
                                                        {product.discrepancy}
                                                    </Text>
                                                </DataTable.Cell>
                                            </DataTable.Row>
                                        )
                                    )}
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
                                    Cancel Inventory
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="check"
                                    onPress={() =>
                                        showConfirmDialog('complete')
                                    }
                                    style={styles.actionButton}
                                >
                                    Complete Inventory
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
                                    ? 'Complete Inventory'
                                    : 'Cancel Inventory'}
                            </Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>
                                    {confirmAction === 'complete'
                                        ? 'Are you sure you want to mark this inventory as completed? This will finalize all inventory counts.'
                                        : 'Are you sure you want to cancel this inventory? This action cannot be undone.'}
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
    productIdText: {
        color: '#757575',
    },
    quantityInput: {
        height: 32,
        width: 60,
        fontSize: 14,
        padding: 0,
    },
    editableText: {
        textDecorationLine: 'underline',
        color: '#2196f3',
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

export default withProviders(InventoryStoreProvider)(InventoryProcessScreen)
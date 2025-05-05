import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    TextInput,
    Button,
    Text,
    HelperText,
    Menu,
    Dialog,
    Portal,
    ActivityIndicator,
    Divider,
} from 'react-native-paper'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'

interface StockInFormProps {
    onCancel: () => void
}

const StockInForm = observer(({ onCancel }: StockInFormProps) => {
    const stockInStore = useStockInStore()
    const masterDataStore = useMasterDataStore()

    const [unitMenuVisible, setUnitMenuVisible] = useState(false)
    const [statusMenuVisible, setStatusMenuVisible] = useState(false)
    const [supplierMenuVisible, setSupplierMenuVisible] = useState(false)
    const [goodsMenuVisible, setGoodsMenuVisible] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [dialogVisible, setDialogVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Load master data when component mounts
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                await Promise.all([
                    masterDataStore.loadUnits(),
                    masterDataStore.loadSuppliers(),
                    masterDataStore.loadGoods(),
                ])
            } catch (error) {
                console.error('Error loading master data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [masterDataStore])

    const statusOptions = [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PENDING', label: 'Pending' },
    ]

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!stockInStore.formData.productId) {
            newErrors.productId = 'Product is required'
        }

        if (
            !stockInStore.formData.quantity ||
            stockInStore.formData.quantity <= 0
        ) {
            newErrors.quantity = 'Quantity must be greater than 0'
        }

        if (!stockInStore.formData.unit) {
            newErrors.unit = 'Unit is required'
        }

        if (!stockInStore.formData.receivedBy) {
            newErrors.receivedBy = 'Received by is required'
        }

        if (!stockInStore.formData.supplierName) {
            newErrors.supplierName = 'Supplier is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        const result = await stockInStore.createStockIn()
        if (result) {
            setDialogVisible(true)
        }
    }

    const updateField = (
        field: keyof CreateStockInPayload,
        value: string | number
    ) => {
        stockInStore.updateFormData({
            [field]: value,
        } as Partial<CreateStockInPayload>)

        // Clear error for this field if it exists
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' })
        }
    }

    const selectGoods = (goodsId: string) => {
        const goods = masterDataStore.getGoodsById(goodsId)
        if (goods) {
            updateField('productId', goods.id)
            updateField('productName', goods.name)

            // Set the unit based on the goods unit if available
            if (goods.unit) {
                const unit = masterDataStore.units.data.find(
                    u => u.name === goods.unit?.name
                )
                if (unit) {
                    updateField('unit', unit.name)
                }
            }
        }
        setGoodsMenuVisible(false)
    }

    const selectSupplier = (supplierId: string) => {
        const supplier = masterDataStore.getSupplierById(supplierId)
        if (supplier) {
            updateField('supplierName', supplier.name)
        }
        setSupplierMenuVisible(false)
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading master data...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text variant="titleLarge" style={styles.title}>
                    Create Stock In Record
                </Text>

                {/* Product/Goods selection */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Product Information
                </Text>
                <Menu
                    visible={goodsMenuVisible}
                    onDismiss={() => setGoodsMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setGoodsMenuVisible(true)}
                            style={styles.selectButton}
                            icon="package-variant"
                        >
                            {stockInStore.formData.productName ||
                                'Select Product'}
                        </Button>
                    }
                    style={styles.menuContainer}
                >
                    <ScrollView style={styles.menuScrollView}>
                        {masterDataStore.goods.data
                            .filter(item => item.isActive && !item.isDeleted)
                            .map(goods => (
                                <Menu.Item
                                    key={goods.id}
                                    onPress={() => selectGoods(goods.id)}
                                    title={`${goods.name} (${goods.code})`}
                                />
                            ))}
                    </ScrollView>
                </Menu>
                {errors.productId && (
                    <HelperText type="error">{errors.productId}</HelperText>
                )}

                <View style={styles.row}>
                    <View style={styles.quantityContainer}>
                        <TextInput
                            label="Quantity *"
                            value={stockInStore.formData.quantity.toString()}
                            onChangeText={text => {
                                const num = parseFloat(text)
                                updateField('quantity', isNaN(num) ? 0 : num)
                            }}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.quantityInput}
                            error={!!errors.quantity}
                        />
                        {errors.quantity && (
                            <HelperText type="error">
                                {errors.quantity}
                            </HelperText>
                        )}
                    </View>

                    <View style={styles.unitContainer}>
                        <Menu
                            visible={unitMenuVisible}
                            onDismiss={() => setUnitMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setUnitMenuVisible(true)}
                                    style={styles.unitButton}
                                >
                                    {stockInStore.formData.unit ||
                                        'Select Unit'}
                                </Button>
                            }
                        >
                            {masterDataStore.units.data
                                .filter(
                                    unit => unit.isActive && !unit.isDeleted
                                )
                                .map(unit => (
                                    <Menu.Item
                                        key={unit.id}
                                        onPress={() => {
                                            updateField('unit', unit.name)
                                            setUnitMenuVisible(false)
                                        }}
                                        title={unit.name}
                                    />
                                ))}
                        </Menu>
                        {errors.unit && (
                            <HelperText type="error">{errors.unit}</HelperText>
                        )}
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Supplier information */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Supplier Information
                </Text>

                <Menu
                    visible={supplierMenuVisible}
                    onDismiss={() => setSupplierMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setSupplierMenuVisible(true)}
                            style={styles.selectButton}
                            icon="truck-delivery"
                        >
                            {stockInStore.formData.supplierName ||
                                'Select Supplier'}
                        </Button>
                    }
                    style={styles.menuContainer}
                >
                    <ScrollView style={styles.menuScrollView}>
                        {masterDataStore.suppliers.data
                            .filter(
                                supplier =>
                                    supplier.isActive && !supplier.isDeleted
                            )
                            .map(supplier => (
                                <Menu.Item
                                    key={supplier.id}
                                    onPress={() => selectSupplier(supplier.id)}
                                    title={`${supplier.name} (${supplier.code})`}
                                />
                            ))}
                    </ScrollView>
                </Menu>
                {errors.supplierName && (
                    <HelperText type="error">{errors.supplierName}</HelperText>
                )}

                <TextInput
                    label="Supplier Invoice"
                    value={stockInStore.formData.supplierInvoice || ''}
                    onChangeText={text => updateField('supplierInvoice', text)}
                    mode="outlined"
                    style={styles.input}
                />

                <Divider style={styles.divider} />

                {/* Stock in details */}
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Stock In Details
                </Text>

                <TextInput
                    label="Date *"
                    value={stockInStore.formData.date}
                    onChangeText={text => updateField('date', text)}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Received By *"
                    value={stockInStore.formData.receivedBy}
                    onChangeText={text => updateField('receivedBy', text)}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.receivedBy}
                />
                {errors.receivedBy && (
                    <HelperText type="error">{errors.receivedBy}</HelperText>
                )}

                <Menu
                    visible={statusMenuVisible}
                    onDismiss={() => setStatusMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setStatusMenuVisible(true)}
                            style={styles.statusButton}
                            icon="information"
                        >
                            Status:{' '}
                            {statusOptions.find(
                                s => s.value === stockInStore.formData.status
                            )?.label || 'Draft'}
                        </Button>
                    }
                >
                    {statusOptions.map(status => (
                        <Menu.Item
                            key={status.value}
                            onPress={() => {
                                updateField('status', status.value)
                                setStatusMenuVisible(false)
                            }}
                            title={status.label}
                        />
                    ))}
                </Menu>

                <TextInput
                    label="Notes"
                    value={stockInStore.formData.notes || ''}
                    onChangeText={text => updateField('notes', text)}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                />

                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={onCancel}
                        style={styles.button}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={stockInStore.isLoading}
                        disabled={stockInStore.isLoading}
                        style={styles.button}
                    >
                        Submit
                    </Button>
                </View>
            </ScrollView>

            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                >
                    <Dialog.Title>Success</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Stock in record created successfully.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => {
                                setDialogVisible(false)
                                onCancel()
                            }}
                        >
                            OK
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    title: {
        marginBottom: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        marginBottom: 16,
        marginTop: 8,
    },
    divider: {
        marginVertical: 16,
    },
    input: {
        marginBottom: 12,
    },
    selectButton: {
        marginBottom: 12,
        justifyContent: 'flex-start',
        height: 56,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    quantityContainer: {
        flex: 2,
        marginRight: 8,
    },
    quantityInput: {
        flex: 1,
    },
    unitContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    unitButton: {
        height: 56,
        justifyContent: 'center',
    },
    statusButton: {
        marginBottom: 12,
        justifyContent: 'flex-start',
        height: 56,
    },
    menuContainer: {
        maxHeight: 300,
    },
    menuScrollView: {
        maxHeight: 250,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
})

export default withProviders(MasterDataStoreProvider)(StockInForm)

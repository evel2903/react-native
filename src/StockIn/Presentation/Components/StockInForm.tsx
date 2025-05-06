import React, { useState, useEffect, useRef } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native'
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
    Surface,
    IconButton,
} from 'react-native-paper'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'

interface StockInFormProps {
    onCancel: () => void
}

const StockInForm = observer(({ onCancel }: StockInFormProps) => {
    const stockInStore = useStockInStore()
    const masterDataStore = useMasterDataStore()
    const theme = useTheme()
    const scrollViewRef = useRef<ScrollView>(null)

    const [unitMenuVisible, setUnitMenuVisible] = useState(false)
    const [statusMenuVisible, setStatusMenuVisible] = useState(false)
    const [supplierMenuVisible, setSupplierMenuVisible] = useState(false)
    const [goodsMenuVisible, setGoodsMenuVisible] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [dialogVisible, setDialogVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [currentFocusedField, setCurrentFocusedField] = useState<
        string | null
    >(null)

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

    // Set up keyboard dismiss on tap outside
    const dismissKeyboard = () => {
        Keyboard.dismiss()
        setCurrentFocusedField(null)
    }

    // Handle scroll to focused input
    const handleFocus = (fieldName: string) => {
        setCurrentFocusedField(fieldName)

        // Add a small delay to ensure the keyboard is shown before scrolling
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: getScrollPosition(fieldName),
                animated: true,
            })
        }, 100)
    }

    // Get appropriate scroll position based on field name
    const getScrollPosition = (fieldName: string): number => {
        // These values should be adjusted based on your actual UI layout
        switch (fieldName) {
            case 'quantity':
                return 120
            case 'unit':
                return 170
            case 'supplier':
                return 250
            case 'invoice':
                return 300
            case 'date':
                return 350
            case 'receivedBy':
                return 400
            case 'notes':
                return 500
            default:
                return 0
        }
    }

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
        dismissKeyboard()

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
            <View
                style={[
                    styles.loadingContainer,
                    { backgroundColor: theme.theme.colors.background },
                ]}
            >
                <ActivityIndicator
                    size="large"
                    color={theme.theme.colors.primary}
                />
                <Text style={styles.loadingText}>Loading master data...</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[
                styles.container,
                { backgroundColor: theme.theme.colors.background },
            ]}
        >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.innerContainer}>
                    <Surface style={styles.headerContainer} elevation={2}>
                        <Text variant="titleLarge" style={styles.title}>
                            Create Stock In Record
                        </Text>
                        <IconButton icon="close" size={24} onPress={onCancel} />
                    </Surface>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
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
                                    onPress={() => {
                                        dismissKeyboard()
                                        setGoodsMenuVisible(true)
                                    }}
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
                                    .filter(
                                        item => item.isActive && !item.isDeleted
                                    )
                                    .map(goods => (
                                        <Menu.Item
                                            key={goods.id}
                                            onPress={() =>
                                                selectGoods(goods.id)
                                            }
                                            title={`${goods.name} (${goods.code})`}
                                        />
                                    ))}
                            </ScrollView>
                        </Menu>
                        {errors.productId && (
                            <HelperText type="error">
                                {errors.productId}
                            </HelperText>
                        )}

                        <View style={styles.row}>
                            <View style={styles.quantityContainer}>
                                <TextInput dense
                                    label="Quantity *"
                                    value={stockInStore.formData.quantity.toString()}
                                    onChangeText={text => {
                                        const num = parseFloat(text)
                                        updateField(
                                            'quantity',
                                            isNaN(num) ? 0 : num
                                        )
                                    }}
                                    keyboardType="numeric"
                                    mode="outlined"
                                    style={styles.quantityInput}
                                    error={!!errors.quantity}
                                    onFocus={() => handleFocus('quantity')}
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
                                            onPress={() => {
                                                dismissKeyboard()
                                                setUnitMenuVisible(true)
                                                handleFocus('unit')
                                            }}
                                            style={styles.unitButton}
                                        >
                                            {stockInStore.formData.unit ||
                                                'Select Unit'}
                                        </Button>
                                    }
                                >
                                    {masterDataStore.units.data
                                        .filter(
                                            unit =>
                                                unit.isActive && !unit.isDeleted
                                        )
                                        .map(unit => (
                                            <Menu.Item
                                                key={unit.id}
                                                onPress={() => {
                                                    updateField(
                                                        'unit',
                                                        unit.name
                                                    )
                                                    setUnitMenuVisible(false)
                                                }}
                                                title={unit.name}
                                            />
                                        ))}
                                </Menu>
                                {errors.unit && (
                                    <HelperText type="error">
                                        {errors.unit}
                                    </HelperText>
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
                                    onPress={() => {
                                        dismissKeyboard()
                                        setSupplierMenuVisible(true)
                                        handleFocus('supplier')
                                    }}
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
                                            supplier.isActive &&
                                            !supplier.isDeleted
                                    )
                                    .map(supplier => (
                                        <Menu.Item
                                            key={supplier.id}
                                            onPress={() =>
                                                selectSupplier(supplier.id)
                                            }
                                            title={`${supplier.name} (${supplier.code})`}
                                        />
                                    ))}
                            </ScrollView>
                        </Menu>
                        {errors.supplierName && (
                            <HelperText type="error">
                                {errors.supplierName}
                            </HelperText>
                        )}

                        <TextInput dense
                            label="Supplier Invoice"
                            value={stockInStore.formData.supplierInvoice || ''}
                            onChangeText={text =>
                                updateField('supplierInvoice', text)
                            }
                            mode="outlined"
                            style={styles.input}
                            onFocus={() => handleFocus('invoice')}
                        />

                        <Divider style={styles.divider} />

                        {/* Stock in details */}
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Stock In Details
                        </Text>

                        <TextInput dense
                            label="Date *"
                            value={stockInStore.formData.date}
                            onChangeText={text => updateField('date', text)}
                            mode="outlined"
                            style={styles.input}
                            onFocus={() => handleFocus('date')}
                            placeholder="YYYY-MM-DD"
                        />

                        <TextInput dense
                            label="Received By *"
                            value={stockInStore.formData.receivedBy}
                            onChangeText={text =>
                                updateField('receivedBy', text)
                            }
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.receivedBy}
                            onFocus={() => handleFocus('receivedBy')}
                        />
                        {errors.receivedBy && (
                            <HelperText type="error">
                                {errors.receivedBy}
                            </HelperText>
                        )}

                        <Menu
                            visible={statusMenuVisible}
                            onDismiss={() => setStatusMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        dismissKeyboard()
                                        setStatusMenuVisible(true)
                                    }}
                                    style={styles.statusButton}
                                    icon="information"
                                >
                                    Status:{' '}
                                    {statusOptions.find(
                                        s =>
                                            s.value ===
                                            stockInStore.formData.status
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

                        <TextInput dense
                            label="Notes"
                            value={stockInStore.formData.notes || ''}
                            onChangeText={text => updateField('notes', text)}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            style={styles.textArea}
                            onFocus={() => handleFocus('notes')}
                        />

                        {/* Add some padding at the bottom to ensure visibility when keyboard is open */}
                        <View style={styles.bottomPadding} />
                    </ScrollView>

                    <Surface style={styles.footer} elevation={4}>
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
                    </Surface>

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
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    title: {
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
    textArea: {
        marginBottom: 12,
        height: 100,
    },
    menuContainer: {
        maxHeight: 300,
    },
    menuScrollView: {
        maxHeight: 250,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
    bottomPadding: {
        height: 100,
    },
})

export default withProviders(MasterDataStoreProvider)(StockInForm)

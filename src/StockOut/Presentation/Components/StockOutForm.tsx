// src/StockOut/Presentation/Components/StockOutForm.tsx
import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    TextInput,
    Button,
    Text,
    HelperText,
    Menu,
    Dialog,
    Portal,
    IconButton,
    Card,
    Divider,
} from 'react-native-paper'
import { observer } from 'mobx-react'
import { useStockOutStore } from '../Stores/StockOutStore/UseStockOutStore'
import { StockOutProductItem } from '../../Domain/Entities/StockOutProductItem'

interface StockOutFormProps {
    onCancel: () => void
}

const StockOutForm = observer(({ onCancel }: StockOutFormProps) => {
    const stockOutStore = useStockOutStore()
    const [unitMenuVisible, setUnitMenuVisible] = useState<number | null>(null)
    const [statusMenuVisible, setStatusMenuVisible] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [productErrors, setProductErrors] = useState<
        Record<string, Record<string, string>>
    >({})
    const [dialogVisible, setDialogVisible] = useState(false)

    const unitOptions = ['pc', 'kg', 'liter', 'box', 'carton', 'pallet']
    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ]

    const validateProduct = (
        product: StockOutProductItem,
        index: number
    ): boolean => {
        const newErrors: Record<string, string> = {}

        if (!product.productId) {
            newErrors.productId = 'Product ID is required'
        }

        if (!product.productName) {
            newErrors.productName = 'Product name is required'
        }

        if (!product.quantity || product.quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0'
        }

        if (!product.unit) {
            newErrors.unit = 'Unit is required'
        }

        setProductErrors(prev => ({
            ...prev,
            [index]: newErrors,
        }))

        return Object.keys(newErrors).length === 0
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        let isValid = true

        if (!stockOutStore.formData.issuedBy) {
            newErrors.issuedBy = 'Issued by is required'
            isValid = false
        }

        if (!stockOutStore.formData.issuedTo) {
            newErrors.issuedTo = 'Issued to is required'
            isValid = false
        }

        // Validate all products
        stockOutStore.formData.products.forEach((product, index) => {
            if (!validateProduct(product, index)) {
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        const result = await stockOutStore.createStockOut()
        if (result) {
            setDialogVisible(true)
        }
    }

    const updateField = (field: string, value: string | number) => {
        stockOutStore.updateFormData({
            [field]: value,
        } as any)

        // Clear error for this field if it exists
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' })
        }
    }

    const updateProductField = (
        index: number,
        field: string,
        value: string | number
    ) => {
        stockOutStore.updateProduct(index, {
            [field]: value,
        } as any)

        // Clear error for this field if it exists
        if (productErrors[index]?.[field]) {
            setProductErrors(prev => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    [field]: '',
                },
            }))
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text variant="titleLarge" style={styles.title}>
                    Create Stock Out Record
                </Text>

                {/* Products Section */}
                <Card style={styles.productsCard}>
                    <Card.Title
                        title="Products"
                        right={props => (
                            <IconButton
                                {...props}
                                icon="plus"
                                onPress={() => stockOutStore.addProduct()}
                            />
                        )}
                    />
                    <Card.Content>
                        {stockOutStore.formData.products.map(
                            (product, index) => (
                                <View
                                    key={index}
                                    style={styles.productContainer}
                                >
                                    <View style={styles.productHeader}>
                                        <Text variant="titleMedium">
                                            Product {index + 1}
                                        </Text>
                                        {stockOutStore.formData.products
                                            .length > 1 && (
                                            <IconButton
                                                icon="delete"
                                                size={20}
                                                onPress={() =>
                                                    stockOutStore.removeProduct(
                                                        index
                                                    )
                                                }
                                            />
                                        )}
                                    </View>

                                    <TextInput
                                        label="Product ID *"
                                        value={product.productId}
                                        onChangeText={text =>
                                            updateProductField(
                                                index,
                                                'productId',
                                                text
                                            )
                                        }
                                        mode="outlined"
                                        style={styles.input}
                                        error={
                                            !!productErrors[index]?.productId
                                        }
                                    />
                                    {productErrors[index]?.productId && (
                                        <HelperText type="error">
                                            {productErrors[index].productId}
                                        </HelperText>
                                    )}

                                    <TextInput
                                        label="Product Name *"
                                        value={product.productName}
                                        onChangeText={text =>
                                            updateProductField(
                                                index,
                                                'productName',
                                                text
                                            )
                                        }
                                        mode="outlined"
                                        style={styles.input}
                                        error={
                                            !!productErrors[index]?.productName
                                        }
                                    />
                                    {productErrors[index]?.productName && (
                                        <HelperText type="error">
                                            {productErrors[index].productName}
                                        </HelperText>
                                    )}

                                    <View style={styles.row}>
                                        <View style={styles.quantityContainer}>
                                            <TextInput
                                                label="Quantity *"
                                                value={product.quantity.toString()}
                                                onChangeText={text => {
                                                    const num = parseFloat(text)
                                                    updateProductField(
                                                        index,
                                                        'quantity',
                                                        isNaN(num) ? 0 : num
                                                    )
                                                }}
                                                keyboardType="numeric"
                                                mode="outlined"
                                                style={styles.quantityInput}
                                                error={
                                                    !!productErrors[index]
                                                        ?.quantity
                                                }
                                            />
                                            {productErrors[index]?.quantity && (
                                                <HelperText type="error">
                                                    {
                                                        productErrors[index]
                                                            .quantity
                                                    }
                                                </HelperText>
                                            )}
                                        </View>

                                        <View style={styles.unitContainer}>
                                            <Menu
                                                visible={
                                                    unitMenuVisible === index
                                                }
                                                onDismiss={() =>
                                                    setUnitMenuVisible(null)
                                                }
                                                anchor={
                                                    <Button
                                                        mode="outlined"
                                                        onPress={() =>
                                                            setUnitMenuVisible(
                                                                index
                                                            )
                                                        }
                                                        style={
                                                            styles.unitButton
                                                        }
                                                    >
                                                        {product.unit ||
                                                            'Select Unit'}
                                                    </Button>
                                                }
                                            >
                                                {unitOptions.map(unit => (
                                                    <Menu.Item
                                                        key={unit}
                                                        onPress={() => {
                                                            updateProductField(
                                                                index,
                                                                'unit',
                                                                unit
                                                            )
                                                            setUnitMenuVisible(
                                                                null
                                                            )
                                                        }}
                                                        title={unit}
                                                    />
                                                ))}
                                            </Menu>
                                        </View>
                                    </View>

                                    <TextInput
                                        label="Price (optional)"
                                        value={product.price?.toString() || ''}
                                        onChangeText={text => {
                                            const num = parseFloat(text)
                                            updateProductField(
                                                index,
                                                'price',
                                                isNaN(num) ? undefined : num
                                            )
                                        }}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.input}
                                    />

                                    {index <
                                        stockOutStore.formData.products.length -
                                            1 && (
                                        <Divider style={styles.divider} />
                                    )}
                                </View>
                            )
                        )}
                    </Card.Content>
                </Card>

                {/* General Information */}
                <Card style={styles.infoCard}>
                    <Card.Title title="General Information" />
                    <Card.Content>
                        <TextInput
                            label="Date *"
                            value={stockOutStore.formData.date}
                            onChangeText={text => updateField('date', text)}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Issued By *"
                            value={stockOutStore.formData.issuedBy}
                            onChangeText={text => updateField('issuedBy', text)}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.issuedBy}
                        />
                        {errors.issuedBy && (
                            <HelperText type="error">
                                {errors.issuedBy}
                            </HelperText>
                        )}

                        <TextInput
                            label="Issued To *"
                            value={stockOutStore.formData.issuedTo}
                            onChangeText={text => updateField('issuedTo', text)}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.issuedTo}
                        />
                        {errors.issuedTo && (
                            <HelperText type="error">
                                {errors.issuedTo}
                            </HelperText>
                        )}

                        <TextInput
                            label="Reason"
                            value={stockOutStore.formData.reason || ''}
                            onChangeText={text => updateField('reason', text)}
                            mode="outlined"
                            style={styles.input}
                        />

                        <Menu
                            visible={statusMenuVisible}
                            onDismiss={() => setStatusMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setStatusMenuVisible(true)}
                                    style={styles.statusButton}
                                >
                                    Status:{' '}
                                    {statusOptions.find(
                                        s =>
                                            s.value ===
                                            stockOutStore.formData.status
                                    )?.label || 'Pending'}
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
                            value={stockOutStore.formData.notes || ''}
                            onChangeText={text => updateField('notes', text)}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />
                    </Card.Content>
                </Card>

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
                        loading={stockOutStore.isLoading}
                        disabled={stockOutStore.isLoading}
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
                            Stock out record created successfully.
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
    title: {
        marginBottom: 16,
        textAlign: 'center',
    },
    productsCard: {
        marginBottom: 16,
    },
    infoCard: {
        marginBottom: 16,
    },
    productContainer: {
        marginBottom: 8,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    input: {
        marginBottom: 12,
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
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
    divider: {
        marginVertical: 16,
    },
})

export default StockOutForm

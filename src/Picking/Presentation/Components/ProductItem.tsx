import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Surface,
    Text,
    Button,
    ProgressBar,
    TextInput,
    Divider,
    Chip,
    Snackbar,
} from 'react-native-paper'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'

interface ProductItemProps {
    item: PickingOrderProcessItemEntity
    index: number
    onUpdateQuantity: (itemId: string, quantity: number) => Promise<boolean>
    isPendingUpdate: boolean
    inputValue: string
    onInputChange: (value: string) => void
}

const ProductItem: React.FC<ProductItemProps> = ({
    item,
    index,
    onUpdateQuantity,
    isPendingUpdate,
    inputValue,
    onInputChange,
}) => {
    // State for update notification
    const [updateSuccess, setUpdateSuccess] = useState(false)
    const [updateError, setUpdateError] = useState(false)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    
    // Track the displayed quantity locally to immediately update the progress bar
    const [displayedQuantity, setDisplayedQuantity] = useState<number | null>(null)

    // Current quantity & progress calculation logic
    const getCurrentQuantity = () => {
        // If we have a local displayedQuantity from a successful update, use that first
        if (displayedQuantity !== null) {
            return displayedQuantity
        }
        
        // Otherwise, fall back to the item's quantity
        return item.updatedQuantityPicked !== undefined
            ? item.updatedQuantityPicked
            : item.quantityPicked
    }
    
    const currentQuantity = getCurrentQuantity()
    const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
    const isFullyPicked = currentQuantity >= maxPickable
    const progressPercentage =
        maxPickable > 0 ? Math.min(currentQuantity / maxPickable, 1) : 0

    // Reset success/error states when item changes
    useEffect(() => {
        setUpdateSuccess(false)
        setUpdateError(false)
        // Reset displayed quantity when item changes to ensure we use the latest from props
        setDisplayedQuantity(null)
    }, [item.id, item.quantityPicked, item.updatedQuantityPicked])

    // Progress color logic
    const getProgressColor = () => {
        if (progressPercentage === 0) return '#f44336' // Red for not started
        if (progressPercentage < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }

    // Handle update button click
    const handleUpdate = async () => {
        if (!inputValue) return

        const newQuantity = parseInt(inputValue, 10)
        if (isNaN(newQuantity)) return

        // VALIDATION: Check if quantity exceeds maximum pickable
        if (newQuantity > maxPickable) {
            // Show error for excessive quantity
            setUpdateError(true)
            setSnackbarMessage(
                `Cannot exceed maximum quantity of ${maxPickable}`
            )
            setSnackbarVisible(true)
            return // Stop the update process
        }

        const finalQuantity = Math.max(0, Math.min(newQuantity, maxPickable))

        if (finalQuantity !== currentQuantity) {
            try {
                // Reset previous states
                setUpdateSuccess(false)
                setUpdateError(false)

                console.log(
                    `ProductItem: Updating item ${item.id} to quantity ${finalQuantity}`
                )

                // IMPORTANT: Use await here
                const result = await onUpdateQuantity(item.id, finalQuantity)

                console.log(`ProductItem: Update result: ${result}`)

                // Show correct success/error message
                if (result === true) {
                    // Immediately update the displayed quantity for the progress bar
                    setDisplayedQuantity(finalQuantity)
                    
                    setUpdateSuccess(true)
                    setSnackbarMessage('Quantity updated successfully')

                    // Force re-render of the parent container
                    onInputChange(finalQuantity.toString())
                } else {
                    setUpdateError(true)
                    setSnackbarMessage('Failed to update quantity')
                }

                setSnackbarVisible(true)
            } catch (error) {
                console.error('Error in ProductItem.handleUpdate:', error)
                setUpdateError(true)
                setSnackbarMessage('Error updating quantity')
                setSnackbarVisible(true)
            }
        }
    }

    return (
        <Surface
            style={[
                styles.productItem,
                updateSuccess && styles.updateSuccessBorder,
                updateError && styles.updateErrorBorder,
            ]}
            elevation={1}
        >
            {/* Goods Information Section */}
            <View style={styles.goodsInfoSection}>
                <View style={styles.goodsNameRow}>
                    <Text style={styles.goodsName}>
                        {item.goodsName || 'Unknown Product'}
                    </Text>
                    {isFullyPicked && (
                        <Chip
                            style={{ backgroundColor: '#4caf50' }}
                            textStyle={styles.statusChip}
                        >
                            Complete
                        </Chip>
                    )}
                </View>
                <Text style={styles.goodsCode}>
                    Code: {item.goodsCode || 'N/A'}
                </Text>
            </View>

            <Divider style={styles.divider} />

            {/* Progress Section - Now the main quantity display */}
            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Picking Progress</Text>
                    <Text style={styles.progressQuantity}>
                        {currentQuantity}/{maxPickable}
                    </Text>
                </View>
                <ProgressBar
                    progress={progressPercentage}
                    color={getProgressColor()}
                    style={styles.progressBar}
                />
                <View style={styles.progressFooter}>
                    <Text style={styles.quantityLabels}>
                        Available: {item.quantityCanPicked}
                    </Text>
                    <Text
                        style={[
                            styles.progressPercentage,
                            { color: getProgressColor() },
                        ]}
                    >
                        {Math.round(progressPercentage * 100)}%
                    </Text>
                </View>
            </View>

            <View style={styles.quantityInputContainer}>
                <TextInput
                    mode="outlined"
                    label="Quantity"
                    value={inputValue}
                    onChangeText={onInputChange}
                    keyboardType="number-pad"
                    style={styles.quantityInput}
                    disabled={isPendingUpdate}
                    dense
                />
                <Button
                    mode="contained"
                    onPress={handleUpdate}
                    disabled={isPendingUpdate}
                    style={styles.updateButton}
                    loading={isPendingUpdate}
                >
                    Update
                </Button>
            </View>

            {isPendingUpdate && (
                <Text style={styles.pendingText}>Updating...</Text>
            )}

            {/* Update notification */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={
                    updateSuccess
                        ? styles.successSnackbar
                        : updateError
                        ? styles.errorSnackbar
                        : undefined
                }
            >
                {snackbarMessage}
            </Snackbar>
        </Surface>
    )
}

const styles = StyleSheet.create({
    productItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    updateSuccessBorder: {
        borderLeftColor: '#4caf50', // Green for success
    },
    updateErrorBorder: {
        borderLeftColor: '#f44336', // Red for error
    },
    // Goods information styles
    goodsInfoSection: {
        marginBottom: 12,
    },
    goodsNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    goodsName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    goodsCode: {
        fontSize: 14,
        color: '#666',
    },
    statusChip: {
        color: 'white',
        fontSize: 12,
    },
    divider: {
        marginBottom: 12,
    },
    progressSection: {
        marginVertical: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressQuantity: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginVertical: 6,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityLabels: {
        fontSize: 12,
        color: '#666',
    },
    progressPercentage: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    quantityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
    },
    quantityInput: {
        flex: 1,
    },
    updateButton: {
        borderRadius: 4,
    },
    pendingText: {
        color: '#2196F3',
        fontStyle: 'italic',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    successSnackbar: {
        backgroundColor: '#4caf50', // Green background for success
    },
    errorSnackbar: {
        backgroundColor: '#f44336', // Red background for error
    },
})

export default ProductItem
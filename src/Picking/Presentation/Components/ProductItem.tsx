import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Surface,
    Text,
    Button,
    ProgressBar,
    TextInput,
} from 'react-native-paper'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'

interface ProductItemProps {
    item: PickingOrderProcessItemEntity
    index: number
    onUpdateQuantity: (id: string, quantity: number) => void
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
    onInputChange
}) => {
    // Current quantity & progress calculation logic
    const currentQuantity = item.updatedQuantityPicked !== undefined ? 
        item.updatedQuantityPicked : item.quantityPicked
  
    const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
    const isFullyPicked = currentQuantity >= maxPickable
    const progressPercentage = maxPickable > 0 ? Math.min(currentQuantity / maxPickable, 1) : 0

    // Progress color logic
    const getProgressColor = () => {
        if (progressPercentage === 0) return '#f44336' // Red for not started
        if (progressPercentage < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }
  
    // Handle update button click
    const handleUpdate = () => {
        if (!inputValue) return
    
        const newQuantity = parseInt(inputValue, 10)
        if (isNaN(newQuantity)) return
    
        const finalQuantity = Math.max(0, Math.min(newQuantity, maxPickable))
    
        if (finalQuantity !== currentQuantity) {
            onUpdateQuantity(item.id, finalQuantity)
        }
    }

    return (
        <Surface 
            style={styles.productItem}
            elevation={1}
        >
            <View style={styles.productHeader}>
                <Text style={styles.productId}>Product {index + 1}</Text>
                {isFullyPicked && (
                    <Text style={[styles.completedText, { color: '#4caf50' }]}>
                        Complete
                    </Text>
                )}
            </View>
      
            <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Requested:</Text>
                <Text style={styles.quantityValue}>{item.requestedQuantity}</Text>
            </View>
            <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Available:</Text>
                <Text style={styles.quantityValue}>{item.quantityCanPicked}</Text>
            </View>
            <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Picked:</Text>
                <Text style={styles.quantityValue}>{currentQuantity}</Text>
            </View>
      
            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Picking Progress</Text>
                    <Text style={[styles.progressText, { color: getProgressColor() }]}>
                        {Math.round(progressPercentage * 100)}%
                    </Text>
                </View>
                <ProgressBar
                    progress={progressPercentage}
                    color={getProgressColor()}
                    style={styles.progressBar}
                />
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
                >
                    Update
                </Button>
            </View>
      
            {isPendingUpdate && (
                <Text style={styles.pendingText}>Updating...</Text>
            )}
        </Surface>
    )
}

const styles = StyleSheet.create({
    productItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productId: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    completedText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    quantityLabel: {
        color: '#666',
    },
    quantityValue: {
        fontWeight: 'bold',
    },
    progressSection: {
        marginVertical: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: '#757575',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
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
})

export default ProductItem
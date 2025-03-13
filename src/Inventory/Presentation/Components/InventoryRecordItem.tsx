// src/Inventory/Presentation/Components/InventoryRecordItem.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Chip, Divider, Button, Badge } from 'react-native-paper'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

interface InventoryRecordItemProps {
    record: InventoryRecordEntity
    onPress: (id: string) => void
}

const InventoryRecordItem = ({ record, onPress }: InventoryRecordItemProps) => {
    const {
        id,
        reference,
        date,
        conductedBy,
        location,
        status,
        products,
        totalItems,
    } = record

    const getStatusColor = (status: InventoryRecordEntity['status']) => {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    const isProcessable =
        status === 'pending' || status === 'in-progress'

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View>
                        <Text variant="titleMedium">{reference}</Text>
                        <Text variant="bodySmall">
                            Date: {formatDate(date)}
                        </Text>
                    </View>
                    <Badge
                        style={{
                            backgroundColor: getStatusColor(status),
                            color: 'white',
                        }}
                    >
                        {status}
                    </Badge>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <Text
                            variant="bodyMedium"
                            style={styles.detailLabel}
                        >
                            Location:
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={styles.detailValue}
                        >
                            {location || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text
                            variant="bodyMedium"
                            style={styles.detailLabel}
                        >
                            Total Items:
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={styles.detailValue}
                        >
                            {totalItems}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text
                            variant="bodyMedium"
                            style={styles.detailLabel}
                        >
                            Conducted By:
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={styles.detailValue}
                        >
                            {conductedBy}
                        </Text>
                    </View>
                </View>

                <Divider style={styles.divider} />

                <Text variant="bodySmall">
                    Products ({products.length}):
                </Text>
                <View style={styles.productsPreview}>
                    {products.slice(0, 2).map((product, index) => (
                        <Text
                            key={index}
                            variant="bodySmall"
                            style={styles.productItem}
                        >
                            • {product.productName} (Expected: {product.expectedQuantity}, 
                            Actual: {product.actualQuantity})
                        </Text>
                    ))}
                    {products.length > 2 && (
                        <Text
                            variant="bodySmall"
                            style={styles.moreProducts}
                        >
                            And {products.length - 2} more product(s)...
                        </Text>
                    )}
                </View>
            </Card.Content>

            <Card.Actions>
                <Button
                    mode="contained"
                    onPress={() => onPress(id)}
                >
                    {isProcessable ? 'Process' : 'View Details'}
                </Button>
            </Card.Actions>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    divider: {
        marginVertical: 8,
    },
    cardDetails: {
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    detailLabel: {
        flex: 1,
        fontWeight: 'bold',
    },
    detailValue: {
        flex: 2,
    },
    productsPreview: {
        marginTop: 4,
    },
    productItem: {
        marginBottom: 2,
    },
    moreProducts: {
        fontStyle: 'italic',
        marginTop: 2,
    },
})

export default InventoryRecordItem
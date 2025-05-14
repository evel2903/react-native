import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Surface,
    Text,
    TouchableRipple,
    List,
    ProgressBar,
    Chip,
} from 'react-native-paper'
import { formatDate, formatCurrency } from '@/src/Core/Utils'
import { StorageVoucherDetailEntity } from '@/src/Storage/Domain/Entities/StorageVoucherEntity'
import StorageVoucherItemsComponent from './StorageVoucherItemsComponent'

interface StorageVoucherDetailComponentProps {
    item: StorageVoucherDetailEntity
}

const StorageVoucherDetailComponent: React.FC<
    StorageVoucherDetailComponentProps
> = ({ item }) => {
    const [expanded, setExpanded] = useState(false)

    // Calculate allocation progress
    const totalQuantity = item.quantity || 0
    const allocatedQuantity = (item.storageVoucherItems || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
    )
    const progressPercentage =
        totalQuantity > 0 ? Math.min(allocatedQuantity / totalQuantity, 1) : 0
    const isFullyAllocated = allocatedQuantity >= totalQuantity

    // Determine progress color based on allocation status
    const getProgressColor = () => {
        if (progressPercentage === 0) return '#f44336' // Red for not started
        if (progressPercentage < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }

    // Format progress as percentage
    const formatProgress = () => {
        const percentage = progressPercentage * 100
        return `${Math.round(percentage)}%`
    }

    // Get status chip color and text
    const getStatusInfo = () => {
        if (progressPercentage === 0) {
            return { color: '#f44336', text: 'Not Started' }
        }
        if (progressPercentage < 1) {
            return { color: '#ff9800', text: 'In Progress' }
        }
        return { color: '#4caf50', text: 'Complete' }
    }

    const statusInfo = getStatusInfo()

    return (
        <Surface style={styles.itemCard} elevation={1}>
            <View style={styles.itemHeader}>
                <Text style={styles.codeText}>{item.code || ''}</Text>
                <Chip
                    style={{ backgroundColor: statusInfo.color }}
                    textStyle={styles.statusChipText}
                >
                    {statusInfo.text}
                </Chip>
            </View>

            <Text style={styles.itemName}>{item.name || ''}</Text>
            <Text style={styles.itemSupplier}>
                Supplier: {item.supplier || 'N/A'}
            </Text>

            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.labelText}>Lot Number</Text>
                        <Text style={styles.valueText}>
                            {item.lotNumber || '-'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.labelText}>Expiry Date</Text>
                        <Text style={styles.valueText}>
                            {formatDate(item.expiryDate || '')}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.labelText}>Quantity</Text>
                        <Text style={styles.valueText}>
                            {(item.quantity || 0).toString()}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.labelText}>Cost</Text>
                        <Text style={styles.valueText}>
                            {formatCurrency(Number(item.cost) || 0)}
                        </Text>
                    </View>
                </View>

                {/* Progress section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Storage Status</Text>
                        <Text style={styles.progressText}>
                            {formatProgress()}
                        </Text>
                    </View>
                    <ProgressBar
                        progress={progressPercentage}
                        color={getProgressColor()}
                        style={styles.progressBar}
                    />
                    <Text style={styles.progressDetail}>
                        {allocatedQuantity} of {totalQuantity} items stored
                    </Text>
                </View>

                {item.notes && (
                    <View style={styles.notesSection}>
                        <Text style={styles.labelText}>Notes</Text>
                        <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                )}
            </View>

            {/* Location Details Accordion */}
            <TouchableRipple onPress={() => setExpanded(!expanded)}>
                <View style={styles.locationsAccordion}>
                    <Text style={styles.locationsTitle}>
                        Storage Locations (
                        {item.storageVoucherItems?.length || 0})
                    </Text>
                    <List.Icon
                        icon={expanded ? 'chevron-up' : 'chevron-down'}
                        style={styles.accordionIcon}
                    />
                </View>
            </TouchableRipple>

            {expanded && (
                <View style={styles.locationsContent}>
                    <StorageVoucherItemsComponent
                        items={item.storageVoucherItems || []}
                    />
                </View>
            )}
        </Surface>
    )
}

const styles = StyleSheet.create({
    itemCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    codeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    statusChipText: {
        color: 'white',
        fontSize: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemSupplier: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    infoSection: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    infoItem: {
        flex: 1,
    },
    labelText: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 2,
    },
    valueText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    progressSection: {
        marginTop: 12,
        marginBottom: 8,
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
    progressDetail: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
    notesSection: {
        marginTop: 8,
    },
    notesText: {
        fontSize: 14,
        color: '#333',
        marginTop: 2,
        lineHeight: 20,
    },
    // Location Details styles
    locationsAccordion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 12,
    },
    locationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationsContent: {
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    accordionIcon: {
        margin: 0,
    },
})

export default StorageVoucherDetailComponent

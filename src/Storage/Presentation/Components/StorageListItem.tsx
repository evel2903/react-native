import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Card,
    Text,
    Divider,
    IconButton,
    Chip,
    Button,
    ProgressBar,
} from 'react-native-paper'
import {
    PRIORITY,
    getPriorityColor,
    getPriorityDisplayName,
} from '@/src/Common/Domain/Enums/Priority'
import { formatDate, formatDateTime } from '@/src/Core/Utils'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import StorageVoucherEntity, { StorageVoucherDetailEntity } from '@/src/Storage/Domain/Entities/StorageVoucherEntity'

// Define the structure based on API response
interface StorageVoucher {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    code: string
    storageDate: string
    priority: number
    status: string
    notes?: string
    createdBy?: string
    assignedTo: string
    // New fields from updated API response
    isValidForProcess: boolean
    assignedName: string
    // Progress tracking fields
    totalItemsQty: number
    totalItemsStored: number
}

interface StorageListItemProps {
    item: StorageVoucher
    onView: (id: string) => void
    onProcess: (id: string) => void
}

const StorageListItem: React.FC<StorageListItemProps> = ({
    item,
    onView,
    onProcess,
}) => {
    const authStore = useAuthStore()

    // Get status details
    const getStatusDetails = (status: string) => {
        // Map status to color and display name
        switch (status) {
            case 'DRAFT':
                return { color: '#ff9800', displayName: 'Draft' } // Orange
            case 'PENDING':
                return { color: '#2196f3', displayName: 'Pending' } // Blue
            case 'APPROVED':
                return { color: '#4caf50', displayName: 'Approved' } // Green
            case 'REJECTED':
                return { color: '#f44336', displayName: 'Rejected' } // Red
            case 'CANCELLED':
                return { color: '#757575', displayName: 'Cancelled' } // Grey
            default:
                return { color: '#757575', displayName: status } // Grey fallback
        }
    }

    // Get progress color based on completion percentage
    const getProgressColor = (percentage: number) => {
        if (percentage === 0) return '#f44336'; // Red for not started
        if (percentage < 0.5) return '#ff9800'; // Orange for < 50%
        if (percentage < 1) return '#2196f3'; // Blue for partial completion
        return '#4caf50'; // Green for complete
    };

    const statusDetails = getStatusDetails(item.status)
    
    // Calculate percentage directly from API values
    const totalItems = item.totalItemsQty || 0;
    const storedItems = item.totalItemsStored || 0;
    const percentage = totalItems > 0 ? Math.min(storedItems / totalItems, 1) : 0;

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                {/* Header section with code and status */}
                <View style={styles.headerRow}>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeText}>{item.code}</Text>
                        {item.priority !== undefined && item.priority > 0 && (
                            <Chip
                                style={{
                                    backgroundColor: getPriorityColor(
                                        item.priority as any
                                    ),
                                }}
                                textStyle={styles.priorityChip}
                            >
                                {getPriorityDisplayName(item.priority as any)}
                            </Chip>
                        )}
                    </View>
                </View>

                {/* Storage information */}
                <Text style={styles.infoText}>
                    Storage date: {formatDate(item.storageDate)}
                </Text>
                <Text style={styles.infoText}>
                    Assigned to: {item.assignedName || 'Not assigned'}
                </Text>
                {item.notes && (
                    <Text style={styles.infoText}>Notes: {item.notes}</Text>
                )}

                {/* Progress section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Completion Status</Text>
                        <Text style={styles.progressPercentage}>
                            {Math.round(percentage * 100)}%
                        </Text>
                    </View>
                    <ProgressBar
                        progress={percentage}
                        color={getProgressColor(percentage)}
                        style={styles.progressBar}
                    />
                    <Text style={styles.progressDetail}>
                        {storedItems} of {totalItems} items stored
                    </Text>
                </View>

                {/* Timestamps & status */}
                <View style={styles.metadataContainer}>
                    <View style={styles.timestampsContainer}>
                        {item.createdAt && (
                            <Text variant="bodySmall" style={styles.timestamp}>
                                Created: {formatDateTime(item.createdAt)}
                            </Text>
                        )}
                        {item.updatedAt && (
                            <Text variant="bodySmall" style={styles.timestamp}>
                                Updated: {formatDateTime(item.updatedAt)}
                            </Text>
                        )}
                    </View>
                    <Chip
                        style={[
                            styles.statusChip,
                            {
                                backgroundColor: statusDetails.color,
                            },
                        ]}
                        textStyle={styles.statusText}
                    >
                        {statusDetails.displayName}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                {/* Action buttons */}
                <View style={styles.actionsRow}>
                    <View style={styles.iconButtons}>
                        {/* View button - available to anyone with view permission */}
                        {authStore.hasPermission('storageVoucher:read') && (
                            <IconButton
                                icon="eye"
                                size={20}
                                onPress={() => onView(item.id)}
                            />
                        )}
                    </View>
                    {/* Process button */}
                    <View style={styles.actionButtons}>
                        {item.isValidForProcess && (
                            <Button
                                mode="outlined"
                                style={styles.processButton}
                                onPress={() => onProcess(item.id)}
                            >
                                Process
                            </Button>
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    cardContent: {
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    codeText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    priorityChip: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    infoText: {
        marginBottom: 4,
    },
    metadataContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 12,
        marginBottom: 4,
    },
    timestampsContainer: {
        flexDirection: 'column',
    },
    timestamp: {
        color: '#666',
        fontSize: 11,
        marginBottom: 2,
    },
    statusChip: {
        borderRadius: 4,
        height: 28,
        alignSelf: 'flex-start',
    },
    divider: {
        marginTop: 8,
        marginBottom: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 0,
    },
    iconButtons: {
        flexDirection: 'row',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    processButton: {
        borderRadius: 4,
        borderWidth: 1,
    },
    // Progress section styles
    progressSection: {
        marginTop: 12,
        marginBottom: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: 8,
        padding: 8,
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
    progressPercentage: {
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
})

export default StorageListItem
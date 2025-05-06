import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Card,
    Text,
    Divider,
    Button,
    IconButton,
    Chip,
} from 'react-native-paper'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import {
    Status,
    getStatusColor,
    getStatusDisplayName,
} from '@/src/Common/Domain/Enums/Status'
import {
    PRIORITY,
    getPriorityColor,
    getPriorityDisplayName,
} from '@/src/Common/Domain/Enums/Priority'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'

interface StockInListItemProps {
    item: StockInEntity
    onApprove: (id: string) => void
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

const StockInListItem: React.FC<StockInListItemProps> = ({
    item,
    onApprove,
    onView,
    onEdit,
    onDelete,
}) => {
    const authStore = useAuthStore()

    // Format date to user-friendly format
    const formatDate = (dateString: string) => {
        return new Date(dateString)
            .toLocaleDateString('en-CA')
            .replace(/-/g, '/')
    }

    // Format date and time
    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString()
    }

    // Format currency amounts
    const formatAmount = (amount: string) => {
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'USD',
        })
    }

    // Use the Status enum for type safety
    const getStatusDetails = (statusStr: string) => {
        // Cast the string to our Status enum type
        const status = statusStr as Status

        return {
            color: getStatusColor(status),
            displayName: getStatusDisplayName(status),
        }
    }

    // Get the count of items from details array or count field
    const itemCount = item.count || item.details?.length || 0

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
                                        item.priority
                                    ),
                                }}
                                textStyle={styles.priorityChip}
                            >
                                {getPriorityDisplayName(item.priority)}
                            </Chip>
                        )}
                    </View>
                </View>

                {/* Stock information */}
                <Text style={styles.infoText}>
                    Lot number: {item.lotNumber || 'N/A'}
                </Text>
                <Text style={styles.infoText}>
                    Stock in date: {formatDate(item.inDate)}
                </Text>
                <Text style={styles.infoText}>
                    Supplier:{' '}
                    {item.supplier
                        ? `${item.supplier.code || ''} - ${item.supplier.name}`
                        : 'N/A'}
                </Text>

                {/* Details row with quantity and cost */}
                <View style={styles.detailsRow}>
                    <Text>Items: {itemCount}</Text>
                    <Text>Total: {formatAmount(item.totalAmount)}</Text>
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
                                backgroundColor: getStatusDetails(item.status)
                                    .color,
                            },
                        ]}
                        textStyle={styles.statusText}
                    >
                        {getStatusDetails(item.status).displayName}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                {/* Action buttons */}
                <View style={styles.actionsRow}>
                    <View style={styles.iconButtons}>
                        {/* View button - available to anyone with view permission */}
                        {authStore.hasPermission('stockIn:read') && (
                            <IconButton
                                icon="eye"
                                size={20}
                                onPress={() => onView(item.id)}
                            />
                        )}

                        {/* Only show edit for draft status and if user has edit permission */}
                        {item.status === Status.Draft &&
                            authStore.hasPermission('stockIn:update') && (
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    onPress={() => onEdit(item.id)}
                                />
                            )}

                        {/* Only show delete for draft status and if user has delete permission */}
                        {item.status === Status.Draft &&
                            authStore.hasPermission('stockIn:delete') && (
                                <IconButton
                                    icon="delete"
                                    size={20}
                                    onPress={() => onDelete(item.id)}
                                />
                            )}
                    </View>
                    {/* Only show Approve button if valid for approval and user has approval permission */}
                    {item.isValidForApprovalRequest === true &&
                        authStore.hasPermission(
                            'approval_request_decisions:create'
                        ) && (
                            <Button
                                mode="contained"
                                style={[
                                    styles.approveButton,
                                    {
                                        backgroundColor: getStatusDetails(Status.Approved)
                                            .color,
                                    },
                                ]}
                                onPress={() => onApprove(item.id)}
                            >
                                Approve
                            </Button>
                        )}
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
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
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
        // Empty style kept for future use
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 0,
        marginTop: 8,
    },
    approveButton: {
        borderRadius: 4,
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    iconButtons: {
        flexDirection: 'row',
    },
})

export default StockInListItem
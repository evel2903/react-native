import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
    Card,
    TextInput,
    Button,
    Menu,
    Divider,
    Text,
    Chip,
    IconButton,
} from 'react-native-paper';
import { observer } from 'mobx-react';
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore';
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore';
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders';
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider';
import { PRIORITY, getPriorityColor, getPriorityDisplayName } from '@/src/Common/Domain/Enums/Priority';
import { Status } from '@/src/Common/Domain/Enums/Status';

const StockInFilterForm = observer(() => {
    const stockInStore = useStockInStore();
    const masterDataStore = useMasterDataStore();
    
    const [statusMenuVisible, setStatusMenuVisible] = useState(false);
    const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
    const [supplierMenuVisible, setSupplierMenuVisible] = useState(false);
    
    const [code, setCode] = useState(stockInStore.filters.code || '');
    const [lotNumber, setLotNumber] = useState(stockInStore.filters.lotNumber || '');
    const [startDate, setStartDate] = useState(stockInStore.filters.startDate || '');
    const [endDate, setEndDate] = useState(stockInStore.filters.endDate || '');
    
    // Status options for dropdown
    const statusOptions = [
        { value: Status.Draft, label: 'Draft' },
        { value: Status.Pending, label: 'Pending' },
        { value: Status.Approved, label: 'Approved' },
        { value: Status.Rejected, label: 'Rejected' },
        { value: Status.Cancelled, label: 'Cancelled' },
    ];
    
    // Priority options for dropdown
    const priorityOptions = [
        { value: PRIORITY.High, label: 'High' },
        { value: PRIORITY.Medium, label: 'Medium' },
        { value: PRIORITY.Low, label: 'Low' },
    ];
    
    // Load suppliers for filter
    useEffect(() => {
        const loadData = async () => {
            if (masterDataStore.suppliers.data.length === 0) {
                await masterDataStore.loadSuppliers();
            }
        };
        
        loadData();
    }, [masterDataStore]);
    
    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch (e) {
            return dateString;
        }
    };
    
    // Apply all filters
    const applyFilters = () => {
        stockInStore.applyFilters({
            code: code || undefined,
            status: stockInStore.filters.status,
            priority: stockInStore.filters.priority,
            supplierId: stockInStore.filters.supplierId,
            lotNumber: lotNumber || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
    };
    
    // Clear all filters
    const clearFilters = () => {
        setCode('');
        setLotNumber('');
        setStartDate('');
        setEndDate('');
        stockInStore.resetFilters();
    };
    
    // Check if any filters are active
    const hasActiveFilters = () => {
        return (
            !!code ||
            !!stockInStore.filters.status ||
            !!stockInStore.filters.priority ||
            !!stockInStore.filters.supplierId ||
            !!lotNumber ||
            !!startDate ||
            !!endDate
        );
    };
    
    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={styles.title}>
                    Filter Stock Ins
                </Text>

                <ScrollView style={styles.scrollContainer}>
                    {/* Code filter */}
                    <View style={styles.filterRow}>
                        <TextInput
                            label="Code"
                            value={code}
                            onChangeText={setCode}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>

                    {/* Lot Number filter */}
                    <View style={styles.filterRow}>
                        <TextInput
                            label="Lot Number"
                            value={lotNumber}
                            onChangeText={setLotNumber}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>

                    {/* Status filter */}
                    <View style={styles.filterRow}>
                        <Menu
                            visible={statusMenuVisible}
                            onDismiss={() => setStatusMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setStatusMenuVisible(true)}
                                    style={styles.dropdownButton}
                                >
                                    {stockInStore.filters.status
                                        ? `Status: ${statusOptions.find(
                                              s => s.value === stockInStore.filters.status
                                          )?.label || stockInStore.filters.status}`
                                        : 'Select Status'}
                                </Button>
                            }
                        >
                            <Menu.Item
                                onPress={() => {
                                    stockInStore.mergeFilters({ status: undefined });
                                    setStatusMenuVisible(false);
                                }}
                                title="All Statuses"
                            />
                            <Divider />
                            {statusOptions.map(status => (
                                <Menu.Item
                                    key={status.value}
                                    onPress={() => {
                                        stockInStore.mergeFilters({
                                            status: status.value as any,
                                        });
                                        setStatusMenuVisible(false);
                                    }}
                                    title={status.label}
                                />
                            ))}
                        </Menu>
                    </View>

                    {/* Priority filter */}
                    <View style={styles.filterRow}>
                        <Menu
                            visible={priorityMenuVisible}
                            onDismiss={() => setPriorityMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setPriorityMenuVisible(true)}
                                    style={styles.dropdownButton}
                                >
                                    {stockInStore.filters.priority !== undefined
                                        ? `Priority: ${
                                              priorityOptions.find(
                                                  p =>
                                                      p.value ===
                                                      stockInStore.filters.priority
                                              )?.label || stockInStore.filters.priority
                                          }`
                                        : 'Select Priority'}
                                </Button>
                            }
                        >
                            <Menu.Item
                                onPress={() => {
                                    stockInStore.mergeFilters({ priority: undefined });
                                    setPriorityMenuVisible(false);
                                }}
                                title="All Priorities"
                            />
                            <Divider />
                            {priorityOptions.map(priority => (
                                <Menu.Item
                                    key={priority.value}
                                    onPress={() => {
                                        stockInStore.mergeFilters({
                                            priority: priority.value as any,
                                        });
                                        setPriorityMenuVisible(false);
                                    }}
                                    title={priority.label}
                                />
                            ))}
                        </Menu>
                    </View>

                    {/* Supplier filter */}
                    <View style={styles.filterRow}>
                        <Menu
                            visible={supplierMenuVisible}
                            onDismiss={() => setSupplierMenuVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setSupplierMenuVisible(true)}
                                    style={styles.dropdownButton}
                                >
                                    {stockInStore.filters.supplierId
                                        ? `Supplier: ${
                                              masterDataStore.suppliers.data.find(
                                                  s =>
                                                      s.id ===
                                                      stockInStore.filters.supplierId
                                              )?.name || 'Selected'
                                          }`
                                        : 'Select Supplier'}
                                </Button>
                            }
                            style={styles.supplierMenu}
                        >
                            <ScrollView style={styles.menuScrollView}>
                                <Menu.Item
                                    onPress={() => {
                                        stockInStore.mergeFilters({ supplierId: undefined });
                                        setSupplierMenuVisible(false);
                                    }}
                                    title="All Suppliers"
                                />
                                <Divider />
                                {masterDataStore.suppliers.data
                                    .filter(s => s.isActive && !s.isDeleted)
                                    .map(supplier => (
                                        <Menu.Item
                                            key={supplier.id}
                                            onPress={() => {
                                                stockInStore.mergeFilters({
                                                    supplierId: supplier.id,
                                                });
                                                setSupplierMenuVisible(false);
                                            }}
                                            title={`${supplier.name} (${supplier.code})`}
                                        />
                                    ))}
                            </ScrollView>
                        </Menu>
                    </View>

                    {/* Date range filters */}
                    <View style={styles.dateRangeContainer}>
                        <Text variant="bodyMedium" style={styles.dateRangeLabel}>
                            Date Range:
                        </Text>
                        <View style={styles.dateInputsRow}>
                            <TextInput
                                label="Start Date"
                                value={startDate ? formatDate(startDate) : ''}
                                onChangeText={setStartDate}
                                mode="outlined"
                                placeholder="YYYY-MM-DD"
                                style={styles.dateInput}
                            />
                            <Text style={styles.dateRangeSeparator}>to</Text>
                            <TextInput
                                label="End Date"
                                value={endDate ? formatDate(endDate) : ''}
                                onChangeText={setEndDate}
                                mode="outlined"
                                placeholder="YYYY-MM-DD"
                                style={styles.dateInput}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Active filters display */}
                {hasActiveFilters() && (
                    <View style={styles.activeFiltersContainer}>
                        <Text variant="bodySmall" style={styles.activeFiltersLabel}>
                            Active Filters:
                        </Text>
                        <View style={styles.chipContainer}>
                            {code && (
                                <Chip
                                    mode="outlined"
                                    onClose={() => setCode('')}
                                    style={styles.filterChip}
                                >
                                    Code: {code}
                                </Chip>
                            )}
                            {stockInStore.filters.status && (
                                <Chip
                                    mode="outlined"
                                    onClose={() =>
                                        stockInStore.mergeFilters({ status: undefined })
                                    }
                                    style={styles.filterChip}
                                >
                                    Status: {
                                        statusOptions.find(
                                            s => s.value === stockInStore.filters.status
                                        )?.label || stockInStore.filters.status
                                    }
                                </Chip>
                            )}
                            {stockInStore.filters.priority !== undefined && (
                                <Chip
                                    mode="outlined"
                                    onClose={() =>
                                        stockInStore.mergeFilters({ priority: undefined })
                                    }
                                    style={[
                                        styles.filterChip,
                                        { borderColor: getPriorityColor(stockInStore.filters.priority) }
                                    ]}
                                >
                                    Priority: {getPriorityDisplayName(stockInStore.filters.priority)}
                                </Chip>
                            )}
                            {stockInStore.filters.supplierId && (
                                <Chip
                                    mode="outlined"
                                    onClose={() =>
                                        stockInStore.mergeFilters({ supplierId: undefined })
                                    }
                                    style={styles.filterChip}
                                >
                                    Supplier: {
                                        masterDataStore.suppliers.data.find(
                                            s => s.id === stockInStore.filters.supplierId
                                        )?.name || 'Selected'
                                    }
                                </Chip>
                            )}
                            {lotNumber && (
                                <Chip
                                    mode="outlined"
                                    onClose={() => setLotNumber('')}
                                    style={styles.filterChip}
                                >
                                    Lot: {lotNumber}
                                </Chip>
                            )}
                            {(startDate || endDate) && (
                                <Chip
                                    mode="outlined"
                                    onClose={() => {
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    style={styles.filterChip}
                                >
                                    Date: {startDate ? formatDate(startDate) : 'Any'} to{' '}
                                    {endDate ? formatDate(endDate) : 'Any'}
                                </Chip>
                            )}
                        </View>
                    </View>
                )}

                {/* Filter actions */}
                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={clearFilters}
                        style={styles.clearButton}
                    >
                        Clear
                    </Button>
                    <Button
                        mode="contained"
                        onPress={applyFilters}
                        style={styles.applyButton}
                    >
                        Apply Filters
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
});

const styles = StyleSheet.create({
    card: {
        margin: 8,
        elevation: 2,
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    scrollContainer: {
        maxHeight: 400,
    },
    filterRow: {
        marginBottom: 12,
    },
    input: {
        width: '100%',
    },
    dropdownButton: {
        width: '100%',
        justifyContent: 'flex-start',
    },
    supplierMenu: {
        maxWidth: '90%',
    },
    menuScrollView: {
        maxHeight: 200,
    },
    dateRangeContainer: {
        marginVertical: 8,
    },
    dateRangeLabel: {
        marginBottom: 4,
    },
    dateInputsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInput: {
        flex: 1,
    },
    dateRangeSeparator: {
        marginHorizontal: 8,
    },
    activeFiltersContainer: {
        marginTop: 16,
    },
    activeFiltersLabel: {
        marginBottom: 4,
        color: '#666',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        marginRight: 8,
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    clearButton: {
        flex: 1,
        marginRight: 8,
    },
    applyButton: {
        flex: 2,
    },
});

export default withProviders(MasterDataStoreProvider)(StockInFilterForm);
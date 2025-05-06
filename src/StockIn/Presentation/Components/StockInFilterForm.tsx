import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import {
    Card,
    TextInput,
    Button,
    Menu,
    Divider,
    Text,
    Chip,
    IconButton,
    TouchableRipple,
} from 'react-native-paper'
import { formatDate } from '@/src/Core/Utils'
import { DatePickerModal } from 'react-native-paper-dates'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'
import {
    PRIORITY,
    getPriorityColor,
    getPriorityDisplayName,
} from '@/src/Common/Domain/Enums/Priority'
import { Status } from '@/src/Common/Domain/Enums/Status'

const StockInFilterForm = observer(() => {
    const stockInStore = useStockInStore()
    const masterDataStore = useMasterDataStore()
    const windowHeight = Dimensions.get('window').height

    const [statusMenuVisible, setStatusMenuVisible] = useState(false)
    const [supplierMenuVisible, setSupplierMenuVisible] = useState(false)
    
    // Date picker states - separate for start and end dates
    const [startDatePickerVisible, setStartDatePickerVisible] = useState(false)
    const [endDatePickerVisible, setEndDatePickerVisible] = useState(false)

    const [code, setCode] = useState(stockInStore.filters.code || '')
    const [lotNumber, setLotNumber] = useState(
        stockInStore.filters.lotNumber || ''
    )
    
    // Date range state
    const [dateRange, setDateRange] = useState({
        startDate: stockInStore.filters.startDate ? new Date(stockInStore.filters.startDate) : undefined,
        endDate: stockInStore.filters.endDate ? new Date(stockInStore.filters.endDate) : undefined,
    })

    // Status options for dropdown
    const statusOptions = [
        { value: Status.Draft, label: 'Draft' },
        { value: Status.Pending, label: 'Pending' },
        { value: Status.Approved, label: 'Approved' },
        { value: Status.Rejected, label: 'Rejected' },
        { value: Status.Cancelled, label: 'Cancelled' },
    ]

    // Priority options for buttons
    const priorityOptions = [
        { value: PRIORITY.High, label: 'High' },
        { value: PRIORITY.Medium, label: 'Medium' },
        { value: PRIORITY.Low, label: 'Low' },
    ]

    // Load suppliers for filter
    useEffect(() => {
        const loadData = async () => {
            if (masterDataStore.suppliers.data.length === 0) {
                await masterDataStore.loadSuppliers()
            }
        }

        loadData()
    }, [masterDataStore])

    // Handle start date confirmation
    const onConfirmStartDate = ({ date }: { date: Date }) => {
        setDateRange(prev => ({ ...prev, startDate: date }))
        setStartDatePickerVisible(false)
    }

    // Handle end date confirmation
    const onConfirmEndDate = ({ date }: { date: Date }) => {
        setDateRange(prev => ({ ...prev, endDate: date }))
        setEndDatePickerVisible(false)
    }

    // Apply all filters
    const applyFilters = () => {
        stockInStore.applyFilters({
            code: code || undefined,
            status: stockInStore.filters.status,
            priority: stockInStore.filters.priority,
            supplierId: stockInStore.filters.supplierId,
            lotNumber: lotNumber || undefined,
            startDate: dateRange.startDate ? dateRange.startDate.toISOString() : undefined,
            endDate: dateRange.endDate ? dateRange.endDate.toISOString() : undefined,
        })
    }

    // Clear all filters
    const clearFilters = () => {
        setCode('')
        setLotNumber('')
        setDateRange({ startDate: undefined, endDate: undefined })
        stockInStore.resetFilters()
    }

    // Check if any filters are active
    const hasActiveFilters = () => {
        return (
            !!code ||
            !!stockInStore.filters.status ||
            !!stockInStore.filters.priority ||
            !!stockInStore.filters.supplierId ||
            !!lotNumber ||
            !!dateRange.startDate ||
            !!dateRange.endDate
        )
    }

    // Calculate appropriate scroll height based on screen size
    const getScrollHeight = () => {
        // Use 40% of screen height as maximum for the filter form scroll area
        return Math.min(400, windowHeight * 0.4)
    }

    // Get priority button style based on selection state
    const getPriorityButtonStyle = (priorityValue: number) => {
        const isSelected = priorityValue === stockInStore.filters.priority;
        return [
            styles.priorityButton,
            {
                backgroundColor: isSelected ? 
                    (priorityValue === PRIORITY.High ? '#ff5252' : 
                     priorityValue === PRIORITY.Medium ? '#fb8c00' : 
                     '#4caf50') : 
                    'transparent',
                borderWidth: 1,
                borderColor: priorityValue === PRIORITY.High ? '#ff5252' : 
                             priorityValue === PRIORITY.Medium ? '#fb8c00' : 
                             '#4caf50'
            }
        ];
    }
    
    // Get text style based on selection state
    const getPriorityTextStyle = (priorityValue: number) => {
        const isSelected = priorityValue === stockInStore.filters.priority;
        return [
            styles.priorityButtonText,
            {
                color: isSelected ? 'white' : 
                      (priorityValue === PRIORITY.High ? '#ff5252' : 
                       priorityValue === PRIORITY.Medium ? '#fb8c00' : 
                       '#4caf50')
            }
        ];
    }

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.titleContainer}>
                    <Text variant="titleMedium" style={styles.title}>
                        Filter Stock Ins
                    </Text>
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={() => stockInStore.setFilterVisible(false)}
                    />
                </View>

                <ScrollView
                    style={[
                        styles.scrollContainer,
                        { maxHeight: getScrollHeight() },
                    ]}
                    showsVerticalScrollIndicator={true}
                >
                    {/* Row 1: Code and Lot Number in one row */}
                    <View style={styles.filterRow}>
                        <TextInput dense
                            label="Code"
                            value={code}
                            onChangeText={setCode}
                            mode="outlined"
                            style={styles.halfInput}
                        />
                        
                        <TextInput dense
                            label="Lot Number"
                            value={lotNumber}
                            onChangeText={setLotNumber}
                            mode="outlined"
                            style={styles.halfInput}
                        />
                    </View>

                    {/* Row 2: Status and Supplier in one row */}
                    <View style={styles.filterRow}>
                        <View style={styles.halfInput}>
                            <Menu
                                visible={statusMenuVisible}
                                onDismiss={() => setStatusMenuVisible(false)}
                                anchor={
                                    <TextInput dense
                                        label="Status"
                                        value={stockInStore.filters.status
                                            ? statusOptions.find(
                                                s => s.value === stockInStore.filters.status
                                            )?.label || stockInStore.filters.status
                                            : ''}
                                        placeholder="Select Status"
                                        mode="outlined"
                                        style={styles.input}
                                        editable={false}
                                        right={<TextInput.Icon icon="menu-down" onPress={() => setStatusMenuVisible(true)} />}
                                        onTouchStart={() => setStatusMenuVisible(true)}
                                    />
                                }
                            >
                                <Menu.Item
                                    onPress={() => {
                                        stockInStore.mergeFilters({
                                            status: undefined,
                                        })
                                        setStatusMenuVisible(false)
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
                                            })
                                            setStatusMenuVisible(false)
                                        }}
                                        title={status.label}
                                    />
                                ))}
                            </Menu>
                        </View>
                        
                        <View style={styles.halfInput}>
                            <Menu
                                visible={supplierMenuVisible}
                                onDismiss={() => setSupplierMenuVisible(false)}
                                anchor={
                                    <TextInput dense
                                        label="Supplier"
                                        value={stockInStore.filters.supplierId
                                            ? masterDataStore.suppliers.data.find(
                                                s => s.id === stockInStore.filters.supplierId
                                            )?.name || 'Selected'
                                            : ''}
                                        placeholder="Select Supplier"
                                        mode="outlined"
                                        style={styles.input}
                                        editable={false}
                                        right={<TextInput.Icon icon="menu-down" onPress={() => setSupplierMenuVisible(true)} />}
                                        onTouchStart={() => setSupplierMenuVisible(true)}
                                    />
                                }
                                style={styles.supplierMenu}
                            >
                                <ScrollView style={styles.menuScrollView}>
                                    <Menu.Item
                                        onPress={() => {
                                            stockInStore.mergeFilters({
                                                supplierId: undefined,
                                            })
                                            setSupplierMenuVisible(false)
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
                                                    })
                                                    setSupplierMenuVisible(false)
                                                }}
                                                title={`${supplier.name} (${supplier.code})`}
                                            />
                                        ))}
                                </ScrollView>
                            </Menu>
                        </View>
                    </View>

                    {/* Row 3: Date range on left and Priority buttons on right */}
                    <View style={styles.filterRow}>
                        <View style={styles.dateRangeContainer}>
                            <Text variant="bodySmall" style={styles.dateRangeLabel}>Date Range</Text>
                            {/* Date inputs in two rows */}
                            <TextInput 
                                dense
                                label="From"
                                value={dateRange.startDate ? formatDate(dateRange.startDate.toISOString()) : ''}
                                placeholder="Start Date"
                                mode="outlined"
                                style={styles.verticalDateInput}
                                editable={false}
                                right={<TextInput.Icon icon="calendar" onPress={() => setStartDatePickerVisible(true)} />}
                                onTouchStart={() => setStartDatePickerVisible(true)}
                            />
                            
                            <TextInput 
                                dense
                                label="To"
                                value={dateRange.endDate ? formatDate(dateRange.endDate.toISOString()) : ''}
                                placeholder="End Date"
                                mode="outlined"
                                style={styles.verticalDateInput}
                                editable={false}
                                right={<TextInput.Icon icon="calendar" onPress={() => setEndDatePickerVisible(true)} />}
                                onTouchStart={() => setEndDatePickerVisible(true)}
                            />
                            
                            {/* Date Picker Modals */}
                            <DatePickerModal
                                locale="en"
                                mode="single"
                                visible={startDatePickerVisible}
                                onDismiss={() => setStartDatePickerVisible(false)}
                                date={dateRange.startDate}
                                onConfirm={(params) => {
                                    if (params.date) {
                                        onConfirmStartDate({ date: params.date });
                                    }
                                }}
                            />
                            
                            <DatePickerModal
                                locale="en"
                                mode="single"
                                visible={endDatePickerVisible}
                                onDismiss={() => setEndDatePickerVisible(false)}
                                date={dateRange.endDate}
                                onConfirm={({ date }) => {
                                    if (date) {
                                        onConfirmEndDate({ date });
                                    }
                                }}
                            />
                        </View>
                        
                        <View style={styles.priorityInputContainer}>
                            <Text variant="bodySmall" style={styles.priorityLabel}>Priority</Text>
                            <View style={styles.priorityButtonsContainer}>
                                {priorityOptions.map((option) => (
                                    <TouchableRipple
                                        key={option.value}
                                        style={getPriorityButtonStyle(option.value)}
                                        onPress={() => {
                                            if (stockInStore.filters.priority === option.value) {
                                                stockInStore.mergeFilters({ priority: undefined });
                                            } else {
                                                stockInStore.mergeFilters({ priority: option.value });
                                            }
                                        }}
                                    >
                                        <Text style={getPriorityTextStyle(option.value)}>
                                            {option.label}
                                        </Text>
                                    </TouchableRipple>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Active filters display */}
                {hasActiveFilters() && (
                    <View style={styles.activeFiltersContainer}>
                        <Text
                            variant="bodySmall"
                            style={styles.activeFiltersLabel}
                        >
                            Active Filters:
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            style={styles.chipScrollContainer}
                        >
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
                                {lotNumber && (
                                    <Chip
                                        mode="outlined"
                                        onClose={() => setLotNumber('')}
                                        style={styles.filterChip}
                                    >
                                        Lot: {lotNumber}
                                    </Chip>
                                )}
                                {stockInStore.filters.status && (
                                    <Chip
                                        mode="outlined"
                                        onClose={() =>
                                            stockInStore.mergeFilters({
                                                status: undefined,
                                            })
                                        }
                                        style={styles.filterChip}
                                    >
                                        Status:{' '}
                                        {statusOptions.find(
                                            s =>
                                                s.value ===
                                                stockInStore.filters.status
                                        )?.label || stockInStore.filters.status}
                                    </Chip>
                                )}
                                {stockInStore.filters.supplierId && (
                                    <Chip
                                        mode="outlined"
                                        onClose={() =>
                                            stockInStore.mergeFilters({
                                                supplierId: undefined,
                                            })
                                        }
                                        style={styles.filterChip}
                                    >
                                        Supplier:{' '}
                                        {masterDataStore.suppliers.data.find(
                                            s =>
                                                s.id ===
                                                stockInStore.filters.supplierId
                                        )?.name || 'Selected'}
                                    </Chip>
                                )}
                                {stockInStore.filters.priority !== undefined && (
                                    <Chip
                                        mode="outlined"
                                        onClose={() =>
                                            stockInStore.mergeFilters({
                                                priority: undefined,
                                            })
                                        }
                                        style={[
                                            styles.filterChip,
                                            {
                                                borderColor: getPriorityColor(
                                                    stockInStore.filters.priority
                                                ),
                                            },
                                        ]}
                                    >
                                        Priority:{' '}
                                        {getPriorityDisplayName(
                                            stockInStore.filters.priority
                                        )}
                                    </Chip>
                                )}
                                {(dateRange.startDate || dateRange.endDate) && (
                                    <Chip
                                        mode="outlined"
                                        onClose={() => {
                                            setDateRange({
                                                startDate: undefined,
                                                endDate: undefined
                                            })
                                        }}
                                        style={styles.filterChip}
                                    >
                                        Date:{' '}
                                        {dateRange.startDate
                                            ? formatDate(dateRange.startDate)
                                            : 'Any'}{' '}
                                        to{' '}
                                        {dateRange.endDate 
                                            ? formatDate(dateRange.endDate) 
                                            : 'Any'}
                                    </Chip>
                                )}
                            </View>
                        </ScrollView>
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
    )
})

const styles = StyleSheet.create({
    card: {
        margin: 8,
        elevation: 3,
        borderRadius: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontWeight: 'bold',
    },
    scrollContainer: {
        maxHeight: 400,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    input: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    halfInput: {
        width: '48%',
    },
    // Date range styles
    dateRangeContainer: {
        width: '60%',
    },
    dateRangeLabel: {
        marginBottom: 4,
        color: '#666',
    },
    dateInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateInput: {
        width: '48%',
        backgroundColor: 'transparent',
    },
    verticalDateInput: {
        width: '100%',
        backgroundColor: 'transparent',
        marginBottom: 8,
    },
    // Priority styles
    priorityInputContainer: {
        width: '38%',
    },
    priorityLabel: {
        marginBottom: 4,
        color: '#666',
    },
    priorityButtonsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 100,
    },
    priorityButton: {
        flex: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        height: 30,
    },
    priorityButtonText: {
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    supplierMenu: {
        maxWidth: '90%',
    },
    menuScrollView: {
        maxHeight: 200,
    },
    // Active filters styles
    activeFiltersContainer: {
        marginTop: 16,
    },
    activeFiltersLabel: {
        marginBottom: 4,
        color: '#666',
    },
    chipScrollContainer: {
        marginBottom: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
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
})

export default withProviders(MasterDataStoreProvider)(StockInFilterForm)
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    Portal,
    Modal,
    Button,
    Text,
    TextInput,
    Surface,
    IconButton,
    Divider,
    Chip,
    HelperText,
    List,
    Checkbox,
    Menu,
} from 'react-native-paper'
import ProductScannerModal from './ProductScannerModal'
import { WarehouseEntity } from '@/src/Common/Domain/Entities/WarehouseEntity'
import { AreaEntity } from '@/src/Common/Domain/Entities/AreaEntity'
import { RowEntity } from '@/src/Common/Domain/Entities/RowEntity'
import { ShelfEntity } from '@/src/Common/Domain/Entities/ShelfEntity'
import {
    StorageVoucherDetailEntity,
    StorageVoucherItemEntity,
} from '@/src/Storage/Domain/Entities/StorageVoucherEntity'

interface LocationEditModalProps {
    visible: boolean
    onClose: () => void
    onSave: (updatedItems: StorageVoucherItemEntity[]) => void
    detailItem: StorageVoucherDetailEntity | null
    warehouses: WarehouseEntity[]
    areas: AreaEntity[]
    rows: RowEntity[]
    shelfs: ShelfEntity[]
}

interface LocationItem extends StorageVoucherItemEntity {
    isNew?: boolean
    tempId?: string
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({
    visible,
    onClose,
    onSave,
    detailItem,
    warehouses,
    areas,
    rows,
    shelfs,
}) => {
    const [locations, setLocations] = useState<LocationItem[]>([])
    const [selectedLocation, setSelectedLocation] =
        useState<LocationItem | null>(null)
    const [warehouseId, setWarehouseId] = useState<string>('')
    const [areaId, setAreaId] = useState<string>('')
    const [rowId, setRowId] = useState<string>('')
    const [shelfId, setShelfId] = useState<string>('')
    const [level, setLevel] = useState<number>(1)
    const [position, setPosition] = useState<number>(1)
    const [quantity, setQuantity] = useState<number>(0)
    const [totalQuantity, setTotalQuantity] = useState<number>(0)
    const [remainingQuantity, setRemainingQuantity] = useState<number>(0)
    const [editMode, setEditMode] = useState<boolean>(false)

    // Track available selections based on hierarchy
    const [filteredAreas, setFilteredAreas] = useState<AreaEntity[]>([])
    const [filteredRows, setFilteredRows] = useState<RowEntity[]>([])
    const [filteredShelfs, setFilteredShelfs] = useState<ShelfEntity[]>([])

    // Selection dropdowns visibility
    const [warehouseMenuVisible, setWarehouseMenuVisible] = useState(false)
    const [areaMenuVisible, setAreaMenuVisible] = useState(false)
    const [rowMenuVisible, setRowMenuVisible] = useState(false)
    const [shelfMenuVisible, setShelfMenuVisible] = useState(false)

    // Scanner modal state
    const [scannerModalVisible, setScannerModalVisible] = useState(false)

    // Set up initial state when the modal opens
    useEffect(() => {
        if (visible && detailItem) {
            const items = [...(detailItem.storageVoucherItems || [])]
            setLocations(items)

            // Calculate total and remaining quantity
            const total = detailItem.quantity || 0
            const allocated = items.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
            )
            setTotalQuantity(total)
            setRemainingQuantity(total - allocated)

            // Reset selection
            resetLocationSelection()
        }
    }, [visible, detailItem])

    const resetLocationSelection = () => {
        setSelectedLocation(null)
        setWarehouseId('')
        setAreaId('')
        setRowId('')
        setShelfId('')
        setLevel(1)
        setPosition(1)
        setQuantity(remainingQuantity)
        setEditMode(false)

        // Reset menu visibility
        setWarehouseMenuVisible(false)
        setAreaMenuVisible(false)
        setRowMenuVisible(false)
        setShelfMenuVisible(false)
    }

    // Filter areas based on selected warehouse
    useEffect(() => {
        if (warehouseId) {
            const filtered = areas.filter(
                area => area.warehouseId === warehouseId
            )
            setFilteredAreas(filtered)

            // If no matching areas, reset area selection
            if (filtered.length === 0) {
                setAreaId('')
                setRowId('')
                setShelfId('')
            }
        } else {
            setFilteredAreas([])
            setAreaId('')
            setRowId('')
            setShelfId('')
        }
    }, [warehouseId, areas])

    // Filter rows based on selected area
    useEffect(() => {
        if (areaId) {
            const filtered = rows.filter(row => row.areaId === areaId)
            setFilteredRows(filtered)

            // If no matching rows, reset row selection
            if (filtered.length === 0) {
                setRowId('')
                setShelfId('')
            }
        } else {
            setFilteredRows([])
            setRowId('')
            setShelfId('')
        }
    }, [areaId, rows])

    // Filter shelfs based on selected row
    useEffect(() => {
        if (rowId) {
            const filtered = shelfs.filter(shelf => shelf.rowId === rowId)
            setFilteredShelfs(filtered)

            // If no matching shelfs, reset shelf selection
            if (filtered.length === 0) {
                setShelfId('')
            }
        } else {
            setFilteredShelfs([])
            setShelfId('')
        }
    }, [rowId, shelfs])

    const handleAddLocation = () => {
        if (!warehouseId || !areaId || !rowId || !shelfId || quantity <= 0) {
            // Show validation error
            return
        }

        // Get names from IDs
        const warehouse = warehouses.find(w => w.id === warehouseId)
        const area = areas.find(a => a.id === areaId)
        const row = rows.find(r => r.id === rowId)
        const shelf = shelfs.find(s => s.id === shelfId)

        if (!warehouse || !area || !row || !shelf) {
            return
        }

        const newLocation: LocationItem = {
            id:
                editMode && selectedLocation
                    ? selectedLocation.id
                    : `temp-${Date.now()}`,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            isDeleted: false,
            storageVoucherDetailId: detailItem?.id || '',
            stockId: detailItem?.stockId || '',
            warehouseId,
            areaId,
            rowId,
            shelfId,
            warehouseName: warehouse.name,
            areaName: area.name,
            rowName: row.name,
            shelfName: shelf.name,
            quantity,
            level,
            position,
            status: 'PENDING',
            isNew: !editMode,
            tempId:
                editMode && selectedLocation ? undefined : `temp-${Date.now()}`,
        }

        if (editMode && selectedLocation) {
            // Update existing location
            const updatedLocations = locations.map(loc =>
                loc.id === selectedLocation.id ? newLocation : loc
            )
            setLocations(updatedLocations)
        } else {
            // Add new location
            setLocations([...locations, newLocation])
        }

        // Update remaining quantity
        const newAllocated =
            editMode && selectedLocation
                ? locations.reduce(
                      (sum, item) =>
                          sum +
                          (item.id === selectedLocation.id ? 0 : item.quantity),
                      0
                  ) + quantity
                : locations.reduce((sum, item) => sum + item.quantity, 0) +
                  quantity

        setRemainingQuantity(totalQuantity - newAllocated)

        // Reset form
        resetLocationSelection()
    }

    const handleEditLocation = (location: LocationItem) => {
        setSelectedLocation(location)
        setWarehouseId(location.warehouseId)
        setAreaId(location.areaId)
        setRowId(location.rowId)
        setShelfId(location.shelfId)
        setLevel(location.level)
        setPosition(location.position)
        setQuantity(location.quantity)
        setEditMode(true)
    }

    const handleDeleteLocation = (locationId: string) => {
        const locationToDelete = locations.find(loc => loc.id === locationId)
        if (!locationToDelete) return

        // Update remaining quantity
        const newRemainingQuantity =
            remainingQuantity + locationToDelete.quantity
        setRemainingQuantity(newRemainingQuantity)

        // Remove the location
        const updatedLocations = locations.filter(loc => loc.id !== locationId)
        setLocations(updatedLocations)

        // If currently editing this location, reset the form
        if (selectedLocation && selectedLocation.id === locationId) {
            resetLocationSelection()
        }
    }

    const handleSave = () => {
        // Convert temporary IDs to proper format if needed
        const finalLocations = locations.map(loc => {
            // Strip temporary fields that shouldn't be sent to the server
            const { isNew, tempId, ...rest } = loc
            return rest
        })

        onSave(finalLocations)
    }

    const getWarehouseName = (id: string) => {
        const warehouse = warehouses.find(w => w.id === id)
        return warehouse ? warehouse.name : 'Select warehouse'
    }

    const getAreaName = (id: string) => {
        const area = areas.find(a => a.id === id)
        return area ? area.name : 'Select area'
    }

    const getRowName = (id: string) => {
        const row = rows.find(r => r.id === id)
        return row ? row.name : 'Select row'
    }

    const getShelfName = (id: string) => {
        const shelf = shelfs.find(s => s.id === id)
        return shelf ? shelf.name : 'Select shelf'
    }

    const handleShelfCodeScanned = (codeData: string) => {
        try {
            // Try to parse the scanned data as JSON
            const parsedData = JSON.parse(codeData)

            if (
                parsedData &&
                typeof parsedData === 'object' &&
                'code' in parsedData &&
                'name' in parsedData
            ) {
                // Find the shelf based on the scanned code
                const shelf = shelfs.find(s => s.code === parsedData.code)

                if (shelf) {
                    // Set the shelf ID and its parent hierarchy
                    setShelfId(shelf.id)
                    setRowId(shelf.rowId)

                    // Find the row to get its area ID
                    const row = rows.find(r => r.id === shelf.rowId)
                    if (row) {
                        setAreaId(row.areaId)

                        // Find the area to get its warehouse ID
                        const area = areas.find(a => a.id === row.areaId)
                        if (area) {
                            setWarehouseId(area.warehouseId)
                        }
                    }

                    // Set level and position if provided
                    if ('level' in parsedData && parsedData.level) {
                        setLevel(parseInt(parsedData.level) || 1)
                    }

                    if ('position' in parsedData && parsedData.position) {
                        setPosition(parseInt(parsedData.position) || 1)
                    }

                    // Close all menus
                    setWarehouseMenuVisible(false)
                    setAreaMenuVisible(false)
                    setRowMenuVisible(false)
                    setShelfMenuVisible(false)
                }
            }
        } catch (error) {
            console.error('Error parsing scanned code:', error)
            // Optional: could add some UI feedback here for invalid scans
        }

        // Close scanner modal
        setScannerModalVisible(false)
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                        Edit Storage Locations
                    </Text>
                    <IconButton icon="close" size={20} onPress={onClose} />
                </View>

                <Divider />

                <ScrollView style={styles.modalContent}>
                    {/* Item info */}
                    <Surface style={styles.itemInfoSection} elevation={0}>
                        <Text style={styles.itemName}>
                            {detailItem?.name || ''}
                        </Text>
                        <Text style={styles.itemCode}>
                            {detailItem?.code || ''}
                        </Text>

                        <View style={styles.quantityInfo}>
                            <View style={styles.quantityRow}>
                                <Text style={styles.quantityLabel}>
                                    Total Quantity:
                                </Text>
                                <Text style={styles.quantityValue}>
                                    {totalQuantity}
                                </Text>
                            </View>
                            <View style={styles.quantityRow}>
                                <Text style={styles.quantityLabel}>
                                    Remaining:
                                </Text>
                                <Text
                                    style={[
                                        styles.quantityValue,
                                        remainingQuantity === 0
                                            ? styles.quantityComplete
                                            : null,
                                        remainingQuantity < 0
                                            ? styles.quantityError
                                            : null,
                                    ]}
                                >
                                    {remainingQuantity}
                                </Text>
                            </View>
                        </View>
                    </Surface>

                    {/* Single Location Entry Form */}
                    <Surface style={styles.locationForm} elevation={1}>
                        <View style={styles.formHeaderRow}>
                            <Text style={styles.sectionTitle}>
                                {editMode ? 'Edit Location' : 'Add Location'}
                            </Text>
                            <Button
                                mode="outlined"
                                icon="qrcode-scan"
                                onPress={() => setScannerModalVisible(true)}
                                style={styles.scanButton}
                            >
                                Scan
                            </Button>
                        </View>

                        {/* Warehouse and Area Selection on one row */}
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <View style={styles.menuContainer}>
                                    <Menu
                                        visible={warehouseMenuVisible}
                                        onDismiss={() =>
                                            setWarehouseMenuVisible(false)
                                        }
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() =>
                                                    setWarehouseMenuVisible(
                                                        true
                                                    )
                                                }
                                                style={styles.menuButton}
                                                icon="chevron-down"
                                                contentStyle={
                                                    styles.menuButtonContent
                                                }
                                                labelStyle={
                                                    styles.menuButtonLabel
                                                }
                                            >
                                                {warehouseId
                                                    ? getWarehouseName(
                                                          warehouseId
                                                      )
                                                    : 'Warehouse'}
                                            </Button>
                                        }
                                        style={styles.menu}
                                    >
                                        <ScrollView
                                            style={styles.menuScrollView}
                                        >
                                            {warehouses.map(warehouse => (
                                                <Menu.Item
                                                    key={warehouse.id}
                                                    title={warehouse.name}
                                                    onPress={() => {
                                                        setWarehouseId(
                                                            warehouse.id
                                                        )
                                                        setWarehouseMenuVisible(
                                                            false
                                                        )
                                                    }}
                                                    style={
                                                        warehouse.id ===
                                                        warehouseId
                                                            ? styles.selectedMenuItem
                                                            : null
                                                    }
                                                />
                                            ))}
                                        </ScrollView>
                                    </Menu>
                                </View>
                            </View>

                            <View style={styles.formGroupHalf}>
                                <View style={styles.menuContainer}>
                                    <Menu
                                        visible={areaMenuVisible}
                                        onDismiss={() =>
                                            setAreaMenuVisible(false)
                                        }
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() =>
                                                    warehouseId &&
                                                    setAreaMenuVisible(true)
                                                }
                                                style={[
                                                    styles.menuButton,
                                                    !warehouseId &&
                                                        styles.disabledMenuButton,
                                                ]}
                                                icon="chevron-down"
                                                contentStyle={
                                                    styles.menuButtonContent
                                                }
                                                disabled={!warehouseId}
                                                labelStyle={
                                                    styles.menuButtonLabel
                                                }
                                            >
                                                {areaId
                                                    ? getAreaName(areaId)
                                                    : 'Area'}
                                            </Button>
                                        }
                                        style={styles.menu}
                                    >
                                        <ScrollView
                                            style={styles.menuScrollView}
                                        >
                                            {filteredAreas.length > 0 ? (
                                                filteredAreas.map(area => (
                                                    <Menu.Item
                                                        key={area.id}
                                                        title={area.name}
                                                        onPress={() => {
                                                            setAreaId(area.id)
                                                            setAreaMenuVisible(
                                                                false
                                                            )
                                                        }}
                                                        style={
                                                            area.id === areaId
                                                                ? styles.selectedMenuItem
                                                                : null
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <Menu.Item
                                                    title="No areas available"
                                                    disabled={true}
                                                />
                                            )}
                                        </ScrollView>
                                    </Menu>
                                </View>
                            </View>
                        </View>

                        {/* Row and Shelf Selection on one row */}
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <View style={styles.menuContainer}>
                                    <Menu
                                        visible={rowMenuVisible}
                                        onDismiss={() =>
                                            setRowMenuVisible(false)
                                        }
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() =>
                                                    areaId &&
                                                    setRowMenuVisible(true)
                                                }
                                                style={[
                                                    styles.menuButton,
                                                    !areaId &&
                                                        styles.disabledMenuButton,
                                                ]}
                                                icon="chevron-down"
                                                contentStyle={
                                                    styles.menuButtonContent
                                                }
                                                disabled={!areaId}
                                                labelStyle={
                                                    styles.menuButtonLabel
                                                }
                                            >
                                                {rowId
                                                    ? getRowName(rowId)
                                                    : 'Row'}
                                            </Button>
                                        }
                                        style={styles.menu}
                                    >
                                        <ScrollView
                                            style={styles.menuScrollView}
                                        >
                                            {filteredRows.length > 0 ? (
                                                filteredRows.map(row => (
                                                    <Menu.Item
                                                        key={row.id}
                                                        title={row.name}
                                                        onPress={() => {
                                                            setRowId(row.id)
                                                            setRowMenuVisible(
                                                                false
                                                            )
                                                        }}
                                                        style={
                                                            row.id === rowId
                                                                ? styles.selectedMenuItem
                                                                : null
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <Menu.Item
                                                    title="No rows available"
                                                    disabled={true}
                                                />
                                            )}
                                        </ScrollView>
                                    </Menu>
                                </View>
                            </View>

                            <View style={styles.formGroupHalf}>
                                <View style={styles.menuContainer}>
                                    <Menu
                                        visible={shelfMenuVisible}
                                        onDismiss={() =>
                                            setShelfMenuVisible(false)
                                        }
                                        anchor={
                                            <Button
                                                mode="outlined"
                                                onPress={() =>
                                                    rowId &&
                                                    setShelfMenuVisible(true)
                                                }
                                                style={[
                                                    styles.menuButton,
                                                    !rowId &&
                                                        styles.disabledMenuButton,
                                                ]}
                                                icon="chevron-down"
                                                contentStyle={
                                                    styles.menuButtonContent
                                                }
                                                disabled={!rowId}
                                                labelStyle={
                                                    styles.menuButtonLabel
                                                }
                                            >
                                                {shelfId
                                                    ? getShelfName(shelfId)
                                                    : 'Shelf'}
                                            </Button>
                                        }
                                        style={styles.menu}
                                    >
                                        <ScrollView
                                            style={styles.menuScrollView}
                                        >
                                            {filteredShelfs.length > 0 ? (
                                                filteredShelfs.map(shelf => (
                                                    <Menu.Item
                                                        key={shelf.id}
                                                        title={shelf.name}
                                                        onPress={() => {
                                                            setShelfId(shelf.id)
                                                            setShelfMenuVisible(
                                                                false
                                                            )
                                                        }}
                                                        style={
                                                            shelf.id === shelfId
                                                                ? styles.selectedMenuItem
                                                                : null
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <Menu.Item
                                                    title="No shelves available"
                                                    disabled={true}
                                                />
                                            )}
                                        </ScrollView>
                                    </Menu>
                                </View>
                            </View>
                        </View>

                        {/* Level and Position */}
                        <View style={styles.formRow}>
                            <View style={styles.formGroupHalf}>
                                <TextInput
                                    mode="outlined"
                                    label="Level"
                                    value={level.toString()}
                                    onChangeText={text =>
                                        setLevel(parseInt(text) || 0)
                                    }
                                    keyboardType="number-pad"
                                    style={styles.numberInput}
                                    disabled={!shelfId}
                                    dense
                                />
                            </View>
                            <View style={styles.formGroupHalf}>
                                <TextInput
                                    mode="outlined"
                                    label="Position"
                                    value={position.toString()}
                                    onChangeText={text =>
                                        setPosition(parseInt(text) || 0)
                                    }
                                    keyboardType="number-pad"
                                    style={styles.numberInput}
                                    disabled={!shelfId}
                                    dense
                                />
                            </View>
                        </View>

                        {/* Quantity */}
                        <View style={styles.formGroup}>
                            <TextInput
                                mode="outlined"
                                label="Quantity"
                                value={quantity.toString()}
                                onChangeText={text =>
                                    setQuantity(parseInt(text) || 0)
                                }
                                keyboardType="number-pad"
                                disabled={!shelfId}
                                dense
                            />
                            {!editMode && remainingQuantity > 0 && (
                                <Button
                                    mode="text"
                                    onPress={() =>
                                        setQuantity(remainingQuantity)
                                    }
                                    style={styles.useRemainingButton}
                                >
                                    Use all remaining ({remainingQuantity})
                                </Button>
                            )}
                        </View>

                        {/* Add/Update Button */}
                        <Button
                            mode="contained"
                            onPress={handleAddLocation}
                            style={styles.addButton}
                            disabled={!shelfId || quantity <= 0}
                        >
                            {editMode ? 'Update Location' : 'Add Location'}
                        </Button>

                        {editMode && (
                            <Button
                                mode="outlined"
                                onPress={resetLocationSelection}
                                style={styles.cancelEditButton}
                            >
                                Cancel Edit
                            </Button>
                        )}
                    </Surface>

                    {/* Location List */}
                    <Surface style={styles.locationList} elevation={1}>
                        <Text style={styles.sectionTitle}>Added Locations</Text>

                        {locations.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No locations added yet
                            </Text>
                        ) : (
                            locations.map((location, index) => (
                                <Surface
                                    key={location.id || index}
                                    style={[
                                        styles.locationItem,
                                        selectedLocation?.id === location.id
                                            ? styles.selectedLocationItem
                                            : null,
                                    ]}
                                    elevation={0}
                                >
                                    <View style={styles.locationHeader}>
                                        <Text style={styles.locationTitle}>
                                            Location {index + 1}
                                            {location.isNew && (
                                                <Text
                                                    style={
                                                        styles.newLocationText
                                                    }
                                                >
                                                    {' '}
                                                    (New)
                                                </Text>
                                            )}
                                        </Text>
                                        <Text style={styles.locationQuantity}>
                                            Qty: {location.quantity}
                                        </Text>
                                    </View>

                                    <View style={styles.locationDetails}>
                                        <Text style={styles.locationText}>
                                            Warehouse: {location.warehouseName}
                                        </Text>
                                        <Text style={styles.locationText}>
                                            Area: {location.areaName}
                                        </Text>
                                        <Text style={styles.locationText}>
                                            Row: {location.rowName}
                                        </Text>
                                        <Text style={styles.locationText}>
                                            Shelf: {location.shelfName}
                                        </Text>
                                        <Text style={styles.locationText}>
                                            Level: {location.level} Position:{' '}
                                            {location.position}
                                        </Text>
                                    </View>

                                    <View style={styles.locationActions}>
                                        <IconButton
                                            icon="pencil"
                                            size={16}
                                            onPress={() =>
                                                handleEditLocation(location)
                                            }
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={16}
                                            onPress={() =>
                                                handleDeleteLocation(
                                                    location.id
                                                )
                                            }
                                        />
                                    </View>
                                </Surface>
                            ))
                        )}
                    </Surface>
                </ScrollView>

                <Divider />

                <View style={styles.modalFooter}>
                    <Button
                        mode="outlined"
                        onPress={onClose}
                        style={styles.footerButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={styles.footerButton}
                        disabled={
                            remainingQuantity < 0 || locations.length === 0
                        }
                    >
                        Save Locations
                    </Button>
                </View>

                {/* Product Scanner Modal */}
                <ProductScannerModal
                    visible={scannerModalVisible}
                    onClose={() => setScannerModalVisible(false)}
                    onCodeScanned={handleShelfCodeScanned}
                />
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 8,
        maxHeight: '90%',
        flex: 1,
    },
    formHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scanButton: {
        borderRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        gap: 8,
    },
    footerButton: {
        minWidth: 120,
    },
    // Item info styles
    itemInfoSection: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemCode: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    quantityInfo: {
        marginTop: 8,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    quantityLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    quantityValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    quantityComplete: {
        color: '#4caf50', // Green
    },
    quantityError: {
        color: '#f44336', // Red
    },
    // Location form styles
    locationForm: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 12,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    formGroupHalf: {
        flex: 1,
    },
    numberInput: {
        textAlign: 'center',
    },
    menuContainer: {
        position: 'relative',
        zIndex: 1,
    },
    menuButton: {
        width: '100%',
        justifyContent: 'space-between',
        borderRadius: 4,
        marginBottom: 4,
    },
    menuButtonContent: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
    menuButtonLabel: {
        fontSize: 14,
    },
    disabledMenuButton: {
        opacity: 0.6,
    },
    menu: {
        width: '90%',
        maxWidth: 300,
    },
    menuScrollView: {
        maxHeight: 250,
    },
    selectedMenuItem: {
        backgroundColor: '#e3f2fd',
    },
    addButton: {
        marginTop: 8,
    },
    cancelEditButton: {
        marginTop: 8,
    },
    useRemainingButton: {
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    // Location list styles
    locationList: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#888',
        marginTop: 12,
        marginBottom: 12,
    },
    locationItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        position: 'relative',
    },
    selectedLocationItem: {
        backgroundColor: '#e3f2fd', // Light blue background
        borderWidth: 1,
        borderColor: '#2196f3',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    locationTitle: {
        fontWeight: 'bold',
    },
    locationQuantity: {
        fontWeight: 'bold',
        color: '#2196f3',
    },
    locationDetails: {
        marginBottom: 8,
    },
    locationText: {
        fontSize: 13,
        marginBottom: 2,
    },
    locationActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    newLocationText: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
})
export default LocationEditModal

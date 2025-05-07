import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native'
import {
    Button,
    Text,
    TextInput,
    Surface,
    IconButton,
    ActivityIndicator,
} from 'react-native-paper'
import { CameraView, Camera } from 'expo-camera'
import { GoodsEntity } from '@/src/Common/Domain/Entities/GoodsEntity'

interface GoodsScannerModalProps {
    visible: boolean
    onClose: () => void
    onSelectGoods: (goods: GoodsEntity) => void
    goods: GoodsEntity[]
    isLoading: boolean
}

const GoodsScannerModal: React.FC<GoodsScannerModalProps> = ({
    visible,
    onClose,
    onSelectGoods,
    goods,
    isLoading,
}) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [scanMode, setScanMode] = useState(false)
    const [scannedData, setScannedData] = useState<string | null>(null)
    const [searchCode, setSearchCode] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [foundGoods, setFoundGoods] = useState<GoodsEntity | null>(null)
    const [scannerActive, setScannerActive] = useState(true)

    // Request camera permissions when component mounts
    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
        }

        getCameraPermissions()
    }, [])

    // Reset state when modal is shown
    useEffect(() => {
        if (visible) {
            setSearchCode('')
            setScannedData(null)
            setErrorMessage(null)
            setFoundGoods(null)
            setScannerActive(true)
        }
    }, [visible])

    // Handle barcode scanning
    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScannerActive(false)
        setScannedData(data)
        
        try {
            // Try to parse the QR data
            const qrData = JSON.parse(data)
            
            // Check if it has the expected format
            if (qrData.code !== undefined || qrData.name !== undefined) {
                // Find goods based on code or name
                findGoodsByQrData(qrData)
            } else {
                setErrorMessage('Invalid QR code format')
            }
        } catch (error) {
            console.error('Error parsing QR code data:', error)
            setErrorMessage('Invalid QR code format')
        }
    }

    // Find goods based on QR data
    const findGoodsByQrData = (qrData: { code?: string; name?: string }) => {
        // First try to find by code if present
        if (qrData.code) {
            const found = goods.find(g => 
                g.code.toLowerCase() === qrData.code?.toLowerCase() ||
                (g.customCode && g.customCode.toLowerCase() === qrData.code?.toLowerCase())
            )
            
            if (found) {
                setFoundGoods(found)
                return
            }
        }
        
        // Then try to find by name if present
        if (qrData.name) {
            const found = goods.find(g => 
                g.name.toLowerCase() === qrData.name?.toLowerCase()
            )
            
            if (found) {
                setFoundGoods(found)
                return
            }
        }
        
        // If no matching goods found
        setErrorMessage('No matching goods found')
    }

    // Search for goods by code
    const handleSearch = () => {
        if (!searchCode.trim()) {
            setErrorMessage('Please enter a code')
            return
        }

        setErrorMessage(null)
        
        const found = goods.find(g => 
            g.code.toLowerCase() === searchCode.toLowerCase() ||
            (g.customCode && g.customCode.toLowerCase() === searchCode.toLowerCase())
        )
        
        if (found) {
            setFoundGoods(found)
        } else {
            setErrorMessage('No goods found with this code')
        }
    }

    // Select the found goods
    const handleSelectGoods = () => {
        if (foundGoods) {
            onSelectGoods(foundGoods)
        }
    }

    // Switch between manual and scanner modes
    const toggleScanMode = () => {
        setScanMode(!scanMode)
        // Reset states when switching modes
        setSearchCode('')
        setScannedData(null)
        setErrorMessage(null)
        setFoundGoods(null)
        setScannerActive(true)
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Surface style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text variant="titleMedium">
                            {scanMode ? 'Scan Goods QR Code' : 'Find Goods by Code'}
                        </Text>
                        <IconButton icon="close" size={24} onPress={onClose} />
                    </View>

                    {/* Loading indicator */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    )}

                    {!isLoading && (
                        <>
                            {/* Toggle between manual entry and scanner */}
                            <Button
                                mode="outlined"
                                icon={scanMode ? "keyboard" : "qrcode-scan"}
                                onPress={toggleScanMode}
                                style={styles.toggleButton}
                            >
                                {scanMode ? 'Type Code Manually' : 'Scan QR Code'}
                            </Button>

                            {/* Manual code entry mode */}
                            {!scanMode && (
                                <View style={styles.manualEntryContainer}>
                                    <TextInput
                                        label="Goods Code"
                                        value={searchCode}
                                        onChangeText={setSearchCode}
                                        mode="outlined"
                                        style={styles.input}
                                        autoCapitalize="none"
                                        right={
                                            <TextInput.Icon
                                                icon="magnify"
                                                onPress={handleSearch}
                                            />
                                        }
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={handleSearch}
                                        style={styles.searchButton}
                                    >
                                        Search
                                    </Button>
                                </View>
                            )}

                            {/* QR scanner mode */}
                            {scanMode && (
                                <View style={styles.scannerContainer}>
                                    {hasPermission === null && (
                                        <Text>Requesting for camera permission...</Text>
                                    )}

                                    {hasPermission === false && (
                                        <Text>No access to camera. Please enable camera permissions.</Text>
                                    )}

                                    {hasPermission === true && scannerActive && (
                                        <View style={styles.cameraContainer}>
                                            <CameraView
                                                onBarcodeScanned={scannerActive ? handleBarcodeScanned : undefined}
                                                barcodeScannerSettings={{
                                                    barcodeTypes: ["qr", "code128", "code39", "code93", "ean13", "ean8", "pdf417"],
                                                }}
                                                style={styles.scanner}
                                            />
                                            <View style={styles.scannerOverlay}>
                                                <View style={styles.scannerTargetBox} />
                                            </View>
                                            <Text style={styles.scanInstructionText}>
                                                Position QR code within the box
                                            </Text>
                                        </View>
                                    )}

                                    {scannedData && !scannerActive && (
                                        <View style={styles.scannedDataContainer}>
                                            <Text>Scanned data: {scannedData}</Text>
                                            <Button
                                                mode="text"
                                                onPress={() => {
                                                    setScannedData(null)
                                                    setScannerActive(true)
                                                }}
                                            >
                                                Scan Again
                                            </Button>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Error message */}
                            {errorMessage && (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            )}

                            {/* Found goods details */}
                            {foundGoods && (
                                <Surface style={styles.foundGoodsContainer} elevation={3}>
                                    <Text variant="titleSmall">Found Goods:</Text>
                                    <Text style={styles.goodsDetail}>
                                        Code: {foundGoods.code}
                                    </Text>
                                    <Text style={styles.goodsDetail}>
                                        Name: {foundGoods.name}
                                    </Text>
                                    {foundGoods.customCode && (
                                        <Text style={styles.goodsDetail}>
                                            Custom Code: {foundGoods.customCode}
                                        </Text>
                                    )}
                                    {foundGoods.category && (
                                        <Text style={styles.goodsDetail}>
                                            Category: {foundGoods.category.name}
                                        </Text>
                                    )}
                                    <Button
                                        mode="contained"
                                        onPress={handleSelectGoods}
                                        style={styles.selectButton}
                                    >
                                        Select This Product
                                    </Button>
                                </Surface>
                            )}
                        </>
                    )}
                </Surface>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 8,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleButton: {
        marginBottom: 16,
    },
    manualEntryContainer: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
    },
    searchButton: {
        marginTop: 8,
    },
    scannerContainer: {
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    cameraContainer: {
        width: '100%',
        height: 300,
        overflow: 'hidden',
        borderRadius: 8,
        position: 'relative',
    },
    scanner: {
        width: '100%',
        height: '100%',
    },
    scannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerTargetBox: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    scanInstructionText: {
        color: '#fff',
        position: 'absolute',
        bottom: 20,
        width: '100%',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
    },
    scannedDataContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },
    errorText: {
        color: '#CF6679',
        marginVertical: 8,
    },
    foundGoodsContainer: {
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    goodsDetail: {
        marginBottom: 8,
    },
    selectButton: {
        marginTop: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 8,
    },
})

export default GoodsScannerModal
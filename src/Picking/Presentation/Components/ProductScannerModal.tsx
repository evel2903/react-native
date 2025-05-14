import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import {
    Portal,
    Modal,
    Button,
    Text,
    ActivityIndicator,
    IconButton,
} from 'react-native-paper'
import { CameraView, Camera } from 'expo-camera'

interface ProductScannerModalProps {
    visible: boolean
    onClose: () => void
    onCodeScanned: (code: string) => void
}

const ProductScannerModal: React.FC<ProductScannerModalProps> = ({
    visible,
    onClose,
    onCodeScanned,
}) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [scanned, setScanned] = useState(false)
    const [loading, setLoading] = useState(true)
    const screenWidth = Dimensions.get('window').width
    const screenHeight = Dimensions.get('window').height

    // Get camera permissions when modal becomes visible
    useEffect(() => {
        if (visible) {
            ;(async () => {
                setLoading(true)
                const { status } = await Camera.requestCameraPermissionsAsync()
                setHasPermission(status === 'granted')
                setLoading(false)
                setScanned(false)
            })()
        }
    }, [visible])

    // Handle barcode scan
    const handleBarCodeScanned = ({
        type,
        data,
    }: {
        type: string
        data: string
    }) => {
        if (scanned) return

        setScanned(true)
        onCodeScanned(data)
    }

    // Calculate scanner dimensions
    const scannerSize = Math.min(screenWidth, screenHeight) * 0.7

    // Reset scanner
    const handleReset = () => {
        setScanned(false)
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
                dismissable={!scanned}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Scan Product Code</Text>
                    <IconButton icon="close" size={20} onPress={onClose} />
                </View>

                <View style={styles.cameraContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" />
                            <Text style={styles.permissionText}>
                                Requesting camera permission...
                            </Text>
                        </View>
                    ) : hasPermission === null ? (
                        <View style={styles.permissionContainer}>
                            <Text style={styles.permissionText}>
                                Requesting camera permission...
                            </Text>
                        </View>
                    ) : hasPermission === false ? (
                        <View style={styles.permissionContainer}>
                            <Text style={styles.permissionText}>
                                Camera access is required to scan product codes.
                            </Text>
                            <Button
                                mode="contained"
                                onPress={onClose}
                                style={styles.permissionButton}
                            >
                                Close
                            </Button>
                        </View>
                    ) : (
                        <View style={styles.cameraWrapper}>
                            <CameraView
                                onBarcodeScanned={
                                    scanned ? undefined : handleBarCodeScanned
                                }
                                barcodeScannerSettings={{
                                    barcodeTypes: [
                                        'qr',
                                        'code128',
                                        'code39',
                                        'code93',
                                        'ean13',
                                        'ean8',
                                        'pdf417',
                                    ],
                                }}
                                style={[
                                    styles.camera,
                                    { height: scannerSize, width: scannerSize },
                                ]}
                            />

                            <View style={styles.scannerOverlay}>
                                <View style={styles.scannerTargetCorner1} />
                                <View style={styles.scannerTargetCorner2} />
                                <View style={styles.scannerTargetCorner3} />
                                <View style={styles.scannerTargetCorner4} />
                            </View>

                            {scanned && (
                                <View style={styles.scannedOverlay}>
                                    <Text style={styles.scannedText}>
                                        Product code scanned!
                                    </Text>
                                    <Button
                                        mode="contained"
                                        onPress={handleReset}
                                        style={styles.scanAgainButton}
                                    >
                                        Scan Again
                                    </Button>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.modalFooter}>
                    <Text style={styles.instructionText}>
                        Position the QR code within the frame to scan
                    </Text>
                    <Button
                        mode="outlined"
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        Cancel
                    </Button>
                </View>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 8,
        overflow: 'hidden',
        flex: 0.8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionText: {
        textAlign: 'center',
        marginTop: 16,
        color: 'white',
    },
    permissionButton: {
        marginTop: 20,
    },
    cameraWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
    },
    camera: {
        overflow: 'hidden',
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
    scannerTargetCorner1: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#fff',
    },
    scannerTargetCorner2: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: '#fff',
    },
    scannerTargetCorner3: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#fff',
    },
    scannerTargetCorner4: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: '#fff',
    },
    scannedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    scannedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    scanAgainButton: {
        marginTop: 20,
    },
    modalFooter: {
        padding: 16,
        alignItems: 'center',
    },
    instructionText: {
        textAlign: 'center',
        marginBottom: 16,
        color: '#666',
    },
    closeButton: {
        width: '100%',
    },
})

export default ProductScannerModal

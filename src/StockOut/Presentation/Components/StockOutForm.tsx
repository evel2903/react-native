import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Menu, Dialog, Portal } from 'react-native-paper';
import { observer } from 'mobx-react';
import { useStockOutStore } from '../Stores/StockOutStore/UseStockOutStore';
import CreateStockOutPayload from '../../Application/Types/CreateStockOutPayload';

interface StockOutFormProps {
  onCancel: () => void;
}

const StockOutForm = observer(({ onCancel }: StockOutFormProps) => {
  const stockOutStore = useStockOutStore();
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogVisible, setDialogVisible] = useState(false);

  const unitOptions = ['pc', 'kg', 'liter', 'box', 'carton', 'pallet'];
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!stockOutStore.formData.productId) {
      newErrors.productId = 'Product ID is required';
    }

    if (!stockOutStore.formData.productName) {
      newErrors.productName = 'Product name is required';
    }

    if (!stockOutStore.formData.quantity || stockOutStore.formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!stockOutStore.formData.issuedBy) {
      newErrors.issuedBy = 'Issued by is required';
    }

    if (!stockOutStore.formData.issuedTo) {
      newErrors.issuedTo = 'Issued to is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await stockOutStore.createStockOut();
    if (result) {
      setDialogVisible(true);
    }
  };

  const updateField = (field: keyof CreateStockOutPayload, value: string | number) => {
    stockOutStore.updateFormData({
      [field]: value
    } as Partial<CreateStockOutPayload>);

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text variant="titleLarge" style={styles.title}>Create Stock Out Record</Text>

        <TextInput
          label="Product ID *"
          value={stockOutStore.formData.productId}
          onChangeText={(text) => updateField('productId', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.productId}
        />
        {errors.productId && <HelperText type="error">{errors.productId}</HelperText>}

        <TextInput
          label="Product Name *"
          value={stockOutStore.formData.productName}
          onChangeText={(text) => updateField('productName', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.productName}
        />
        {errors.productName && <HelperText type="error">{errors.productName}</HelperText>}

        <View style={styles.row}>
          <View style={styles.quantityContainer}>
            <TextInput
              label="Quantity *"
              value={stockOutStore.formData.quantity.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text);
                updateField('quantity', isNaN(num) ? 0 : num);
              }}
              keyboardType="numeric"
              mode="outlined"
              style={styles.quantityInput}
              error={!!errors.quantity}
            />
            {errors.quantity && <HelperText type="error">{errors.quantity}</HelperText>}
          </View>

          <View style={styles.unitContainer}>
            <Menu
              visible={unitMenuVisible}
              onDismiss={() => setUnitMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setUnitMenuVisible(true)}
                  style={styles.unitButton}
                >
                  {stockOutStore.formData.unit || 'Select Unit'}
                </Button>
              }
            >
              {unitOptions.map((unit) => (
                <Menu.Item
                  key={unit}
                  onPress={() => {
                    updateField('unit', unit);
                    setUnitMenuVisible(false);
                  }}
                  title={unit}
                />
              ))}
            </Menu>
          </View>
        </View>

        <TextInput
          label="Date *"
          value={stockOutStore.formData.date}
          onChangeText={(text) => updateField('date', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Issued By *"
          value={stockOutStore.formData.issuedBy}
          onChangeText={(text) => updateField('issuedBy', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.issuedBy}
        />
        {errors.issuedBy && <HelperText type="error">{errors.issuedBy}</HelperText>}

        <TextInput
          label="Issued To *"
          value={stockOutStore.formData.issuedTo}
          onChangeText={(text) => updateField('issuedTo', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.issuedTo}
        />
        {errors.issuedTo && <HelperText type="error">{errors.issuedTo}</HelperText>}

        <TextInput
          label="Reason"
          value={stockOutStore.formData.reason || ''}
          onChangeText={(text) => updateField('reason', text)}
          mode="outlined"
          style={styles.input}
        />

        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={styles.statusButton}
            >
              Status: {statusOptions.find(s => s.value === stockOutStore.formData.status)?.label || 'Pending'}
            </Button>
          }
        >
          {statusOptions.map((status) => (
            <Menu.Item
              key={status.value}
              onPress={() => {
                updateField('status', status.value);
                setStatusMenuVisible(false);
              }}
              title={status.label}
            />
          ))}
        </Menu>

        <TextInput
          label="Notes"
          value={stockOutStore.formData.notes || ''}
          onChangeText={(text) => updateField('notes', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.actions}>
          <Button mode="outlined" onPress={onCancel} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={stockOutStore.isLoading}
            disabled={stockOutStore.isLoading}
            style={styles.button}
          >
            Submit
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Stock out record created successfully.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDialogVisible(false);
              onCancel();
            }}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityContainer: {
    flex: 2,
    marginRight: 8,
  },
  quantityInput: {
    flex: 1,
  },
  unitContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  unitButton: {
    height: 56,
    justifyContent: 'center',
  },
  statusButton: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  }
});

export default StockOutForm;
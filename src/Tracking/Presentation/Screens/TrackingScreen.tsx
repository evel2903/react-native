// src/Tracking/Presentation/Screens/TrackingScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Button, 
  Menu,
  Divider,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index';
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';

const TrackingScreen = () => {
  const navigation = useNavigation<RootScreenNavigationProp<'Tracking'>>();
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  
  const [code, setCode] = useState('');
  const [trackingTypeMenuVisible, setTrackingTypeMenuVisible] = useState(false);
  const [trackingType, setTrackingType] = useState('');

  const trackingTypeOptions = [
    { label: 'Position', value: 'POSITION' },
    { label: 'Goods', value: 'GOODS' },
  ];

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  const handleScan = () => {
    // Scan functionality to be implemented
    console.log('Scan pressed with code:', code);
    console.log('Tracking type:', trackingType);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.theme.colors.background },
      ]}
    >
      <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Tracking" />
        </Appbar.Header>
        
        <View style={styles.contentContainer}>
          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <View>
                <Menu
                  visible={trackingTypeMenuVisible}
                  onDismiss={() => setTrackingTypeMenuVisible(false)}
                  anchor={
                    <TextInput
                    dense
                      value={
                        trackingType
                          ? trackingTypeOptions.find(
                              t => t.value === trackingType
                            )?.label || 'Position'
                          : 'Position'
                      }
                      mode="outlined"
                      label={'Type'}
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon="menu-down"
                          onPress={() => setTrackingTypeMenuVisible(true)}
                        />
                      }
                      onTouchStart={() => setTrackingTypeMenuVisible(true)}
                    />
                  }
                >
                  {trackingTypeOptions.map(type => (
                    <Menu.Item
                      key={type.value}
                      onPress={() => {
                        setTrackingType(type.value);
                        setTrackingTypeMenuVisible(false);
                      }}
                      title={type.label}
                    />
                  ))}
                </Menu>
              </View>
              
              <TextInput
                dense
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                mode="outlined"
                placeholder="Enter code"
                label={'Code'}
              />
            </View>
            
            <Button 
              mode="outlined" 
              style={styles.scanButton}
              buttonColor="transparent"
              textColor="#6200ee"
              onPress={handleScan}
              icon="qrcode-scan"
            >
              Scan
            </Button>
          </View>

          <View style={styles.resultsContainer}>
            {/* Results will be displayed here */}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  codeInput: {
    flex: 1,
  },
  scanButton: {
    justifyContent: 'center',
    borderColor: '#e0e0e0',
  },
  resultsContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
  }
});

export default TrackingScreen;
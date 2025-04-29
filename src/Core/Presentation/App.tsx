// src/Core/Presentation/App.tsx
import Navigation from './Navigation/Index'
import { ThemeProvider } from './Theme/ThemeProvider'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <MasterDataStoreProvider>
                    <Navigation />
                </MasterDataStoreProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    )
}
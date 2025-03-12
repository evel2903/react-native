import Navigation from './Navigation/Index'
import { ThemeProvider } from './Theme/ThemeProvider'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <Navigation />
            </ThemeProvider>
        </SafeAreaProvider>
    )
}

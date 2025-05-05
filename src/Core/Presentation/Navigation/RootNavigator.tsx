// src/Core/Presentation/Navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from './Types/Index'
import NotFoundScreen from '../Screens/NotFoundScreen'
import AuthScreen from '@/src/Auth/Presentation/Screens/AuthScreen'
import HomeScreen from '../Screens/HomeScreen'
import StockInScreen from '@/src/StockIn/Presentation/Screens/StockInScreen'
import StockInAddScreen from '@/src/StockIn/Presentation/Screens/StockInAddScreen'
import StockInProcessScreen from '@/src/StockIn/Presentation/Screens/StockInProcessScreen'
import { useTheme } from '../Theme/ThemeProvider'
import { observer } from 'mobx-react'
import { withProviders } from '../Utils/WithProviders'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator = observer(() => {
    const { theme } = useTheme()

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            {/* Include all screens in the navigator, but configure initial route */}
            <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{
                    // Prevent going back to Auth screen after login
                    gestureEnabled: false,
                    // Hide back button if shown
                    headerLeft: () => null,
                }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="StockIn" component={StockInScreen} />
            <Stack.Screen name="StockInAdd" component={StockInAddScreen} />
            <Stack.Screen
                name="StockInProcess"
                component={StockInProcessScreen}
            />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
        </Stack.Navigator>
    )
})

export default withProviders(AuthStoreProvider)(RootNavigator)

import { useEffect } from 'react'
import { View } from 'react-native'
import { ActivityIndicator, Appbar, Card, Text } from 'react-native-paper'

import { RootStackScreenProps } from '@/src/Core/Presentation/Navigation/Types/Index'
import { useI18n } from '@/src/Core/Presentation/Hooks/UseI18n'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { FindPostStoreProvider } from '../stores/FindPostStore/FindPostStoreProvider'
import { useFindPostStore } from '../stores/FindPostStore/useFindPostStore'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'

const PostScreen = observer(
    ({ route, navigation }: RootStackScreenProps<'Post'>) => {
        const { id } = route.params
        const i18n = useI18n()
        const findPostStore = useFindPostStore()
        const { post, isLoading } = findPostStore
        const theme = useTheme()

        useEffect(() => {
            findPostStore.findPost(id)
        }, [findPostStore, id])

        const handleGoBack = () => {
            navigation.navigate('Posts')
        }

        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: theme.theme.colors.background,
                }}
            >
                <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title={post?.title || 'Post Details'} />
                </Appbar.Header>

                <View style={{ padding: 16, flex: 1 }}>
                    {isLoading ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <ActivityIndicator size="large" />
                            <Text style={{ marginTop: 16 }}>
                                {i18n.t('post.screens.Post.loading')}
                            </Text>
                        </View>
                    ) : (
                        <Card style={{ flex: 1 }}>
                            <Card.Content>
                                <Text
                                    variant="bodyLarge"
                                    style={{ marginBottom: 16 }}
                                >
                                    {post?.body}
                                </Text>
                                <Text variant="bodySmall">
                                    Post ID: {post?.id}
                                </Text>
                                <Text variant="bodySmall">
                                    User ID: {post?.userId}
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>
            </SafeAreaView>
        )
    }
)

export default withProviders(FindPostStoreProvider)(PostScreen)

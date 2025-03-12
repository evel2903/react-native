import { useNavigation } from '@react-navigation/native'
import { Card, Text } from 'react-native-paper'
import PostEntity from 'src/post/domain/entities/PostEntity'

interface PostItemProps {
    post: PostEntity
}

const PostItem = ({ post }: PostItemProps) => {
    const { title, body } = post
    const navigation = useNavigation()
    const onPress = () => {
        navigation.navigate('Post', { id: post.id })
    }

    return (
        <Card style={{ margin: 8 }} onPress={onPress}>
            <Card.Content>
                <Text variant="titleMedium">{title}</Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                    {body}
                </Text>
            </Card.Content>
        </Card>
    )
}

export default PostItem

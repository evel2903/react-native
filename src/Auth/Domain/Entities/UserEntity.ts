export default interface UserEntity {
    id: string
    name: string
    email: string
    avatar?: string
    permissions: string[]
}

import { Expose, plainToInstance } from 'class-transformer'
import PayloadDto from '@/src/Core/Infrastructure/Models/PayloadDto'
import LoginPayload from '../../Application/Types/LoginPayload'

export default class LoginDto extends PayloadDto<LoginPayload> {
    @Expose()
    username!: string

    @Expose()
    password!: string

    transform(payload: LoginPayload) {
        // Simply return the payload directly to be assigned to this instance
        return {
            username: payload.username,
            password: payload.password,
        }
    }

    // Override the toPlain method to ensure correct property exposure
    toPlain() {
        // Direct approach to ensure we get the actual values
        return {
            username: this.username,
            password: this.password,
        }
    }
}

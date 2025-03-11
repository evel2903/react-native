import { injectable, inject } from 'inversiland'
import {
    IAuthRepository,
    IAuthRepositoryToken,
} from '../../Domain/Specifications/IAuthRepository'
import LoginPayload from '../Types/LoginPayload'
import { UseCase } from '@/src/Core/Application/UseCase'
import UserEntity from '@/src/Auth/Domain/Entities/UserEntity'

@injectable()
export default class LoginUseCase
    implements UseCase<LoginPayload, Promise<UserEntity>>
{
    constructor(
        @inject(IAuthRepositoryToken)
        private readonly authRepository: IAuthRepository
    ) {}

    public execute(payload: LoginPayload) {
        return this.authRepository.login(payload)
    }
}

import { injectable, inject } from 'inversiland'
import {
    IAuthRepository,
    IAuthRepositoryToken,
} from '../../Domain/Specifications/IAuthRepository'
import { UseCase } from '@/src/Core/Application/UseCase'

@injectable()
export default class LogoutUseCase implements UseCase<void, Promise<void>> {
    constructor(
        @inject(IAuthRepositoryToken)
        private readonly authRepository: IAuthRepository
    ) {}

    public execute() {
        return this.authRepository.logout()
    }
}

import { getModuleContainer, module } from 'inversiland'
import { AuthStore } from './Presentation/Stores/AuthStore/AuthStore'
import { IAuthRepositoryToken } from './Domain/Specifications/IAuthRepository'
import AuthRepository from './Infrastructure/Implementations/AuthRepository'
import LoginUseCase from './Application/UseCases/LoginUseCase'
import LogoutUseCase from './Application/UseCases/LogoutUseCase'

@module({
    providers: [
        {
            provide: IAuthRepositoryToken,
            useClass: AuthRepository,
        },
        LoginUseCase,
        LogoutUseCase,
        {
            useClass: AuthStore,
            scope: 'Transient',
        },
    ],
})
export class AuthModule {}

export const authModuleContainer = getModuleContainer(AuthModule)

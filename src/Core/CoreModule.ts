import { getModuleContainer, module } from 'inversiland'
import I18n from './Presentation/I18n/Index'
import HttpClient from './Infrastructure/Implementations/HttpClient'
import { IHttpClientToken } from './Domain/Specifications/IHttpClient'
import Env, { EnvToken } from './Domain/Entities/Env'

@module({
    providers: [
        I18n,
        {
            isGlobal: true,
            provide: EnvToken,
            useValue: {
                apiUrl: process.env.EXPO_PUBLIC_API_URL,
            } as Env,
        },
        {
            isGlobal: true,
            provide: IHttpClientToken,
            useClass: HttpClient,
        },
    ],
})
export class CoreModule {}

export const coreModuleContainer = getModuleContainer(CoreModule)

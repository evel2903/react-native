import { registerRootComponent } from 'expo'
import { Inversiland } from 'inversiland'
import App from './Core/Presentation/App'
import AppModule from './AppModule'

Inversiland.options.defaultScope = 'Singleton'
Inversiland.run(AppModule)

registerRootComponent(App)

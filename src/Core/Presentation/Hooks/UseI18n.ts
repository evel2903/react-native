import { useMemo } from 'react'
import { coreModuleContainer } from '@/src/Core/CoreModule'
import I18n from '../I18n/Index'

export const useI18n = () => {
    const i18n = useMemo(() => {
        return coreModuleContainer.get(I18n)
    }, [])

    return i18n
}

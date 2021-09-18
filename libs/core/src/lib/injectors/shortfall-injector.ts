import { InjectionToken } from '@angular/core'
import { ShortfallProductInfoModel } from '@fe-commerce/shared'

export const SHORTFALL_DATA = new InjectionToken<{ productList: ShortfallProductInfoModel[] }>('ShortfallData')

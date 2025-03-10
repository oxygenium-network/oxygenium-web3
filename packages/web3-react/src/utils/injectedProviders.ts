/*
Copyright 2018 - 2022 The Oxygenium Authors
This file is part of the oxygenium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import {
  oxygeniumProvider,
  OxygeniumWindowObject,
  getDefaultOxygeniumWallet,
  getWalletObject,
  isWalletObj,
  providerInitializedEvent
} from '@oxygenium/get-extension-wallet'
import { InjectedProviderId } from '../types'

export type InjectedProviderListener = (providers: OxygeniumWindowObject[]) => void

function createProviderStore() {
  const listeners: Set<InjectedProviderListener> = new Set()
  let allProviders: OxygeniumWindowObject[] = []

  const addNewProvider = (provider: OxygeniumWindowObject) => {
    if (allProviders.find((p) => p.icon === provider.icon) === undefined) {
      allProviders.push(provider)
      listeners.forEach((listener) => listener([...allProviders]))
    }
  }

  const detectOneKeyProvider = () => {
    const oneKeyProvider = window['oxygenium']
    if (!!oneKeyProvider && isWalletObj(oneKeyProvider)) {
      addNewProvider(oneKeyProvider)
    }
  }

  const detectDefaultProvider = () => {
    const defaultProvider = getWalletObject(oxygeniumProvider.id)
    if (defaultProvider !== undefined) {
      addNewProvider(defaultProvider)
      return
    }

    window.addEventListener(
      providerInitializedEvent(oxygeniumProvider.id),
      () => {
        const defaultProvider = getWalletObject(oxygeniumProvider.id)
        if (defaultProvider !== undefined) {
          addNewProvider(defaultProvider)
        }
      },
      { once: true }
    )
  }

  const detectProviders = () => {
    if (typeof window !== 'undefined') {
      detectOneKeyProvider()
      detectDefaultProvider()

      const handler = (event) => {
        if (!!event.detail && isWalletObj(event.detail.provider)) {
          addNewProvider(event.detail.provider)
        }
      }
      window.addEventListener('announceOxygeniumProvider', handler)
      window.dispatchEvent(new Event('requestOxygeniumProvider'))
      return () => window.removeEventListener('announceOxygeniumProvider', handler)
    }
    return undefined
  }

  let cancel = detectProviders()

  return {
    getProviders: () => {
      return allProviders
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reset: () => {
      allProviders = []
      cancel?.()
      cancel = detectProviders()
    }
  }
}

export const injectedProviderStore = createProviderStore()

export function getInjectedProviderId(provider: OxygeniumWindowObject): InjectedProviderId {
  if (provider.icon.includes('onekey')) {
    return 'OneKey'
  }
  if (provider.id === 'oxygenium' && provider.name === 'Oxygenium') {
    return 'Oxygenium'
  }
  return provider.name
}

export async function getInjectedProvider(
  providers: OxygeniumWindowObject[],
  id?: InjectedProviderId
): Promise<OxygeniumWindowObject | undefined> {
  if (id === undefined) return getDefaultOxygeniumWallet()
  return providers.find((p) => getInjectedProviderId(p) === id)
}

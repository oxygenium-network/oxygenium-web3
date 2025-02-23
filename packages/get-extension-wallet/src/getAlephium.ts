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
import { oxygeniumProvider, checkProviderMetadata, knownProviders } from './knownProviders'
import { OxygeniumWindowObject, providerInitializedEvent, WalletProvider } from './types'

export function getDefaultOxygeniumWallet(): Promise<OxygeniumWindowObject | undefined> {
  return getKnownWallet(oxygeniumProvider)
}

export async function scanKnownWallets(): Promise<OxygeniumWindowObject[]> {
  const wallets: OxygeniumWindowObject[] = []
  for (const provider of knownProviders) {
    const wallet = await getKnownWallet(provider)
    if (wallet !== undefined) {
      wallets.push(wallet)
    }
  }
  return wallets
}

export function getKnownWallet(provider: WalletProvider): Promise<OxygeniumWindowObject | undefined> {
  return new Promise<OxygeniumWindowObject | undefined>((resolve) => {
    const fetch = () => {
      const wallet = getWalletObject(provider.id)
      if (!!wallet && checkProviderMetadata(wallet, provider)) {
        resolve(wallet)
      }
    }

    window.addEventListener(providerInitializedEvent(provider.id), fetch)
    fetch()
    setTimeout(() => resolve(undefined), 5000) // We only try for 5 seconds
  })
}

export function getWalletObject(id: string): OxygeniumWindowObject | undefined {
  try {
    const providers = window['oxygeniumProviders']
    if (!providers) {
      return undefined
    }
    const wallet = providers[id]
    if (!isWalletObj(wallet)) {
      return undefined
    }
    return wallet
  } catch (error) {
    console.error(error)
  }
  return undefined
}

export function isWalletObj(wallet: any): boolean {
  try {
    return (
      wallet &&
      [
        // wallet's must have methods/members, see OxygeniumWindowObject
        'id',
        'name',
        'icon',
        'unsafeEnable',
        'isPreauthorized',
        'nodeProvider',
        'explorerProvider',
        'signAndSubmitTransferTx',
        'signAndSubmitDeployContractTx',
        'signAndSubmitExecuteScriptTx',
        'signAndSubmitUnsignedTx',
        'signUnsignedTx',
        'signMessage'
      ].every((key) => key in wallet)
    )
  } catch (error) {
    console.error(error)
  }
  return false
}

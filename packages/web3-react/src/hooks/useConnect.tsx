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
import { getDefaultOxygeniumWallet } from '@oxygenium/get-extension-wallet'
import { NetworkId } from '@oxygenium/web3'
import { useOxygeniumConnectContext, useConnectSettingContext } from '../contexts/oxygeniumConnect'
import { useCallback, useMemo } from 'react'
import { WalletConnectProvider } from '@oxygenium/walletconnect-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'

const WALLET_CONNECT_PROJECT_ID = '6e2562e43678dd68a9070a62b6d52207'

export interface ConnectOptions {
  addressGroup?: number
  networkId: NetworkId
}

export function useConnect(options: ConnectOptions) {
  const settings = useConnectSettingContext()
  const context = useOxygeniumConnectContext()

  const wcDisconnect = useCallback(async () => {
    if (
      (settings.connectorId === 'walletConnect' || settings.connectorId === 'desktopWallet') &&
      context.signerProvider
    ) {
      await (context.signerProvider as WalletConnectProvider).disconnect()
      context.setSignerProvider(undefined)
      context.setAccount(undefined)
    }
  }, [settings.connectorId])

  const wcConnect = useCallback(async () => {
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: options.networkId,
      addressGroup: options.addressGroup,
      onDisconnected: wcDisconnect
    })

    wcProvider.on('displayUri', (uri) => {
      QRCodeModal.open(uri, () => console.log('qr closed'))
    })

    try {
      await wcProvider.connect()

      if (wcProvider.account) {
        context.setAccount({ ...wcProvider.account, network: options.networkId })
        context.setSignerProvider(wcProvider as any)
      }
    } catch (e) {
      console.log('wallet connect error')
      console.error(e)
    }

    QRCodeModal.close()
  }, [options, wcDisconnect])

  const desktopWalletConnect = useCallback(async () => {
    const wcProvider = await WalletConnectProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      networkId: options.networkId,
      addressGroup: options.addressGroup,
      onDisconnected: wcDisconnect
    })

    wcProvider.on('displayUri', (uri) => {
      window.open(`oxygenium://wc?uri=${uri}`)
    })

    try {
      await wcProvider.connect()

      if (wcProvider.account) {
        context.setAccount({ ...wcProvider.account, network: options.networkId })
        context.setSignerProvider(wcProvider as any)
      }
    } catch (e) {
      console.log('wallet connect error')
      console.error(e)
    }
  }, [options, wcDisconnect])

  const disconnectOxygenium = () => {
    getDefaultOxygeniumWallet()
      .then((oxygenium) => {
        if (!!oxygenium) {
          oxygenium.disconnect()
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
  }

  const enableOptions = useMemo(() => {
    return {
      ...options,
      keyType: settings.keyType,
      onDisconnected: () => {
        context.setSignerProvider(undefined)
        context.setAccount(undefined)
      }
    }
  }, [options, settings.keyType])

  const connectOxygenium = useCallback(async () => {
    const windowOxygenium = await getDefaultOxygeniumWallet()

    const enabledAccount = await windowOxygenium?.enable(enableOptions).catch(() => undefined) // Need to catch the exception here

    if (windowOxygenium && enabledAccount) {
      context.setSignerProvider(windowOxygenium)
      context.setAccount({ ...enabledAccount, network: enableOptions.networkId })
    }

    return enabledAccount
  }, [enableOptions])

  const autoConnectOxygenium = useCallback(async () => {
    const windowOxygenium = await getDefaultOxygeniumWallet()

    const enabledAccount = await windowOxygenium?.enableIfConnected(enableOptions).catch(() => undefined) // Need to catch the exception here

    if (windowOxygenium && enabledAccount) {
      context.setSignerProvider(windowOxygenium)
      context.setAccount({ ...enabledAccount, network: enableOptions.networkId })
    }
  }, [enableOptions])

  return useMemo(
    () =>
      ({
        injected: { connect: connectOxygenium, disconnect: disconnectOxygenium, autoConnect: autoConnectOxygenium },
        walletConnect: { connect: wcConnect, disconnect: wcDisconnect },
        desktopWallet: { connect: desktopWalletConnect, disconnect: wcDisconnect }
      }[settings.connectorId]),
    [settings.connectorId]
  )
}

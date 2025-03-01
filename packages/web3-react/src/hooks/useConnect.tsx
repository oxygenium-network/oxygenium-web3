/*
Copyright 2018 - 2022 The Alephium Authors
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
import { useAlephiumConnectContext, useConnectSettingContext } from '../contexts/oxygeniumConnect'
import { useCallback, useMemo } from 'react'
import { removeLastConnectedAccount } from '../utils/storage'
import { ConnectResult } from '../utils/connector'
import { InjectedProviderId } from '../types'

export function useConnect() {
  const { connectorId } = useConnectSettingContext()
  const {
    signerProvider,
    setSignerProvider,
    setConnectionStatus,
    setAccount,
    addressGroup,
    network,
    keyType,
    connectors
  } = useAlephiumConnectContext()

  const onDisconnected = useCallback(() => {
    removeLastConnectedAccount()
    setSignerProvider(undefined)
    setAccount(undefined)
  }, [setSignerProvider, setAccount])

  const onConnected = useCallback(
    (connectResult: ConnectResult) => {
      setAccount(connectResult.account)
      setSignerProvider(connectResult.signerProvider)
    },
    [setAccount, setSignerProvider]
  )

  const connectOptions = useMemo(() => {
    return {
      network,
      addressGroup,
      keyType,
      onDisconnected,
      onConnected
    }
  }, [onDisconnected, onConnected, network, addressGroup, keyType])

  const connector = useMemo(() => {
    return connectors[`${connectorId}`]
  }, [connectorId, connectors])

  const connect = useMemo(() => {
    return async (injectedProviderId?: InjectedProviderId) => {
      setConnectionStatus('connecting')
      return await connector.connect({ ...connectOptions, injectedProviderId })
    }
  }, [connector, connectOptions, setConnectionStatus])

  const disconnect = useMemo(() => {
    return async () => {
      if (signerProvider) {
        await connector.disconnect(signerProvider)
      }
    }
  }, [connector, signerProvider])

  return useMemo(() => ({ connect, disconnect }), [connect, disconnect])
}

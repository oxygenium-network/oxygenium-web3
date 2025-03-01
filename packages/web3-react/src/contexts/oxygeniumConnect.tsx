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
import React, { createContext, useContext } from 'react'

import { Account, KeyType, SignerProvider, NetworkId } from '@oxygenium/web3'
import { Theme, Mode, CustomTheme, ConnectorId } from '../types'
import { node } from '@oxygenium/web3'
import { Connectors } from '../utils/connector'

type Error = string | React.ReactNode | null

export type ConnectSettingValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  route: string
  setRoute: React.Dispatch<React.SetStateAction<string>>
  errorMessage: Error
  connectorId: ConnectorId
  setConnectorId: React.Dispatch<React.SetStateAction<ConnectorId>>
  displayAccount?: (account: Account) => string
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  mode: Mode
  setMode: React.Dispatch<React.SetStateAction<Mode>>
  customTheme: CustomTheme
  setCustomTheme: React.Dispatch<React.SetStateAction<CustomTheme>>
  csrModeOnly: boolean // whether to show the connect button only in CSR mode
}

export const ConnectSettingContext = createContext<ConnectSettingValue | null>(null)

export const useConnectSettingContext = () => {
  const context = useContext(ConnectSettingContext)
  if (!context) throw Error('ConnectSetting Hook must be inside a Provider.')
  return context
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export type OxygeniumConnectContextValue = {
  addressGroup?: number
  setAddressGroup: (addressGroup: number | undefined) => void
  keyType: KeyType
  setKeyType: (keyType: KeyType) => void
  network: NetworkId
  setNetwork: (network: NetworkId) => void
  account?: Account
  setAccount: (account: Account | undefined) => void
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void
  signerProvider?: SignerProvider
  setSignerProvider: (signerProvider: SignerProvider | undefined) => void
  connectors: Connectors
}

export const OxygeniumConnectContext = createContext<OxygeniumConnectContextValue | null>(null)

// Use hooks `useWallet` and `useWalletConfig` instead
export const useOxygeniumConnectContext = () => {
  const context = useContext(OxygeniumConnectContext)
  if (!context) throw Error('OxygeniumConnect Hook must be inside a Provider.')
  return context
}

export type OxygeniumBalanceContextValue = {
  balance?: node.Balance
  updateBalance: () => void
  updateBalanceForTx: (txId: string, confirmations?: number) => void
}

export const OxygeniumBalanceContext = createContext<OxygeniumBalanceContextValue | null>(null)

// Use hook `useBalance` instead
export const useOxygeniumBalanceContext = () => {
  const context = useContext(OxygeniumBalanceContext)
  if (!context) throw Error('OxygeniumBalance Hook must be inside a Provider.')
  return context
}

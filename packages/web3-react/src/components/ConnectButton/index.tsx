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
import React from 'react'
import useIsMounted from '../../hooks/useIsMounted'

import { TextContainer } from './styles'
import { useOxygeniumConnectContext, useConnectSettingContext } from '../../contexts/oxygeniumConnect'
import { AnimatePresence, Variants } from 'framer-motion'
import ThemedButton, { ThemeContainer } from '../Common/ThemedButton'
import { ResetContainer } from '../../styles'
import { truncatedAddress } from '../../utils'
import { Account } from '@oxygenium/web3'
import { routes } from '../Common/Modal'
import { useConnect } from '../../hooks/useConnect'

const contentVariants: Variants = {
  initial: {
    zIndex: 2,
    opacity: 0,
    x: '-100%'
  },
  animate: {
    opacity: 1,
    x: 0.1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  exit: {
    zIndex: 1,
    opacity: 0,
    x: '-100%',
    pointerEvents: 'none',
    position: 'absolute',
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

const addressVariants: Variants = {
  initial: {
    zIndex: 2,
    opacity: 0,
    x: '100%'
  },
  animate: {
    x: 0.2,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  exit: {
    zIndex: 1,
    x: '100%',
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

const textVariants: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  exit: {
    position: 'absolute',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1]
    }
  }
}

const defaultDisplayAccount = (account: Account) => account.address

type ConnectButtonRendererProps = {
  displayAccount?: (account: Account) => string
  children?: (renderProps: {
    show?: () => void
    hide?: () => void
    isConnected: boolean
    isConnecting: boolean
    disconnect: () => Promise<void>
    account?: Account
    truncatedAddress?: string
  }) => React.ReactNode
}

const ConnectButtonRenderer: React.FC<ConnectButtonRendererProps> = ({ displayAccount, children }) => {
  const isMounted = useIsMounted()
  const context = useConnectSettingContext()

  const { account } = useOxygeniumConnectContext()
  const { disconnect } = useConnect()

  function hide() {
    context.setOpen(false)
  }

  function show() {
    context.setOpen(true)
    context.setRoute(!!account ? routes.PROFILE : routes.CONNECTORS)
  }

  if (!children) return null
  if (!isMounted) return null

  const displayAddress = account ? (displayAccount ?? defaultDisplayAccount)(account) : undefined

  return (
    <>
      {children({
        show,
        hide,
        isConnected: !!account,
        isConnecting: context.open,
        disconnect,
        account: account,
        truncatedAddress: displayAddress ? truncatedAddress(displayAddress) : undefined
      })}
    </>
  )
}

ConnectButtonRenderer.displayName = 'OxygeniumConnectButton.Custom'

function OxygeniumConnectButtonInner({
  label,
  displayAccount
}: {
  label?: string
  separator?: string
  displayAccount: (account: Account) => string
}) {
  const { account } = useOxygeniumConnectContext()

  return (
    <AnimatePresence initial={false}>
      {!!account ? (
        <TextContainer
          key="connectedText"
          initial={'initial'}
          animate={'animate'}
          exit={'exit'}
          variants={addressVariants}
          style={{
            height: 40
          }}
        >
          <div
            style={{
              position: 'relative',
              paddingRight: 0
            }}
          >
            <AnimatePresence initial={false}>
              <TextContainer
                key="ckTruncatedAddress"
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={textVariants}
                style={{
                  position: 'relative'
                }}
              >
                {truncatedAddress(displayAccount(account))}
              </TextContainer>
            </AnimatePresence>
          </div>
        </TextContainer>
      ) : (
        <TextContainer
          key="connectWalletText"
          initial={'initial'}
          animate={'animate'}
          exit={'exit'}
          variants={contentVariants}
          style={{
            height: 40
            //padding: '0 5px',
          }}
        >
          {label ? label : 'Connect Oxygenium'}
        </TextContainer>
      )}
    </AnimatePresence>
  )
}

type OxygeniumConnectButtonProps = {
  // Options
  label?: string

  // Events
  onClick?: (open: () => void) => void

  displayAccount?: (account: Account) => string
}

export function OxygeniumConnectButton({ label, onClick, displayAccount }: OxygeniumConnectButtonProps) {
  const isMounted = useIsMounted()

  const context = useConnectSettingContext()
  const { account } = useOxygeniumConnectContext()
  const isConnected = !!account

  function show() {
    context.setOpen(true)
    context.setRoute(isConnected ? routes.PROFILE : routes.CONNECTORS)
  }

  if (!context.csrModeOnly && !isMounted) return null

  return (
    <ResetContainer $useTheme={context.theme} $useMode={context.mode} $customTheme={context.customTheme}>
      <ThemeContainer
        onClick={() => {
          if (onClick) {
            onClick(show)
          } else {
            show()
          }
        }}
      >
        <ThemedButton
          theme={context.theme}
          mode={context.mode}
          customTheme={context.customTheme}
          style={{
            overflow: 'hidden'
          }}
        >
          <OxygeniumConnectButtonInner
            label={label}
            displayAccount={displayAccount ?? ((account: Account) => account.address)}
          />
        </ThemedButton>
      </ThemeContainer>
    </ResetContainer>
  )
}

OxygeniumConnectButton.Custom = ConnectButtonRenderer

export const OxygeniumConnectButtonCustom = ConnectButtonRenderer

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
import { useEffect } from 'react'
import { useConnectSettingContext } from '../../contexts/oxygeniumConnect'
import Modal, { Page, routes } from '../Common/Modal'

import Connectors from '../Pages/Connectors'
import ConnectUsing from './ConnectUsing'
import Profile from '../Pages/Profile'
import { Theme, Mode, CustomTheme } from '../../types'
import { useConnect } from '../../hooks/useConnect'
import { useAccount } from '../../hooks/useAccount'

const customThemeDefault: object = {}

const ConnectModal: React.FC<{
  mode?: Mode
  theme?: Theme
  customTheme?: CustomTheme
}> = ({ mode = 'auto', theme = 'auto', customTheme = customThemeDefault }) => {
  const context = useConnectSettingContext()
  const account = useAccount()
  const isConnected = !!account
  const { autoConnect } = useConnect({
    networkId: context.network,
    addressGroup: context.addressGroup
  })

  useEffect(() => {
    if (autoConnect !== undefined && !isConnected) {
      autoConnect()
    }
  }, [autoConnect, isConnected])

  const closeable = true

  const showBackButton = context.route !== routes.CONNECTORS && context.route !== routes.PROFILE

  const onBack = () => {
    context.setRoute(routes.CONNECTORS)
  }

  const pages: Page[] = [
    { id: 'CONNECTORS', content: <Connectors /> },
    { id: 'CONNECT', content: <ConnectUsing connectorId={context.connectorId} /> },
    { id: 'PROFILE', content: <Profile /> }
  ]

  function hide() {
    context.setOpen(false)
  }

  useEffect(() => {
    if (isConnected) {
      if (context.route !== routes.PROFILE) {
        hide() // Hide on connect
      }
    } else {
      hide() // Hide on connect
    }
  }, [isConnected])

  useEffect(() => context.setMode(mode), [mode])
  useEffect(() => context.setTheme(theme), [theme])
  useEffect(() => context.setCustomTheme(customTheme), [customTheme])

  /* When pulling data into WalletConnect, it prioritises the og:title tag over the title tag */
  useEffect(() => {
    const appName = 'oxygenium'
    if (!appName || !context.open) return

    const title = document.createElement('meta')
    title.setAttribute('property', 'og:title')
    title.setAttribute('content', appName)
    document.head.prepend(title)

    /*
    // TODO:  When pulling data into WalletConnect, figure out which icon gets used and replace with appIcon if available
    const appIcon = getAppIcon();
    const icon = document.createElement('link');
    if (appIcon) {
      icon.setAttribute('rel', 'icon');
      icon.setAttribute('href', appIcon);
      document.head.prepend(icon);
    }*/

    return () => {
      document.head.removeChild(title)
      //if (appIcon) document.head.removeChild(icon);
    }
  }, [context.open])

  return (
    <Modal
      open={context.open}
      pages={pages}
      pageId={context.route}
      onClose={closeable ? hide : undefined}
      onInfo={undefined}
      onBack={showBackButton ? onBack : undefined}
    />
  )
}

export default ConnectModal

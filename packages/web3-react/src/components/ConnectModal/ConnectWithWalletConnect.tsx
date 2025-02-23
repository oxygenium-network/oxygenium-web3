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
import React, { useEffect, useState } from 'react'
import { PageContent } from '../Common/Modal/styles'
import { useConnectSettingContext } from '../../contexts/oxygeniumConnect'
import { Container } from './ConnectWithInjector/styles'
import { useConnect } from '../../hooks/useConnect'

let _init = false

const ConnectWithWalletConnect: React.FC = () => {
  const context = useConnectSettingContext()
  const [error, setError] = useState<string>()
  const { connect } = useConnect({
    addressGroup: context.addressGroup,
    networkId: context.network
  })

  useEffect(() => {
    if (_init) {
      return
    }

    connect()
      .then(() => {
        _init = true
        context.setOpen(false)
        setError(undefined)
      })
      .catch((err) => setError(`${err}`))
  }, [])

  return (
    <PageContent>
      <Container>{error !== undefined ? error : 'Connecting to wallet connect'}</Container>
    </PageContent>
  )
}

export default ConnectWithWalletConnect

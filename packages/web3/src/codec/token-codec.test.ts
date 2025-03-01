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

import { tokenCodec } from './token-codec'
import { randomContractId } from '@oxygenium/web3-test'
import { randomBytes } from 'crypto'
import { hexToBinUnsafe } from '../utils'

describe('Encode & decode tokens', function () {
  it('should encode & decode tokens', function () {
    for (let i = 0; i < 100; i++) {
      const tokenId = randomContractId()
      const amount = BigInt('0x' + randomBytes(31).toString('hex'))

      const token = {
        tokenId: hexToBinUnsafe(tokenId),
        amount: amount
      }

      const encoded = tokenCodec.encode(token)
      const decoded = tokenCodec.decode(encoded)
      expect(decoded).toEqual(token)
    }
  })
})

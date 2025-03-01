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

import { TOTAL_NUMBER_OF_GROUPS, groupOfAddress } from '@oxygenium/web3'
import { randomContractAddress } from './test-wallet'

describe('test-wallet', function () {
  it('should generate random contract id by group index', () => {
    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group += 1) {
      const contractAddress = randomContractAddress(group)
      expect(groupOfAddress(contractAddress)).toEqual(group)
    }
    expect(() => randomContractAddress(TOTAL_NUMBER_OF_GROUPS)).toThrow('Invalid group index')
    expect(() => randomContractAddress(-1)).toThrow('Invalid group index')
  })
})

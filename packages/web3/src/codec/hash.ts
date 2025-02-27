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
import blake from 'blakejs'

export function blakeHash(raw: Uint8Array) {
  return blake.blake2b(raw, undefined, 32)
}

export function djbIntHash(bytes: Uint8Array): number {
  let hash = 5381
  bytes.forEach((byte) => {
    hash = (hash << 5) + hash + (byte & 0xff)
  })
  return hash
}

export function createHint(input: Uint8Array): number {
  return djbIntHash(input) | 1
}

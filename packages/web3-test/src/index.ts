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

import 'cross-fetch/polyfill'

import {
  addressFromContractId,
  isBase58,
  NodeProvider,
  web3,
  ONE_OXM,
  OXM_TOKEN_ID,
  DUST_AMOUNT,
  Address,
  TOTAL_NUMBER_OF_GROUPS
} from '@oxygenium/web3'
import { NodeWallet, PrivateKeyWallet } from '@oxygenium/web3-wallet'
import { randomBytes } from 'crypto'

export const testMnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
export const testWalletName = 'oxygenium-web3-test-only-wallet'
export const testAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
export const testPrivateKey = 'a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'
export const testPassword = 'alph'

async function prepareWallet(testNodeProvider: NodeProvider) {
  const wallets = await testNodeProvider.wallets.getWallets()
  if (wallets.find((wallet) => wallet.walletName === testWalletName)) {
    await unlockWallet(testNodeProvider)
  } else {
    await createWallet(testNodeProvider)
  }
}

async function changeActiveAddress(testNodeProvider: NodeProvider) {
  await testNodeProvider.wallets.postWalletsWalletNameChangeActiveAddress(testWalletName, {
    address: testAddress
  })
}

async function createWallet(testNodeProvider: NodeProvider) {
  await testNodeProvider.wallets.putWallets({
    password: testPassword,
    mnemonic: testMnemonic,
    walletName: testWalletName,
    isMiner: true
  })
  await changeActiveAddress(testNodeProvider)
}

async function unlockWallet(testNodeProvider: NodeProvider) {
  await testNodeProvider.wallets.postWalletsWalletNameUnlock(testWalletName, { password: testPassword })
  await changeActiveAddress(testNodeProvider)
}

export async function testNodeWallet(baseUrl = 'http://127.0.0.1:22973'): Promise<NodeWallet> {
  const nodeProvider = new NodeProvider(baseUrl, undefined, (...params: Parameters<typeof fetch>) => fetch(...params))
  await prepareWallet(nodeProvider)
  const wallet = new NodeWallet(testWalletName, nodeProvider)
  await wallet.unlock(testPassword)
  return wallet
}

function tryGetDevnetNodeProvider(): NodeProvider {
  try {
    return web3.getCurrentNodeProvider()
  } catch (err) {
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    web3.setCurrentNodeProvider(nodeProvider)
    return nodeProvider
  }
}

function checkGroup(group: number) {
  if (group < 0 || group >= TOTAL_NUMBER_OF_GROUPS) {
    throw new Error('Invalid group index')
  }
}

export async function getSigner(alphAmount = ONE_OXM * 100n, group = 0): Promise<PrivateKeyWallet> {
  checkGroup(group)

  try {
    const nodeProvider = tryGetDevnetNodeProvider()
    const balances = await nodeProvider.addresses.getAddressesAddressBalance(testAddress)
    const availableBalance = BigInt(balances.balance) - BigInt(balances.lockedBalance)
    if (availableBalance < alphAmount) {
      throw new Error('Not enough balance, please restart the devnet')
    }
    const rootWallet = new PrivateKeyWallet({ privateKey: testPrivateKey })
    const wallet = PrivateKeyWallet.Random(group)
    const destinations = [{ address: wallet.address, attoAlphAmount: alphAmount }]
    await rootWallet.signAndSubmitTransferTx({ signerAddress: testAddress, destinations })
    return wallet
  } catch (_) {
    throw new Error('Failed to get signer, please restart the devnet')
  }
}

export async function getSigners(
  num: number,
  alphAmountPerSigner = ONE_OXM * 100n,
  group = 0
): Promise<PrivateKeyWallet[]> {
  checkGroup(group)

  try {
    const wallets: PrivateKeyWallet[] = []
    for (let index = 0; index < num; index++) {
      const wallet = await getSigner(alphAmountPerSigner, group)
      wallets.push(wallet)
    }
    return wallets
  } catch (_) {
    throw new Error('Failed to get signers, please restart the devnet')
  }
}

export async function transfer(from: PrivateKeyWallet, to: Address, tokenId: string, amount: bigint) {
  const destination = {
    address: to,
    attoAlphAmount: tokenId === OXM_TOKEN_ID ? amount : DUST_AMOUNT,
    tokens: tokenId === OXM_TOKEN_ID ? [] : [{ id: tokenId, amount }]
  }
  return await from.signAndSubmitTransferTx({ signerAddress: from.address, destinations: [destination] })
}

export async function expectAssertionError(p: Promise<unknown>, address: string, errorCode: number): Promise<void> {
  expect(isBase58(address)).toEqual(true)
  await expect(p).rejects.toThrowError(new RegExp(`AssertionFailedWithErrorCode\\\(${address},${errorCode}\\\)`, 'mg'))
}

export function randomContractId(): string {
  return randomBytes(32).toString('hex')
}

export function randomContractAddress(): string {
  return addressFromContractId(randomContractId())
}

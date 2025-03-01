# Oxygenium Web3

[![Github CI][test-badge]][test-link]
[![NPM][npm-badge]][npm-link]
[![code style: prettier][prettier-badge]][prettier-link]

A Typescript library for building decentralized applications on Oxygenium.

## Getting started

You could run the following command to scaffold a skeleton project for smart contract development:

```
npx @oxygenium/cli init <project-dir> [-t (base | react | nextjs)]
```

Please read the [documentation](https://docs.oxygenium.org/sdk/getting-started/) for more.

## Packages

There are a few packages in this repository:

1. `@oxygenium/cli` is the CLI tool for dApp development.
2. `@oxygenium/web3` is the core and base package for all dApp development.
3. `@oxygenium/web3-wallet` contains wallet related functions.
4. `@oxygenium/web3-test` contains test related functions.
5. `@oxygenium/web3-react` contains react components to help authenticate and interact with the Oxygenium blockchain
6. `@oxygenium/get-extension-wallet` contains functions to get the extension wallet object
6. `@oxygenium/walletconnect` contains Oxygenium's WalletConnect implementation

## Development

Please refer to `package.json`.


[test-badge]: https://github.com/oxygenium-network/oxygenium-web3/actions/workflows/test.yml/badge.svg
[test-link]: https://github.com/oxygenium-network/oxygenium-web3/actions/workflows/test.yml
[npm-badge]: https://img.shields.io/npm/v/@oxygenium/web3.svg
[npm-link]: https://www.npmjs.org/package/@oxygenium/web3
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-link]: https://github.com/prettier/prettier
[release-notes]: https://github.com/oxygenium-network/oxygenium-web3/releases

<!-- logo -->

![Oxygenium Logo](https://raw.githubusercontent.com/oxygenium-network/oxygenium-brand-guide/master/logos/light/Logo-Horizontal-Light.png#gh-dark-mode-only) ![Oxygenium Logo](https://raw.githubusercontent.com/oxygenium-network/oxygenium-brand-guide/master/logos/dark/Logo-Horizontal-Dark.png#gh-light-mode-only)

---

<h2> Table of contents</h2>

- [Install from sources](#-install-from-sources)
- [Development](#-development)
- [Example](#-example)
- [Credits](#-credits)

## Install from sources

First clone this repository on your machine then run:

```bash
npm install
npm run build
```

## Development

To setup the repo on your machine just run:

```bash
npm install
npm run dev
```

## Example

To add a auth button to your react/nextjs app, simply wrap your app
with `OxygeniumWalletProvider` component and add the
`OxygeniumWalletProvider` component.

```typescript
const App = () => {
  return (
    <OxygeniumWalletProvider useTheme="win95">
      /* Your App */
      <OxygeniumConnectButton />
    </OxygeniumWalletProvider>
  );
```

`useTheme` is optional, there are [a
dozon](https://github.com/oxygenium-network/oxygenium-web3-react/blob/99bdf241dd48992872fb5b8346460af88e0060e6/src/types.ts#L1)
themes that can be chosen from.

## Credits

We have built this project on top of
[ConnectKit](https://github.com/family/connectkit)'s codebase. We
would like to take this oppurtunity to thank all the
[contributors](https://github.com/family/connectkit/graphs/contributors)
of the ConnectKit project ❤️


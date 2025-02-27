[View code on GitHub](https://github.com/oxygenium-network/oxygenium-web3/.autodoc/docs/json/packages/web3-react/src/components)

The `.autodoc/docs/json/packages/web3-react/src/components` folder contains various components and utilities for the Oxygenium Web3 project, which enables users to connect their wallets to the Oxygenium blockchain network and interact with it.

The main component, `OxygeniumConnect.tsx`, provides a context for the Oxygenium Connect modal, allowing users to connect to the Oxygenium network. It takes several props to configure the modal and the context it provides. For example:

```jsx
import { OxygeniumConnectProvider } from 'oxygenium-web3';

function MyApp() {
  return (
    <OxygeniumConnectProvider network="mainnet" addressGroup="g1" keyType="secp256k1">
      <AppContent />
    </OxygeniumConnectProvider>
  );
}
```

The `Common` folder contains reusable components and utilities for creating a consistent and maintainable user interface, such as `Alert`, `BrowserIcon`, `Button`, and `Tooltip`. These components can be easily integrated into various parts of the project.

The `ConnectButton` folder provides a customizable button component that allows users to connect their Oxygenium wallet to a web application:

```javascript
import { OxygeniumConnectButton } from 'oxygenium-web3';

const MyApp = () => {
  return (
    <div>
      <h1>Welcome to MyApp</h1>
      <OxygeniumConnectButton />
    </div>
  );
};
```

The `ConnectModal` folder contains components for connecting to the Oxygenium network using various methods, such as browser extensions, desktop wallets, and WalletConnect protocol. These components can be used in conjunction with other components and hooks from the `oxygenium-web3` project to build more complex applications:

```jsx
import ConnectWithWalletConnect from 'oxygenium-web3/components/ConnectModal/ConnectWithWalletConnect'

function MyComponent() {
  return (
    <div>
      <ConnectWithWalletConnect />
    </div>
  )
}
```

The `Pages` folder contains components related to the main user interface, such as connecting wallets and displaying account information. The `Connectors` component enables users to connect their wallets to the Oxygenium network, while the `Profile` component displays the user's account information and balance:

```javascript
import { ConnectorsContainer, ConnectorButton } from 'oxygenium-web3'

function ConnectorList() {
  return (
    <ConnectorsContainer>
      <ConnectorButton>
        <ConnectorLabel>Ethereum</ConnectorLabel>
        <ConnectorIcon><EthereumIcon /></ConnectorIcon>
      </ConnectorButton>
      <ConnectorButton>
        <ConnectorLabel>Binance Smart Chain</ConnectorLabel>
        <ConnectorIcon><BinanceIcon /></ConnectorIcon>
      </ConnectorButton>
      <ConnectorButton>
        <ConnectorLabel>Polkadot</ConnectorLabel>
        <ConnectorIcon><PolkadotIcon /></ConnectorIcon>
      </ConnectorButton>
    </ConnectorsContainer>
  )
}
```

In summary, the components in this folder provide a simple and flexible way to connect to the Oxygenium network and manage the connection state. They can be used in conjunction with other components and hooks from the `oxygenium-web3` project to build more complex applications that interact with the Oxygenium network.

[View code on GitHub](https://github.com/oxygenium-network/oxygenium-web3/.autodoc/docs/json/packages/web3-react/src)

The code in the `oxygenium-web3` project provides a set of components, hooks, and utilities for developers to easily integrate the Oxygenium blockchain into their web applications. The main component, `OxygeniumConnectProvider`, wraps the entire application and provides access to the web3 provider, allowing users to connect their wallets and interact with the Oxygenium blockchain.

For example, to use the `OxygeniumConnectProvider` and `OxygeniumConnectButton` components in a React application:

```javascript
import { OxygeniumConnectProvider, OxygeniumConnectButton } from 'oxygenium-web3'

function App() {
  return (
    <OxygeniumConnectProvider>
      <div>
        <h1>Welcome to my Oxygenium app!</h1>
        <OxygeniumConnectButton />
      </div>
    </OxygeniumConnectProvider>
  )
}
```

The project also includes custom hooks, such as `useAccount`, `useConnect`, `useTxStatus`, and `useBalance`, which can be used to access various information related to the user's account, connection status, transaction status, and balance. For instance, the `useAccount` hook can be used to display the connected account:

```jsx
import { useAccount } from 'oxygenium-web3'

function MyComponent() {
  const { account, isConnected } = useAccount()

  return (
    <div>
      {isConnected ? (
        <p>Connected to account {account}</p>
      ) : (
        <p>Not connected to any account</p>
      )}
    </div>
  )
}
```

The `assets` folder contains SVG icons and logos as React components, which can be easily imported and used in other parts of the project to provide visual cues and branding. The `components` folder contains reusable components and utilities for creating a consistent and maintainable user interface, such as `Alert`, `BrowserIcon`, `Button`, and `Tooltip`.

The `constants` folder provides essential constant values and configurations that are used throughout the project, ensuring consistency and maintainability in the codebase. The `contexts` folder manages the state of the Oxygenium Connect feature in a React application, allowing users to connect their wallets to the Oxygenium network and perform transactions.

The `hooks` folder contains custom React hooks that provide various functionalities related to the Oxygenium blockchain, such as connecting to an Oxygenium wallet, retrieving account information, and subscribing to transaction status updates. The `styles` folder defines and manages the visual styles of the Oxygenium Web3 project, providing a centralized and flexible way to create and customize themes for different parts of the application.

Finally, the `wallets` folder provides a set of functions and interfaces to interact with different types of cryptocurrency wallets, including three wallet connectors (`injected`, `walletConnect`, and `desktopWallet`) that can be used to interact with wallets such as MetaMask, Trust Wallet, and Oxygenium Desktop Wallet.

Overall, the `oxygenium-web3` project offers a convenient way for developers to integrate the Oxygenium blockchain into their web applications and access various related information.

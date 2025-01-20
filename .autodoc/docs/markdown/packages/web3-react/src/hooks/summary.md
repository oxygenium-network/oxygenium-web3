[View code on GitHub](https://github.com/oxygenium/oxygenium-web3/.autodoc/docs/json/packages/web3-react/src/hooks)

The `hooks` folder in the `oxygenium-web3` project contains custom React hooks that provide various functionalities related to the Oxygenium blockchain. These hooks can be used in React components to interact with the Oxygenium wallet, retrieve account information, and subscribe to transaction status updates.

For instance, the `useAccount` hook connects to an Oxygenium wallet and retrieves the current account. It can be used in a React component to display the connected account:

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

The `useBalance` hook retrieves the user's balance for the Oxygenium cryptocurrency and can be used to display the balance in a component:

```jsx
import { useBalance } from 'oxygenium-web3'

function Balance() {
  const { balance } = useBalance()

  if (!balance) {
    return <div>Loading...</div>
  }

  return <div>Your balance is {balance.toString()}</div>
}
```

The `useConnect` hook provides functionality for connecting to different wallet providers and can be used to establish a connection with a specific provider:

```jsx
import { useConnect } from 'oxygenium-web3'

function ConnectButton() {
  const { connect } = useConnect()

  return (
    <button onClick={() => connect()}>Connect to Wallet</button>
  )
}
```

Other hooks in this folder, such as `useFitText`, `useFocusTrap`, `useIsMounted`, `usePrevious`, and `useTxStatus`, provide additional functionalities that can be used in various scenarios within the Oxygenium project. For example, the `useTxStatus` hook can be used to subscribe to the status of a transaction and display it in a component:

```jsx
import { useTxStatus } from './useTxStatus'

function MyComponent() {
  const { txStatus } = useTxStatus('0x123456789abcdef')

  if (txStatus === undefined) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <p>Transaction status: {txStatus.type}</p>
      <p>Transaction hash: {txStatus.hash}</p>
    </div>
  )
}
```

Overall, the hooks in this folder provide a convenient way to interact with the Oxygenium blockchain and wallet in a React application. They abstract away the complexities of connecting to the blockchain and provide a simple interface for developers to build user interfaces and interact with the Oxygenium network.

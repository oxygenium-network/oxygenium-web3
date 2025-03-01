[View code on GitHub](https://github.com/oxygenium/oxygenium-web3/.autodoc/docs/json/packages/cli/src)

The `cli/src` folder in the `oxygenium-web3` project contains code for generating TypeScript interfaces, deploying smart contracts and scripts, and managing configurations and networks. It is an essential part of the project, providing developers with tools to interact with the Oxygenium blockchain.

The `codegen.ts` file generates TypeScript code for contracts, scripts, and deployment files. This simplifies the process of interacting with the Oxygenium blockchain by providing a TypeScript interface for contracts and scripts. For example:

```typescript
import { MyContract, MyScript } from '@oxygenium/web3';

// Deploy a contract
const contractInstance = await MyContract.deploy(params);

// Call a contract method
const result = await contractInstance.methods.myMethod(params);

// Execute a script
const scriptResult = await MyScript.execute(params);
```

The `deployment.ts` file provides functionality to deploy contracts and execute scripts on the Oxygenium blockchain, as well as manage deployment results and configurations. It includes the `Deployments` class for managing deployment results, the `createDeployer` function for creating a `Deployer` object, and the `deploy` function for deploying contracts and executing scripts.

The `index.ts` file exports various modules from the project, making them available for use in other parts of the project. It exports from four different modules: `types`, `utils`, `deployment`, and `codegen`.

The `types.ts` file contains interfaces, functions, and classes for interacting with the Oxygenium blockchain and deploying contracts and scripts. It defines the `Network`, `Configuration`, `Environment`, `ExecutionResult`, `DeployContractExecutionResult`, `RunScriptResult`, `Deployer`, and `DeployFunction` interfaces.

The `utils.ts` file provides utility functions for loading and working with Oxygenium configurations and networks. It includes the `loadConfig`, `getConfigFile`, `isNetworkLive`, `isDevnetLive`, `getDeploymentFilePath`, and `getNetwork` functions.

In summary, the `cli/src` folder in the `oxygenium-web3` project provides essential tools for developers to interact with the Oxygenium blockchain. It simplifies the process of generating TypeScript interfaces, deploying smart contracts and scripts, and managing configurations and networks.

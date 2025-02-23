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

import {
  Account,
  NodeProvider,
  Project,
  Contract,
  Script,
  web3,
  Token,
  Number256,
  DeployContractParams,
  DeployContractResult,
  ExecuteScriptParams,
  ExecuteScriptResult,
  Fields,
  ContractFactory,
  addStdIdToFields,
  NetworkId,
  ContractInstance,
  ExecutableScript,
  ProjectArtifact
} from '@oxygenium/web3'
import { PrivateKeyWallet } from '@oxygenium/web3-wallet'
import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import * as cryptojs from 'crypto-js'
import {
  DeployContractExecutionResult,
  RunScriptResult,
  Network,
  Deployer,
  DeployFunction,
  Configuration,
  ExecutionResult,
  DEFAULT_CONFIGURATION_VALUES
} from './types'
import {
  getConfigFile,
  getDeploymentFilePath,
  getNetwork,
  loadConfig,
  retryFetch,
  waitTxConfirmed,
  waitUserConfirmation
} from './utils'
import { groupOfAddress } from '@oxygenium/web3'
import { codegen, genLoadDeployments } from './codegen'

export class Deployments {
  deployments: DeploymentsPerAddress[]

  constructor(deployments: DeploymentsPerAddress[]) {
    this.deployments = deployments
  }

  static empty(): Deployments {
    return new Deployments([])
  }

  isEmpty(): boolean {
    return this.deployments.length === 0 || this.deployments.every((d) => d.isEmpty())
  }

  deploymentsByGroup(group: number): DeploymentsPerAddress | undefined {
    return this.deployments.find((deployment) => groupOfAddress(deployment.deployerAddress) === group)
  }

  getDeployedContractResult(group: number, name: string): DeployContractExecutionResult | undefined {
    return this.deploymentsByGroup(group)?.contracts.get(name)
  }

  getExecutedScriptResult(group: number, name: string): RunScriptResult | undefined {
    return this.deploymentsByGroup(group)?.scripts.get(name)
  }

  add(deploymentsPerAddress: DeploymentsPerAddress): void {
    const index = this.deployments.findIndex(
      (deployment) => deployment.deployerAddress === deploymentsPerAddress.deployerAddress
    )
    if (index === -1) {
      this.deployments.push(deploymentsPerAddress)
    } else {
      this.deployments[`${index}`] = deploymentsPerAddress
    }
  }

  getByDeployer(deployerAddress: string): DeploymentsPerAddress | undefined {
    return this.deployments.find((deployment) => deployment.deployerAddress === deployerAddress)
  }

  async saveToFile(filepath: string, config: Configuration, deploymentSuccessful: boolean): Promise<void> {
    const dirpath = path.dirname(filepath)
    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath, { recursive: true })
    }
    const deployments = this.deployments.map((v) => v.marshal())
    const content = JSON.stringify(
      deployments.length === 1 ? deployments[0] : deployments,
      (key, value) => {
        if (key === 'contractInstance' && value instanceof ContractInstance) {
          return {
            address: value.address,
            contractId: value.contractId,
            groupIndex: value.groupIndex
          }
        }
        return value
      },
      2
    )
    await fsPromises.writeFile(filepath, content)
    // This needs to be at the end since it will check if the deployments file exists
    if (deploymentSuccessful) {
      try {
        await genLoadDeployments(config)
      } catch (error) {
        console.log(`failed to generate deployments.ts, error: ${error}`)
      }
    }
  }

  static async from(filepath: string): Promise<Deployments> {
    if (!fs.existsSync(filepath)) {
      return Deployments.empty()
    }
    try {
      const content = await fsPromises.readFile(filepath)
      const json = JSON.parse(content.toString())
      const objects = Array.isArray(json) ? json : [json]
      return new Deployments(objects.map((object) => DeploymentsPerAddress.unmarshal(object)))
    } catch (error) {
      console.log(`Failed to parse deployments, error: ${error}, will re-deploy the contract`)
      return Deployments.empty()
    }
  }

  static async load(configuration: Configuration, networkId: NetworkId): Promise<Deployments> {
    const deploymentsFile = getDeploymentFilePath(configuration, networkId)
    return Deployments.from(deploymentsFile)
  }
}

export async function getDeploymentResult(filepath: string): Promise<DeploymentsPerAddress> {
  const deployments = await Deployments.from(filepath)
  if (deployments.deployments.length > 1) {
    throw new Error('The contracts has been deployed to multiple groups')
  }
  return deployments.deployments[0]
}

export async function getDeploymentResults(filepath: string): Promise<DeploymentsPerAddress[]> {
  const deployments = await Deployments.from(filepath)
  return deployments.deployments
}

export class DeploymentsPerAddress {
  deployerAddress: string
  contracts: Map<string, DeployContractExecutionResult>
  scripts: Map<string, RunScriptResult>
  migrations: Map<string, number>

  constructor(
    deployerAddress: string,
    contracts: Map<string, DeployContractExecutionResult>,
    scripts: Map<string, RunScriptResult>,
    migrations: Map<string, number>
  ) {
    this.deployerAddress = deployerAddress
    this.contracts = contracts
    this.scripts = scripts
    this.migrations = migrations
  }

  static empty(deployerAddress: string): DeploymentsPerAddress {
    return new DeploymentsPerAddress(deployerAddress, new Map(), new Map(), new Map())
  }

  isEmpty(): boolean {
    return this.contracts.size === 0 && this.scripts.size === 0 && this.migrations.size === 0
  }

  marshal(): any {
    return {
      deployerAddress: this.deployerAddress,
      contracts: Object.fromEntries(this.contracts),
      scripts: Object.fromEntries(this.scripts),
      migrations: Object.fromEntries(this.migrations)
    }
  }

  static unmarshal(json: any): DeploymentsPerAddress {
    const deployerAddress = json.deployerAddress as string
    const contracts = new Map(Object.entries<DeployContractExecutionResult>(json.contracts))
    const scripts = new Map(Object.entries<RunScriptResult>(json.scripts))
    const migrations = new Map(Object.entries<number>(json.migrations))
    return new DeploymentsPerAddress(deployerAddress, contracts, scripts, migrations)
  }
}

async function isTxExists(provider: NodeProvider, txId: string): Promise<boolean> {
  const txStatus = await provider.transactions.getTransactionsStatus({ txId: txId })
  return txStatus.type !== 'TxNotFound'
}

export function recordEqual(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }
  for (const key of leftKeys) {
    if (left[`${key}`] !== right[`${key}`]) {
      return false
    }
  }
  return true
}

async function needToRetry(
  provider: NodeProvider,
  previous: ExecutionResult | undefined,
  attoAlphAmount: string | undefined,
  tokens: Record<string, string> | undefined,
  codeHash: string
): Promise<boolean> {
  if (previous === undefined || previous.codeHash !== codeHash) {
    return true
  }
  const txExists = await isTxExists(provider, previous.txId)
  if (!txExists) {
    return true
  }
  const currentTokens = tokens ? tokens : {}
  const previousTokens = previous.tokens ? previous.tokens : {}
  const sameWithPrevious = attoAlphAmount === previous.attoAlphAmount && recordEqual(currentTokens, previousTokens)
  return !sameWithPrevious
}

async function needToDeployContract(
  provider: NodeProvider,
  previous: DeployContractExecutionResult | undefined,
  attoAlphAmount: string | undefined,
  tokens: Record<string, string> | undefined,
  issueTokenAmount: string | undefined,
  codeHash: string
): Promise<boolean> {
  const retry = await needToRetry(provider, previous, attoAlphAmount, tokens, codeHash)
  if (retry) {
    return true
  }
  // previous !== undefined if retry is false
  return previous!.issueTokenAmount !== issueTokenAmount
}

async function needToRunScript(
  provider: NodeProvider,
  previous: RunScriptResult | undefined,
  attoAlphAmount: string | undefined,
  tokens: Record<string, string> | undefined,
  codeHash: string
): Promise<boolean> {
  return needToRetry(provider, previous, attoAlphAmount, tokens, codeHash)
}

function getTokenRecord(tokens: Token[]): Record<string, string> {
  return tokens.reduce<Record<string, string>>((acc, token) => {
    acc[token.id] = token.amount.toString()
    return acc
  }, {})
}

function getTaskId(code: Contract | Script, taskTag?: string): string {
  if (taskTag === undefined) return code.name
  const taskTagRegex = new RegExp('^[a-zA-Z0-9_-]*$')
  if (!taskTagRegex.test(taskTag)) {
    throw new Error(`Invalid task tag, the task tag must match the pattern: ${taskTagRegex.source}`)
  }
  return `${code.name}:${taskTag}`
}

function createDeployer<Settings = unknown>(
  network: Network<Settings>,
  signer: PrivateKeyWallet,
  deployContractResults: Map<string, DeployContractExecutionResult>,
  runScriptResults: Map<string, RunScriptResult>,
  requestInterval: number
): Deployer {
  const account: Account = {
    keyType: 'default',
    address: signer.address,
    group: signer.group,
    publicKey: signer.publicKey
  }
  const confirmations = network.confirmations ? network.confirmations : 1

  const deployContract = async <T extends ContractInstance, P extends Fields>(
    contractFactory: ContractFactory<T, P>,
    params: DeployContractParams<P>,
    taskTag?: string
  ): Promise<DeployContractResult<T>> => {
    const initialFields = addStdIdToFields(contractFactory.contract, params.initialFields ?? {})
    const initFieldsAndByteCode = contractFactory.contract.buildByteCodeToDeploy(initialFields)
    const codeHash = cryptojs.SHA256(initFieldsAndByteCode).toString()
    const taskId = getTaskId(contractFactory.contract, taskTag)
    const previous = deployContractResults.get(taskId)
    const tokens = params.initialTokenAmounts ? getTokenRecord(params.initialTokenAmounts) : undefined
    const needToDeploy = await needToDeployContract(
      web3.getCurrentNodeProvider(),
      previous,
      tryBigIntToString(params.initialAttoAlphAmount),
      tokens,
      tryBigIntToString(params.issueTokenAmount),
      codeHash
    )
    if (!needToDeploy) {
      // we have checked in `needToDeployContract`
      console.log(`The deployment of contract ${taskId} is skipped as it has been deployed`)
      const previousDeployResult = previous!
      const contractInstance = contractFactory.at(previousDeployResult.contractInstance.address)
      return {
        ...previousDeployResult,
        contractInstance
      }
    }
    console.log(`Deploying contract ${taskId}`)
    console.log(`Deployer - group ${signer.group} - ${signer.address}`)
    const deployResult = await contractFactory.deploy(signer, params)
    const confirmed = await waitTxConfirmed(
      web3.getCurrentNodeProvider(),
      deployResult.txId,
      confirmations,
      requestInterval
    )
    const result: DeployContractExecutionResult = {
      txId: deployResult.txId,
      unsignedTx: deployResult.unsignedTx,
      signature: deployResult.signature,
      gasPrice: deployResult.gasPrice.toString(),
      gasAmount: deployResult.gasAmount,
      blockHash: confirmed.blockHash,
      codeHash: codeHash,
      attoAlphAmount: tryBigIntToString(params.initialAttoAlphAmount),
      tokens: tokens,
      contractInstance: deployResult.contractInstance,
      issueTokenAmount: tryBigIntToString(params.issueTokenAmount)
    }
    deployContractResults.set(taskId, result)
    return deployResult
  }

  const runScript = async <P extends Fields>(
    executableScript: ExecutableScript<P>,
    params: ExecuteScriptParams<P>,
    taskTag?: string
  ): Promise<ExecuteScriptResult> => {
    const initFieldsAndByteCode = executableScript.script.buildByteCodeToDeploy(params.initialFields ?? {})
    const codeHash = cryptojs.SHA256(initFieldsAndByteCode).toString()
    const taskId = getTaskId(executableScript.script, taskTag)
    const previous = runScriptResults.get(taskId)
    const tokens = params.tokens ? getTokenRecord(params.tokens) : undefined
    const needToRun = await needToRunScript(
      web3.getCurrentNodeProvider(),
      previous,
      tryBigIntToString(params.attoAlphAmount),
      tokens,
      codeHash
    )
    if (!needToRun) {
      // we have checked in `needToRunScript`
      console.log(`The execution of script ${taskId} is skipped as it has been executed`)
      const previousExecuteResult = previous!
      return { ...previousExecuteResult }
    }
    console.log(`Executing script ${taskId}`)
    const executeResult = await executableScript.execute(signer, params)
    const confirmed = await waitTxConfirmed(
      web3.getCurrentNodeProvider(),
      executeResult.txId,
      confirmations,
      requestInterval
    )
    const runScriptResult: RunScriptResult = {
      ...executeResult,
      gasPrice: executeResult.gasPrice.toString(),
      blockHash: confirmed.blockHash,
      codeHash: codeHash,
      attoAlphAmount: tryBigIntToString(params.attoAlphAmount),
      tokens: tokens
    }
    runScriptResults.set(taskId, runScriptResult)
    return executeResult
  }

  const getDeployContractResult = (name: string): DeployContractExecutionResult => {
    const result = deployContractResults.get(name)
    if (result === undefined) {
      throw new Error(`Deployment result of contract "${name}" does not exist`)
    }
    return result
  }

  const getRunScriptResult = (name: string): RunScriptResult => {
    const result = runScriptResults.get(name)
    if (result === undefined) {
      throw new Error(`Execution result of script "${name}" does not exist`)
    }
    return result
  }

  return {
    provider: web3.getCurrentNodeProvider(),
    account: account,
    deployContract: deployContract,
    runScript: runScript,
    getDeployContractResult: getDeployContractResult,
    getRunScriptResult: getRunScriptResult
  }
}

async function getDeployScriptFiles(rootPath: string): Promise<string[]> {
  const regex = '^([0-9]+)_.*\\.(ts|js)$'
  const dirents = await fsPromises.readdir(rootPath, { withFileTypes: true })
  const scripts: { filename: string; order: number }[] = []
  for (const f of dirents) {
    if (!f.isFile()) continue
    const result = f.name.match(regex)
    if (result === null) continue
    const order = parseInt(result[1])
    scripts.push({ filename: f.name, order: order })
  }
  scripts.sort((a, b) => a.order - b.order)
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[`${i}`].order !== i) {
      throw new Error('Script should begin with number prefix that consecutively starts from 0')
    }
  }
  return scripts.map((f) => path.join(rootPath, f.filename))
}

async function validateChainParams(networkId: number, groups: number[]): Promise<void> {
  const chainParams = await web3.getCurrentNodeProvider().infos.getInfosChainParams()
  if (chainParams.networkId !== networkId) {
    throw new Error(`The node chain id ${chainParams.networkId} is different from configured chain id ${networkId}`)
  }
  if (groups.some((group, index) => groups.indexOf(group) !== index)) {
    throw new Error(`Found duplicated groups in: ${groups}`)
  }
  if (groups.length > chainParams.groups) {
    throw new Error(`The number of group cannot larger than ${chainParams.groups}`)
  }
  if (groups.some((group) => group >= chainParams.groups || group < 0)) {
    throw new Error(`Group indexes should be subset of [${[...Array(chainParams.groups).keys()]}]`)
  }
}

function getSigners(privateKeys: string[]): PrivateKeyWallet[] {
  if (privateKeys.length === 0) {
    throw new Error('No private key specified')
  }
  const signers = privateKeys.map((privateKey) => new PrivateKeyWallet({ privateKey }))
  const groups = signers.map((signer) => signer.group)
  const sameGroups = groups.filter((group, index) => groups.indexOf(group) !== index)
  if (sameGroups.length > 0) {
    throw new Error(`Duplicated private keys on group ${sameGroups}`)
  }
  return signers
}

function tryGetScriptsFromRange(scripts: string[], fromIndex?: number, toIndex?: number): string[] {
  const from = fromIndex ?? 0
  const to = toIndex ?? scripts.length - 1
  if (from > to) {
    throw new Error('The from index must not be greater than the to index')
  }
  if (from < 0 || to > scripts.length - 1) {
    throw new Error(`Invalid script range: [${from}, ${to}]`)
  }
  return scripts.slice(from, to + 1)
}

export async function deploy<Settings = unknown>(
  configuration: Configuration<Settings>,
  networkId: NetworkId,
  deployments: Deployments,
  fromIndex?: number,
  toIndex?: number
): Promise<boolean> {
  const network = getNetwork(configuration, networkId)
  if (typeof network === 'undefined') {
    throw new Error(`no network ${networkId} config`)
  }

  web3.setCurrentNodeProvider(network.nodeUrl, undefined, retryFetch)
  const projectRootDir = path.resolve(process.cwd())
  const prevProjectArtifact = await ProjectArtifact.from(projectRootDir)
  const artifactDir = configuration.artifactDir ?? DEFAULT_CONFIGURATION_VALUES.artifactDir
  await Project.build(
    configuration.compilerOptions,
    path.resolve(process.cwd()),
    configuration.sourceDir ?? DEFAULT_CONFIGURATION_VALUES.sourceDir,
    artifactDir
  )

  // When the contract has been deployed previously, and the contract
  // code has changed, ask the user to confirm whether to redeploy the contract
  if (
    !deployments.isEmpty() &&
    prevProjectArtifact !== undefined &&
    ProjectArtifact.isCodeChanged(Project.currentProject.projectArtifact, prevProjectArtifact)
  ) {
    // We need to regenerate the code because the deployment scripts depend on the generated ts code
    codegen(artifactDir)
    const msg =
      'The contract code has been changed, which will result in redeploying the contract.\nPlease confirm if you want to proceed?'
    if (!(await waitUserConfirmation(msg))) {
      return false
    }
  }

  const deployScriptsRootPath = configuration.deploymentScriptDir
    ? configuration.deploymentScriptDir
    : DEFAULT_CONFIGURATION_VALUES.deploymentScriptDir
  const allScriptFiles = await getDeployScriptFiles(path.resolve(deployScriptsRootPath))
  const scriptFiles = tryGetScriptsFromRange(allScriptFiles, fromIndex, toIndex)
  const scripts: { scriptFilePath: string; func: DeployFunction<Settings> }[] = []
  for (const scriptFilePath of scriptFiles) {
    try {
      /* eslint-disable @typescript-eslint/no-var-requires */
      const content = require(scriptFilePath)
      /* eslint-enable @typescript-eslint/no-var-requires */
      if (content.default) {
        scripts.push({
          scriptFilePath: scriptFilePath,
          func: content.default as DeployFunction<Settings>
        })
      } else {
        throw new Error(`no default deploy function exported from ${scriptFilePath}`)
      }
    } catch (error) {
      throw new Error(`failed to load deploy script, filepath: ${scriptFilePath}, error: ${error}`)
    }
  }

  const signers = getSigners(network.privateKeys)
  await validateChainParams(
    network.networkId,
    signers.map((signer) => signer.group)
  )

  for (const signer of signers) {
    const deploymentsPerAddress =
      deployments.getByDeployer(signer.address) ?? DeploymentsPerAddress.empty(signer.address)
    deployments.add(deploymentsPerAddress)
    await deployToGroup(networkId, configuration, deploymentsPerAddress, signer, network, scripts)
  }
  return true
}

export async function deployToDevnet(): Promise<Deployments> {
  const deployments = Deployments.empty()
  const configuration = await loadConfig(getConfigFile())
  await deploy(configuration, 'devnet', deployments)
  return deployments
}

async function deployToGroup<Settings = unknown>(
  networkId: NetworkId,
  configuration: Configuration<Settings>,
  deployments: DeploymentsPerAddress,
  signer: PrivateKeyWallet,
  network: Network<Settings>,
  scripts: { scriptFilePath: string; func: DeployFunction<Settings> }[]
) {
  const requestInterval = networkId === 'devnet' ? 1000 : 10000
  const deployer = createDeployer(network, signer, deployments.contracts, deployments.scripts, requestInterval)

  for (const script of scripts) {
    try {
      if (script.func.id && deployments.migrations.get(script.func.id) !== undefined) {
        console.log(`Skipping ${script.scriptFilePath} as the script already executed and complete`)
        continue
      }
      let skip = false
      if (script.func.skip !== undefined) {
        skip = await script.func.skip(configuration, networkId)
      }
      if (skip) {
        console.log(`Skip the execution of ${script.scriptFilePath}`)
        continue
      }
      const result = await script.func(deployer, network)
      if (result && typeof result === 'boolean') {
        if (script.func.id === undefined) {
          throw new Error(
            `${script.scriptFilePath} return true to not be executed again, but does not provide an id. The script function needs to have the field "id" to be set`
          )
        }
        deployments.migrations.set(script.func.id, Date.now())
      }
    } catch (error) {
      throw new Error(`failed to execute deploy script, filepath: ${script.scriptFilePath}, error: ${error}`)
    }
  }
}

function tryBigIntToString(num: Number256 | undefined): string | undefined {
  return num === undefined ? undefined : num.toString()
}

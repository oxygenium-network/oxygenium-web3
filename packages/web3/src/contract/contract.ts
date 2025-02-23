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

import { Buffer } from 'buffer/'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import {
  fromApiArray,
  fromApiNumber256,
  toApiNumber256,
  NamedVals,
  node,
  NodeProvider,
  Number256,
  toApiToken,
  toApiVal,
  Token,
  Val,
  fromApiTokens,
  fromApiVals,
  typeLength
} from '../api'
import {
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignerProvider,
  Address
} from '../signer'
import * as ralph from './ralph'
import {
  bs58,
  binToHex,
  contractIdFromAddress,
  Subscription,
  assertType,
  Eq,
  Optional,
  groupOfAddress,
  addressFromContractId,
  WebCrypto,
  hexToBinUnsafe
} from '../utils'
import { getCurrentNodeProvider } from '../global'
import * as path from 'path'
import { EventSubscribeOptions, EventSubscription, subscribeToEvents } from './events'
import { ONE_OXM } from '../constants'
import * as blake from 'blakejs'

const crypto = new WebCrypto()

export type FieldsSig = node.FieldsSig
export type EventSig = node.EventSig
export type FunctionSig = node.FunctionSig
export type Fields = NamedVals
export type Arguments = NamedVals
export type HexString = string
export type Constant = node.Constant
export type Enum = node.Enum

export const StdIdFieldName = '__stdInterfaceId'

enum SourceKind {
  Contract = 0,
  Script = 1,
  AbstractContract = 2,
  Interface = 3
}

export type CompilerOptions = node.CompilerOptions & {
  errorOnWarnings: boolean
}

export const DEFAULT_NODE_COMPILER_OPTIONS: node.CompilerOptions = {
  ignoreUnusedConstantsWarnings: false,
  ignoreUnusedVariablesWarnings: false,
  ignoreUnusedFieldsWarnings: false,
  ignoreUnusedPrivateFunctionsWarnings: false,
  ignoreUpdateFieldsCheckWarnings: false,
  ignoreCheckExternalCallerWarnings: false
}

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = { errorOnWarnings: true, ...DEFAULT_NODE_COMPILER_OPTIONS }

class TypedMatcher<T extends SourceKind> {
  matcher: RegExp
  type: T

  constructor(pattern: string, type: T) {
    this.matcher = new RegExp(pattern, 'mg')
    this.type = type
  }
}

function removeParentsPrefix(parts: string[]): string {
  let index = 0
  for (let i = 0; i < parts.length; i++) {
    if (parts[`${i}`] === '..') {
      index += 1
    } else {
      break
    }
  }
  return path.join(...parts.slice(index))
}

class SourceInfo {
  type: SourceKind
  name: string
  contractRelativePath: string
  sourceCode: string
  sourceCodeHash: string
  isExternal: boolean

  getArtifactPath(artifactsRootDir: string): string {
    let fullPath: string
    if (this.isExternal) {
      const relativePath = removeParentsPrefix(this.contractRelativePath.split(path.sep))
      const externalPath = path.join('.external', relativePath)
      fullPath = path.join(artifactsRootDir, externalPath)
    } else {
      fullPath = path.join(artifactsRootDir, this.contractRelativePath)
    }
    return path.join(path.dirname(fullPath), `${this.name}.ral.json`)
  }

  constructor(
    type: SourceKind,
    name: string,
    sourceCode: string,
    sourceCodeHash: string,
    contractRelativePath: string,
    isExternal: boolean
  ) {
    this.type = type
    this.name = name
    this.sourceCode = sourceCode
    this.sourceCodeHash = sourceCodeHash
    this.contractRelativePath = contractRelativePath
    this.isExternal = isExternal
  }

  static async from(
    type: SourceKind,
    name: string,
    sourceCode: string,
    contractRelativePath: string,
    isExternal: boolean
  ): Promise<SourceInfo> {
    const sourceCodeHash = await crypto.subtle.digest('SHA-256', Buffer.from(sourceCode))
    const sourceCodeHashHex = Buffer.from(sourceCodeHash).toString('hex')
    return new SourceInfo(type, name, sourceCode, sourceCodeHashHex, contractRelativePath, isExternal)
  }
}

class Compiled<T extends Artifact> {
  sourceInfo: SourceInfo
  artifact: T
  warnings: string[]

  constructor(sourceInfo: SourceInfo, artifact: T, warnings: string[]) {
    this.sourceInfo = sourceInfo
    this.artifact = artifact
    this.warnings = warnings
  }
}

type CodeInfo = {
  sourceFile: string
  sourceCodeHash: string
  bytecodeDebugPatch: string
  codeHashDebug: string
  warnings: string[]
}

export class ProjectArtifact {
  static readonly artifactFileName = '.project.json'

  fullNodeVersion: string
  compilerOptionsUsed: node.CompilerOptions
  infos: Map<string, CodeInfo>

  static checkCompilerOptionsParameter(compilerOptions: node.CompilerOptions): void {
    if (Object.keys(compilerOptions).length != Object.keys(DEFAULT_NODE_COMPILER_OPTIONS).length) {
      throw Error(`Not all compiler options are set: ${compilerOptions}`)
    }

    const combined = { ...compilerOptions, ...DEFAULT_NODE_COMPILER_OPTIONS }
    if (Object.keys(combined).length !== Object.keys(DEFAULT_NODE_COMPILER_OPTIONS).length) {
      throw Error(`There are unknown compiler options: ${compilerOptions}`)
    }
  }

  constructor(fullNodeVersion: string, compilerOptionsUsed: node.CompilerOptions, infos: Map<string, CodeInfo>) {
    ProjectArtifact.checkCompilerOptionsParameter(compilerOptionsUsed)
    this.fullNodeVersion = fullNodeVersion
    this.compilerOptionsUsed = compilerOptionsUsed
    this.infos = infos
  }

  static isCodeChanged(current: ProjectArtifact, previous: ProjectArtifact): boolean {
    if (current.infos.size !== previous.infos.size) {
      return true
    }
    for (const [name, codeInfo] of current.infos) {
      const prevCodeInfo = previous.infos.get(name)
      if (prevCodeInfo?.codeHashDebug !== codeInfo.codeHashDebug) {
        return true
      }
    }
    return false
  }

  async saveToFile(rootPath: string): Promise<void> {
    const filepath = path.join(rootPath, ProjectArtifact.artifactFileName)
    const artifact = {
      fullNodeVersion: this.fullNodeVersion,
      compilerOptionsUsed: this.compilerOptionsUsed,
      infos: Object.fromEntries(new Map([...this.infos].sort()))
    }
    const content = JSON.stringify(artifact, null, 2)
    return fsPromises.writeFile(filepath, content)
  }

  needToReCompile(compilerOptions: node.CompilerOptions, sourceInfos: SourceInfo[], fullNodeVersion: string): boolean {
    ProjectArtifact.checkCompilerOptionsParameter(compilerOptions)
    if (this.fullNodeVersion !== fullNodeVersion) {
      return true
    }

    const optionsMatched = Object.entries(compilerOptions).every(([key, inputOption]) => {
      const usedOption = this.compilerOptionsUsed[`${key}`]
      return usedOption === inputOption
    })
    if (!optionsMatched) {
      return true
    }

    if (sourceInfos.length !== this.infos.size) {
      return true
    }
    for (const sourceInfo of sourceInfos) {
      const info = this.infos.get(sourceInfo.name)
      if (typeof info === 'undefined' || info.sourceCodeHash !== sourceInfo.sourceCodeHash) {
        return true
      }
    }

    return false
  }

  static async from(rootPath: string): Promise<ProjectArtifact | undefined> {
    const filepath = path.join(rootPath, ProjectArtifact.artifactFileName)
    if (!fs.existsSync(filepath)) {
      return undefined
    }
    try {
      const content = await fsPromises.readFile(filepath)
      const json = JSON.parse(content.toString())
      const fullNodeVersion = json.fullNodeVersion as string
      const compilerOptionsUsed = json.compilerOptionsUsed as node.CompilerOptions
      const files = new Map(Object.entries<CodeInfo>(json.infos))
      return new ProjectArtifact(fullNodeVersion, compilerOptionsUsed, files)
    } catch (error) {
      console.log(`Failed to load project artifact, error: ${error}`)
      return undefined
    }
  }
}

export class Project {
  sourceInfos: SourceInfo[]
  contracts: Map<string, Compiled<Contract>>
  scripts: Map<string, Compiled<Script>>
  projectArtifact: ProjectArtifact

  readonly contractsRootDir: string
  readonly artifactsRootDir: string

  static currentProject: Project

  static readonly importRegex = new RegExp('^import "[^"./]+/[^"]*[a-z][a-z_0-9]*(.ral)?"', 'mg')
  static readonly abstractContractMatcher = new TypedMatcher<SourceKind>(
    '^Abstract Contract ([A-Z][a-zA-Z0-9]*)',
    SourceKind.AbstractContract
  )
  static readonly contractMatcher = new TypedMatcher('^Contract ([A-Z][a-zA-Z0-9]*)', SourceKind.Contract)
  static readonly interfaceMatcher = new TypedMatcher('^Interface ([A-Z][a-zA-Z0-9]*)', SourceKind.Interface)
  static readonly scriptMatcher = new TypedMatcher('^TxScript ([A-Z][a-zA-Z0-9]*)', SourceKind.Script)
  static readonly matchers = [
    Project.abstractContractMatcher,
    Project.contractMatcher,
    Project.interfaceMatcher,
    Project.scriptMatcher
  ]

  static buildProjectArtifact(
    fullNodeVersion: string,
    sourceInfos: SourceInfo[],
    contracts: Map<string, Compiled<Contract>>,
    scripts: Map<string, Compiled<Script>>,
    compilerOptions: node.CompilerOptions
  ): ProjectArtifact {
    const files: Map<string, CodeInfo> = new Map()
    contracts.forEach((c) => {
      files.set(c.artifact.name, {
        sourceFile: c.sourceInfo.contractRelativePath,
        sourceCodeHash: c.sourceInfo.sourceCodeHash,
        bytecodeDebugPatch: c.artifact.bytecodeDebugPatch,
        codeHashDebug: c.artifact.codeHashDebug,
        warnings: c.warnings
      })
    })
    scripts.forEach((s) => {
      files.set(s.artifact.name, {
        sourceFile: s.sourceInfo.contractRelativePath,
        sourceCodeHash: s.sourceInfo.sourceCodeHash,
        bytecodeDebugPatch: s.artifact.bytecodeDebugPatch,
        codeHashDebug: '',
        warnings: s.warnings
      })
    })
    const compiledSize = contracts.size + scripts.size
    sourceInfos.slice(compiledSize).forEach((c) => {
      files.set(c.name, {
        sourceFile: c.contractRelativePath,
        sourceCodeHash: c.sourceCodeHash,
        bytecodeDebugPatch: '',
        codeHashDebug: '',
        warnings: []
      })
    })
    return new ProjectArtifact(fullNodeVersion, compilerOptions, files)
  }

  private constructor(
    contractsRootDir: string,
    artifactsRootDir: string,
    sourceInfos: SourceInfo[],
    contracts: Map<string, Compiled<Contract>>,
    scripts: Map<string, Compiled<Script>>,
    errorOnWarnings: boolean,
    projectArtifact: ProjectArtifact
  ) {
    this.contractsRootDir = contractsRootDir
    this.artifactsRootDir = artifactsRootDir
    this.sourceInfos = sourceInfos
    this.contracts = contracts
    this.scripts = scripts
    this.projectArtifact = projectArtifact

    if (errorOnWarnings) {
      Project.checkCompilerWarnings(
        [
          ...[...contracts.entries()].map((c) => c[1].warnings).flat(),
          ...[...scripts.entries()].map((s) => s[1].warnings).flat()
        ],
        errorOnWarnings
      )
    }
  }

  static checkCompilerWarnings(warnings: string[], errorOnWarnings: boolean): void {
    if (warnings.length !== 0) {
      const prefixPerWarning = '  - '
      const warningString = prefixPerWarning + warnings.join('\n' + prefixPerWarning)
      const output = `Compilation warnings:\n` + warningString + '\n'
      if (errorOnWarnings) {
        throw new Error(output)
      } else {
        console.log(output)
      }
    }
  }

  static contract(name: string): Contract {
    const contract = Project.currentProject.contracts.get(name)
    if (typeof contract === 'undefined') {
      throw new Error(`Contract "${name}" does not exist`)
    }
    return contract.artifact
  }

  static script(name: string): Script {
    const script = Project.currentProject.scripts.get(name)
    if (typeof script === 'undefined') {
      throw new Error(`Script "${name}" does not exist`)
    }
    return script.artifact
  }

  private async saveArtifactsToFile(projectRootDir: string): Promise<void> {
    const artifactsRootDir = this.artifactsRootDir
    const saveToFile = async function (compiled: Compiled<Artifact>): Promise<void> {
      const artifactPath = compiled.sourceInfo.getArtifactPath(artifactsRootDir)
      const dirname = path.dirname(artifactPath)
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true })
      }
      return fsPromises.writeFile(artifactPath, compiled.artifact.toString())
    }
    this.contracts.forEach((contract) => saveToFile(contract))
    this.scripts.forEach((script) => saveToFile(script))
    await this.projectArtifact.saveToFile(projectRootDir)
  }

  contractByCodeHash(codeHash: string): Contract {
    const contract = [...this.contracts.values()].find(
      (c) => c.artifact.codeHash === codeHash || c.artifact.codeHashDebug == codeHash
    )
    if (typeof contract === 'undefined') {
      throw new Error(`Unknown code with code hash: ${codeHash}`)
    }
    return contract.artifact
  }

  private static async compile(
    fullNodeVersion: string,
    provider: NodeProvider,
    sourceInfos: SourceInfo[],
    projectRootDir: string,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions
  ): Promise<Project> {
    const removeDuplicates = sourceInfos.reduce((acc: SourceInfo[], sourceInfo: SourceInfo) => {
      if (acc.find((info) => info.sourceCodeHash === sourceInfo.sourceCodeHash) === undefined) {
        acc.push(sourceInfo)
      }
      return acc
    }, [])
    const sourceStr = removeDuplicates.map((f) => f.sourceCode).join('\n')
    const result = await provider.contracts.postContractsCompileProject({
      code: sourceStr,
      compilerOptions: compilerOptions
    })
    const contracts = new Map<string, Compiled<Contract>>()
    const scripts = new Map<string, Compiled<Script>>()
    result.contracts.forEach((contractResult) => {
      const sourceInfo = sourceInfos.find(
        (sourceInfo) => sourceInfo.type === SourceKind.Contract && sourceInfo.name === contractResult.name
      )
      if (sourceInfo === undefined) {
        // this should never happen
        throw new Error(`SourceInfo does not exist for contract ${contractResult.name}`)
      }
      const contract = Contract.fromCompileResult(contractResult)
      contracts.set(contract.name, new Compiled(sourceInfo, contract, contractResult.warnings))
    })
    result.scripts.forEach((scriptResult) => {
      const sourceInfo = sourceInfos.find(
        (sourceInfo) => sourceInfo.type === SourceKind.Script && sourceInfo.name === scriptResult.name
      )
      if (sourceInfo === undefined) {
        // this should never happen
        throw new Error(`SourceInfo does not exist for script ${scriptResult.name}`)
      }
      const script = Script.fromCompileResult(scriptResult)
      scripts.set(script.name, new Compiled(sourceInfo, script, scriptResult.warnings))
    })
    const projectArtifact = Project.buildProjectArtifact(
      fullNodeVersion,
      sourceInfos,
      contracts,
      scripts,
      compilerOptions
    )
    const project = new Project(
      contractsRootDir,
      artifactsRootDir,
      sourceInfos,
      contracts,
      scripts,
      errorOnWarnings,
      projectArtifact
    )
    await project.saveArtifactsToFile(projectRootDir)
    return project
  }

  private static async loadArtifacts(
    provider: NodeProvider,
    sourceInfos: SourceInfo[],
    projectArtifact: ProjectArtifact,
    projectRootDir: string,
    contractsRootDir: string,
    artifactsRootDir: string,
    errorOnWarnings: boolean,
    compilerOptions: node.CompilerOptions
  ): Promise<Project> {
    try {
      const contracts = new Map<string, Compiled<Contract>>()
      const scripts = new Map<string, Compiled<Script>>()
      for (const sourceInfo of sourceInfos) {
        const info = projectArtifact.infos.get(sourceInfo.name)
        if (typeof info === 'undefined') {
          throw Error(`Unable to find project info for ${sourceInfo.name}, please rebuild the project`)
        }
        const warnings = info.warnings
        const artifactDir = sourceInfo.getArtifactPath(artifactsRootDir)
        if (sourceInfo.type === SourceKind.Contract) {
          const artifact = await Contract.fromArtifactFile(artifactDir, info.bytecodeDebugPatch, info.codeHashDebug)
          contracts.set(artifact.name, new Compiled(sourceInfo, artifact, warnings))
        } else if (sourceInfo.type === SourceKind.Script) {
          const artifact = await Script.fromArtifactFile(artifactDir, info.bytecodeDebugPatch)
          scripts.set(artifact.name, new Compiled(sourceInfo, artifact, warnings))
        }
      }

      return new Project(
        contractsRootDir,
        artifactsRootDir,
        sourceInfos,
        contracts,
        scripts,
        errorOnWarnings,
        projectArtifact
      )
    } catch (error) {
      console.log(`Failed to load artifacts, error: ${error}, try to re-compile contracts...`)
      return Project.compile(
        projectArtifact.fullNodeVersion,
        provider,
        sourceInfos,
        projectRootDir,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        compilerOptions
      )
    }
  }

  private static getImportSourcePath(projectRootDir: string, importPath: string): string {
    const parts = importPath.split('/')
    if (parts.length > 1 && parts[0] === 'std') {
      const currentDir = path.dirname(__filename)
      return path.join(...[currentDir, '..', '..', '..', importPath])
    }
    let moduleDir = projectRootDir
    while (true) {
      const expectedPath = path.join(...[moduleDir, 'node_modules', importPath])
      if (fs.existsSync(expectedPath)) {
        return expectedPath
      }
      const oldModuleDir = moduleDir
      moduleDir = path.join(moduleDir, '..')
      if (oldModuleDir === moduleDir) {
        throw new Error(`Specified import file does not exist: ${importPath}`)
      }
    }
  }

  private static async handleImports(
    projectRootDir: string,
    contractRootDir: string,
    sourceStr: string,
    importsCache: string[]
  ): Promise<[string, SourceInfo[]]> {
    const localImportsCache: string[] = []
    const result = sourceStr.replace(Project.importRegex, (match) => {
      localImportsCache.push(match)
      return ''
    })
    const externalSourceInfos: SourceInfo[] = []
    for (const myImport of localImportsCache) {
      const originImportPath = myImport.slice(8, -1)
      const importPath = originImportPath.endsWith('.ral') ? originImportPath : originImportPath + '.ral'
      if (!importsCache.includes(importPath)) {
        importsCache.push(importPath)
        const sourcePath = Project.getImportSourcePath(projectRootDir, importPath)
        const sourceInfos = await Project.loadSourceFile(
          projectRootDir,
          contractRootDir,
          sourcePath,
          importsCache,
          true
        )
        externalSourceInfos.push(...sourceInfos)
      }
    }
    return [result, externalSourceInfos]
  }

  private static async loadSourceFile(
    projectRootDir: string,
    contractsRootDir: string,
    sourcePath: string,
    importsCache: string[],
    isExternal: boolean
  ): Promise<SourceInfo[]> {
    const contractRelativePath = path.relative(contractsRootDir, sourcePath)
    if (!sourcePath.endsWith('.ral')) {
      throw new Error(`Invalid filename: ${sourcePath}, smart contract file name should end with ".ral"`)
    }

    const sourceBuffer = await fsPromises.readFile(sourcePath)
    const [sourceStr, externalSourceInfos] = await Project.handleImports(
      projectRootDir,
      contractsRootDir,
      sourceBuffer.toString(),
      importsCache
    )
    if (sourceStr.match(new RegExp('^import "', 'mg')) !== null) {
      throw new Error(`Invalid import statements, source: ${sourcePath}`)
    }
    const sourceInfos = externalSourceInfos
    for (const matcher of this.matchers) {
      const results = sourceStr.matchAll(matcher.matcher)
      for (const result of results) {
        const sourceInfo = await SourceInfo.from(matcher.type, result[1], sourceStr, contractRelativePath, isExternal)
        sourceInfos.push(sourceInfo)
      }
    }
    return sourceInfos
  }

  private static async loadSourceFiles(projectRootDir: string, contractsRootDir: string): Promise<SourceInfo[]> {
    const importsCache: string[] = []
    const sourceInfos: SourceInfo[] = []
    const loadDir = async function (dirPath: string): Promise<void> {
      const dirents = await fsPromises.readdir(dirPath, { withFileTypes: true })
      for (const dirent of dirents) {
        if (dirent.isFile()) {
          const sourcePath = path.join(dirPath, dirent.name)
          const infos = await Project.loadSourceFile(projectRootDir, contractsRootDir, sourcePath, importsCache, false)
          sourceInfos.push(...infos)
        } else {
          const newPath = path.join(dirPath, dirent.name)
          await loadDir(newPath)
        }
      }
    }
    await loadDir(contractsRootDir)
    const contractAndScriptSize = sourceInfos.filter(
      (f) => f.type === SourceKind.Contract || f.type === SourceKind.Script
    ).length
    if (sourceInfos.length === 0 || contractAndScriptSize === 0) {
      throw new Error('Project have no source files')
    }
    return sourceInfos.sort((a, b) => a.type - b.type)
  }

  static readonly DEFAULT_CONTRACTS_DIR = 'contracts'
  static readonly DEFAULT_ARTIFACTS_DIR = 'artifacts'

  static async build(
    compilerOptionsPartial: Partial<CompilerOptions> = {},
    projectRootDir = '.',
    contractsRootDir = Project.DEFAULT_CONTRACTS_DIR,
    artifactsRootDir = Project.DEFAULT_ARTIFACTS_DIR,
    defaultFullNodeVersion: string | undefined = undefined
  ): Promise<void> {
    const provider = getCurrentNodeProvider()
    const fullNodeVersion = defaultFullNodeVersion ?? (await provider.infos.getInfosVersion()).version
    const sourceFiles = await Project.loadSourceFiles(projectRootDir, contractsRootDir)
    const { errorOnWarnings, ...nodeCompilerOptions } = { ...DEFAULT_COMPILER_OPTIONS, ...compilerOptionsPartial }
    const projectArtifact = await ProjectArtifact.from(projectRootDir)
    if (
      projectArtifact === undefined ||
      projectArtifact.needToReCompile(nodeCompilerOptions, sourceFiles, fullNodeVersion)
    ) {
      console.log(`Compiling contracts in folder "${contractsRootDir}"`)
      Project.currentProject = await Project.compile(
        fullNodeVersion,
        provider,
        sourceFiles,
        projectRootDir,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        nodeCompilerOptions
      )
    } else {
      console.log(`Contracts are compiled already. Loading them from folder "${artifactsRootDir}"`)
      Project.currentProject = await Project.loadArtifacts(
        provider,
        sourceFiles,
        projectArtifact,
        projectRootDir,
        contractsRootDir,
        artifactsRootDir,
        errorOnWarnings,
        nodeCompilerOptions
      )
    }
  }
}

export abstract class Artifact {
  readonly version: string
  readonly name: string
  readonly functions: FunctionSig[]

  constructor(version: string, name: string, functions: FunctionSig[]) {
    this.version = version
    this.name = name
    this.functions = functions
  }

  abstract buildByteCodeToDeploy(initialFields?: Fields): string

  publicFunctions(): string[] {
    return this.functions.filter((func) => func.isPublic).map((func) => func.name)
  }

  usingPreapprovedAssetsFunctions(): string[] {
    return this.functions.filter((func) => func.usePreapprovedAssets).map((func) => func.name)
  }

  usingAssetsInContractFunctions(): string[] {
    return this.functions.filter((func) => func.useAssetsInContract).map((func) => func.name)
  }
}

export class Contract extends Artifact {
  readonly bytecode: string
  readonly bytecodeDebugPatch: string
  readonly codeHash: string
  readonly fieldsSig: FieldsSig
  readonly eventsSig: EventSig[]
  readonly constants: Constant[]
  readonly enums: Enum[]
  readonly stdInterfaceId?: HexString

  readonly bytecodeDebug: string
  readonly codeHashDebug: string

  constructor(
    version: string,
    name: string,
    bytecode: string,
    bytecodeDebugPatch: string,
    codeHash: string,
    codeHashDebug: string,
    fieldsSig: FieldsSig,
    eventsSig: EventSig[],
    functions: FunctionSig[],
    constants: Constant[],
    enums: Enum[],
    stdInterfaceId?: HexString
  ) {
    super(version, name, functions)
    this.bytecode = bytecode
    this.bytecodeDebugPatch = bytecodeDebugPatch
    this.codeHash = codeHash
    this.fieldsSig = fieldsSig
    this.eventsSig = eventsSig
    this.constants = constants
    this.enums = enums
    this.stdInterfaceId = stdInterfaceId

    this.bytecodeDebug = ralph.buildDebugBytecode(this.bytecode, this.bytecodeDebugPatch)
    this.codeHashDebug = codeHashDebug
  }

  // TODO: safely parse json
  static fromJson(artifact: any, bytecodeDebugPatch = '', codeHashDebug = ''): Contract {
    if (
      artifact.version == null ||
      artifact.name == null ||
      artifact.bytecode == null ||
      artifact.codeHash == null ||
      artifact.fieldsSig == null ||
      artifact.eventsSig == null ||
      artifact.constants == null ||
      artifact.enums == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for contract is incomplete')
    }
    const contract = new Contract(
      artifact.version,
      artifact.name,
      artifact.bytecode,
      bytecodeDebugPatch,
      artifact.codeHash,
      codeHashDebug ? codeHashDebug : artifact.codeHash,
      artifact.fieldsSig,
      artifact.eventsSig,
      artifact.functions,
      artifact.constants,
      artifact.enums,
      artifact.stdInterfaceId === null ? undefined : artifact.stdInterfaceId
    )
    return contract
  }

  static fromCompileResult(result: node.CompileContractResult): Contract {
    return new Contract(
      result.version,
      result.name,
      result.bytecode,
      result.bytecodeDebugPatch,
      result.codeHash,
      result.codeHashDebug,
      result.fields,
      result.events,
      result.functions,
      result.constants,
      result.enums,
      result.stdInterfaceId
    )
  }

  // support both 'code.ral' and 'code.ral.json'
  static async fromArtifactFile(path: string, bytecodeDebugPatch: string, codeHashDebug: string): Promise<Contract> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return Contract.fromJson(artifact, bytecodeDebugPatch, codeHashDebug)
  }

  override toString(): string {
    const object: any = {
      version: this.version,
      name: this.name,
      bytecode: this.bytecode,
      codeHash: this.codeHash,
      fieldsSig: this.fieldsSig,
      eventsSig: this.eventsSig,
      functions: this.functions,
      constants: this.constants,
      enums: this.enums
    }
    if (this.stdInterfaceId !== undefined) {
      object.stdInterfaceId = this.stdInterfaceId
    }
    return JSON.stringify(object, null, 2)
  }

  toState<T extends Fields>(fields: T, asset: Asset, address?: string): ContractState<T> {
    const addressDef = typeof address !== 'undefined' ? address : Contract.randomAddress()
    return {
      address: addressDef,
      contractId: binToHex(contractIdFromAddress(addressDef)),
      bytecode: this.bytecode,
      codeHash: this.codeHash,
      fields: fields,
      fieldsSig: this.fieldsSig,
      asset: asset
    }
  }

  // no need to be cryptographically strong random
  static randomAddress(): string {
    const bytes = new Uint8Array(33)
    crypto.getRandomValues(bytes)
    bytes[0] = 3
    return bs58.encode(bytes)
  }

  printDebugMessages(funcName: string, messages: DebugMessage[]) {
    if (messages.length != 0) {
      console.log(`Testing ${this.name}.${funcName}:`)
      messages.forEach((m) => console.log(`Debug - ${m.contractAddress} - ${m.message}`))
    }
  }

  toApiFields(fields?: Fields): node.Val[] {
    if (typeof fields === 'undefined') {
      return []
    } else {
      return toApiFields(fields, this.fieldsSig)
    }
  }

  toApiArgs(funcName: string, args?: Arguments): node.Val[] {
    if (args) {
      const func = this.functions.find((func) => func.name == funcName)
      if (func == null) {
        throw new Error(`Invalid function name: ${funcName}`)
      }

      return toApiArgs(args, func)
    } else {
      return []
    }
  }

  getMethodIndex(funcName: string): number {
    return this.functions.findIndex((func) => func.name === funcName)
  }

  toApiContractStates(states?: ContractState[]): node.ContractState[] | undefined {
    return typeof states != 'undefined' ? states.map((state) => toApiContractState(state)) : undefined
  }

  toApiTestContractParams(funcName: string, params: TestContractParams): node.TestContract {
    const immFields =
      params.initialFields === undefined ? [] : extractFields(params.initialFields, this.fieldsSig, false)
    const mutFields =
      params.initialFields === undefined ? [] : extractFields(params.initialFields, this.fieldsSig, true)
    return {
      group: params.group,
      blockHash: params.blockHash,
      blockTimeStamp: params.blockTimeStamp,
      txId: params.txId,
      address: params.address,
      bytecode: this.bytecodeDebug,
      initialImmFields: immFields,
      initialMutFields: mutFields,
      initialAsset: typeof params.initialAsset !== 'undefined' ? toApiAsset(params.initialAsset) : undefined,
      methodIndex: this.getMethodIndex(funcName),
      args: this.toApiArgs(funcName, params.testArgs),
      existingContracts: this.toApiContractStates(params.existingContracts),
      inputAssets: toApiInputAssets(params.inputAssets)
    }
  }

  fromApiContractState(state: node.ContractState): ContractState<Fields> {
    return {
      address: state.address,
      contractId: binToHex(contractIdFromAddress(state.address)),
      bytecode: state.bytecode,
      initialStateHash: state.initialStateHash,
      codeHash: state.codeHash,
      fields: fromApiFields(state.immFields, state.mutFields, this.fieldsSig),
      fieldsSig: this.fieldsSig,
      asset: fromApiAsset(state.asset)
    }
  }

  static fromApiContractState(
    state: node.ContractState,
    getContractByCodeHash?: (codeHash: string) => Contract
  ): ContractState {
    const contract = getContractByCodeHash
      ? getContractByCodeHash(state.codeHash)
      : Project.currentProject.contractByCodeHash(state.codeHash)
    return contract.fromApiContractState(state)
  }

  static ContractCreatedEventIndex = -1
  static ContractCreatedEvent: EventSig = {
    name: 'ContractCreated',
    fieldNames: ['address', 'parentAddress', 'stdInterfaceId'],
    fieldTypes: ['Address', 'Address', 'ByteVec']
  }

  static ContractDestroyedEventIndex = -2
  static ContractDestroyedEvent: EventSig = {
    name: 'ContractDestroyed',
    fieldNames: ['address'],
    fieldTypes: ['Address']
  }

  static fromApiEvent(
    event: node.ContractEventByTxId,
    codeHash: string | undefined,
    txId: string,
    getContractByCodeHash?: (codeHash: string) => Contract
  ): ContractEvent {
    let fields: Fields
    let name: string

    if (event.eventIndex == Contract.ContractCreatedEventIndex) {
      fields = toContractCreatedEventFields(fromApiEventFields(event.fields, Contract.ContractCreatedEvent, true))
      name = Contract.ContractCreatedEvent.name
    } else if (event.eventIndex == Contract.ContractDestroyedEventIndex) {
      fields = fromApiEventFields(event.fields, Contract.ContractDestroyedEvent, true)
      name = Contract.ContractDestroyedEvent.name
    } else {
      const contract = getContractByCodeHash
        ? getContractByCodeHash(codeHash!)
        : Project.currentProject.contractByCodeHash(codeHash!)
      const eventSig = contract.eventsSig[event.eventIndex]
      fields = fromApiEventFields(event.fields, eventSig)
      name = eventSig.name
    }

    return {
      txId: txId,
      blockHash: event.blockHash,
      contractAddress: event.contractAddress,
      name: name,
      eventIndex: event.eventIndex,
      fields: fields
    }
  }

  fromApiTestContractResult(
    methodName: string,
    result: node.TestContractResult,
    txId: string
  ): TestContractResult<unknown> {
    const methodIndex = this.functions.findIndex((sig) => sig.name === methodName)
    const returnTypes = this.functions[`${methodIndex}`].returnTypes
    const rawReturn = fromApiArray(result.returns, returnTypes)
    const returns = rawReturn.length === 0 ? null : rawReturn.length === 1 ? rawReturn[0] : rawReturn

    const addressToCodeHash = new Map<string, string>()
    addressToCodeHash.set(result.address, result.codeHash)
    result.contracts.forEach((contract) => addressToCodeHash.set(contract.address, contract.codeHash))
    return {
      contractId: binToHex(contractIdFromAddress(result.address)),
      contractAddress: result.address,
      returns: returns,
      gasUsed: result.gasUsed,
      contracts: result.contracts.map((contract) => Contract.fromApiContractState(contract)),
      txOutputs: result.txOutputs.map(fromApiOutput),
      events: Contract.fromApiEvents(result.events, addressToCodeHash, txId),
      debugMessages: result.debugMessages
    }
  }

  async txParamsForDeployment<P extends Fields>(
    signer: SignerProvider,
    params: DeployContractParams<P>
  ): Promise<SignDeployContractTxParams> {
    const initialFields: Fields = params.initialFields ?? {}
    const bytecode = this.buildByteCodeToDeploy(addStdIdToFields(this, initialFields))
    const selectedAccount = await signer.getSelectedAccount()
    const signerParams: SignDeployContractTxParams = {
      signerAddress: selectedAccount.address,
      signerKeyType: selectedAccount.keyType,
      bytecode: bytecode,
      initialAttoOxmAmount: params?.initialAttoOxmAmount,
      issueTokenAmount: params?.issueTokenAmount,
      initialTokenAmounts: params?.initialTokenAmounts,
      gasAmount: params?.gasAmount,
      gasPrice: params?.gasPrice
    }
    return signerParams
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    try {
      return ralph.buildContractByteCode(this.bytecode, initialFields, this.fieldsSig)
    } catch (error) {
      throw new Error(`Failed to build bytecode for contract ${this.name}, error: ${error}`)
    }
  }

  static fromApiEvents(
    events: node.ContractEventByTxId[],
    addressToCodeHash: Map<string, string>,
    txId: string,
    getContractByCodeHash?: (codeHash: string) => Contract
  ): ContractEvent[] {
    return events.map((event) => {
      const contractAddress = event.contractAddress
      const codeHash = addressToCodeHash.get(contractAddress)
      if (typeof codeHash !== 'undefined' || event.eventIndex < 0) {
        return Contract.fromApiEvent(event, codeHash, txId, getContractByCodeHash)
      } else {
        throw Error(`Cannot find codeHash for the contract address: ${contractAddress}`)
      }
    })
  }

  toApiCallContract<T extends Arguments>(
    params: CallContractParams<T>,
    groupIndex: number,
    contractAddress: string,
    methodIndex: number
  ): node.CallContract {
    const functionSig = this.functions[`${methodIndex}`]
    const args = toApiVals(params.args ?? {}, functionSig.paramNames, functionSig.paramTypes)
    return {
      ...params,
      group: groupIndex,
      address: contractAddress,
      methodIndex: methodIndex,
      args: args
    }
  }

  fromApiCallContractResult(
    result: node.CallContractResult,
    txId: string,
    methodIndex: number,
    getContractByCodeHash?: (codeHash: string) => Contract
  ): CallContractResult<unknown> {
    const returnTypes = this.functions[`${methodIndex}`].returnTypes
    const rawReturn = fromApiArray(result.returns, returnTypes)
    const returns = rawReturn.length === 0 ? null : rawReturn.length === 1 ? rawReturn[0] : rawReturn

    const addressToCodeHash = new Map<string, string>()
    result.contracts.forEach((contract) => addressToCodeHash.set(contract.address, contract.codeHash))
    return {
      returns: returns,
      gasUsed: result.gasUsed,
      contracts: result.contracts.map((state) => Contract.fromApiContractState(state, getContractByCodeHash)),
      txInputs: result.txInputs,
      txOutputs: result.txOutputs.map((output) => fromApiOutput(output)),
      events: Contract.fromApiEvents(result.events, addressToCodeHash, txId, getContractByCodeHash)
    }
  }
}

export class Script extends Artifact {
  readonly bytecodeTemplate: string
  readonly bytecodeDebugPatch: string
  readonly fieldsSig: FieldsSig

  constructor(
    version: string,
    name: string,
    bytecodeTemplate: string,
    bytecodeDebugPatch: string,
    fieldsSig: FieldsSig,
    functions: FunctionSig[]
  ) {
    super(version, name, functions)
    this.bytecodeTemplate = bytecodeTemplate
    this.bytecodeDebugPatch = bytecodeDebugPatch
    this.fieldsSig = fieldsSig
  }

  static fromCompileResult(result: node.CompileScriptResult): Script {
    return new Script(
      result.version,
      result.name,
      result.bytecodeTemplate,
      result.bytecodeDebugPatch,
      result.fields,
      result.functions
    )
  }

  // TODO: safely parse json
  static fromJson(artifact: any, bytecodeDebugPatch = ''): Script {
    if (
      artifact.version == null ||
      artifact.name == null ||
      artifact.bytecodeTemplate == null ||
      artifact.fieldsSig == null ||
      artifact.functions == null
    ) {
      throw Error('The artifact JSON for script is incomplete')
    }
    return new Script(
      artifact.version,
      artifact.name,
      artifact.bytecodeTemplate,
      bytecodeDebugPatch,
      artifact.fieldsSig,
      artifact.functions
    )
  }

  static async fromArtifactFile(path: string, bytecodeDebugPatch: string): Promise<Script> {
    const content = await fsPromises.readFile(path)
    const artifact = JSON.parse(content.toString())
    return this.fromJson(artifact, bytecodeDebugPatch)
  }

  override toString(): string {
    const object = {
      version: this.version,
      name: this.name,
      bytecodeTemplate: this.bytecodeTemplate,
      fieldsSig: this.fieldsSig,
      functions: this.functions
    }
    return JSON.stringify(object, null, 2)
  }

  async txParamsForExecution<P extends Fields>(
    signer: SignerProvider,
    params: ExecuteScriptParams<P>
  ): Promise<SignExecuteScriptTxParams> {
    const selectedAccount = await signer.getSelectedAccount()
    const signerParams: SignExecuteScriptTxParams = {
      signerAddress: selectedAccount.address,
      signerKeyType: selectedAccount.keyType,
      bytecode: this.buildByteCodeToDeploy(params.initialFields ?? {}),
      attoOxmAmount: params.attoOxmAmount,
      tokens: params.tokens,
      gasAmount: params.gasAmount,
      gasPrice: params.gasPrice
    }
    return signerParams
  }

  buildByteCodeToDeploy(initialFields: Fields): string {
    try {
      return ralph.buildScriptByteCode(this.bytecodeTemplate, initialFields, this.fieldsSig)
    } catch (error) {
      throw new Error(`Failed to build bytecode for script ${this.name}, error: ${error}`)
    }
  }
}

function fromApiFields(immFields: node.Val[], mutFields: node.Val[], fieldsSig: node.FieldsSig): Fields {
  const vals: node.Val[] = []
  let immIndex = 0
  let mutIndex = 0
  const isMutable = fieldsSig.types.flatMap((tpe, index) =>
    Array(typeLength(tpe)).fill(fieldsSig.isMutable[`${index}`])
  )
  isMutable.forEach((mutable) => {
    if (mutable) {
      vals.push(mutFields[`${mutIndex}`])
      mutIndex += 1
    } else {
      vals.push(immFields[`${immIndex}`])
      immIndex += 1
    }
  })
  return fromApiVals(vals, fieldsSig.names, fieldsSig.types)
}

function fromApiEventFields(vals: node.Val[], eventSig: node.EventSig, systemEvent = false): Fields {
  return fromApiVals(vals, eventSig.fieldNames, eventSig.fieldTypes, systemEvent)
}

export interface Asset {
  alphAmount: Number256
  tokens?: Token[]
}

function toApiAsset(asset: Asset): node.AssetState {
  return {
    attoOxmAmount: toApiNumber256(asset.alphAmount),
    tokens: typeof asset.tokens !== 'undefined' ? asset.tokens.map(toApiToken) : []
  }
}

function fromApiAsset(asset: node.AssetState): Asset {
  return {
    alphAmount: fromApiNumber256(asset.attoOxmAmount),
    tokens: fromApiTokens(asset.tokens)
  }
}

export interface InputAsset {
  address: string
  asset: Asset
}

export interface ContractState<T extends Fields = Fields> {
  address: string
  contractId: string
  bytecode: string
  initialStateHash?: string
  codeHash: string
  fields: T
  fieldsSig: FieldsSig
  asset: Asset
}

function getVal(vals: NamedVals, name: string): Val {
  if (name in vals) {
    return vals[`${name}`]
  } else {
    throw Error(`No Val exists for ${name}`)
  }
}

function extractFields(fields: NamedVals, fieldsSig: FieldsSig, mutable: boolean) {
  const fieldIndexes = fieldsSig.names
    .map((_, index) => index)
    .filter((index) => fieldsSig.isMutable[`${index}`] === mutable)
  const fieldNames = fieldIndexes.map((index) => fieldsSig.names[`${index}`])
  const fieldTypes = fieldIndexes.map((index) => fieldsSig.types[`${index}`])
  return toApiVals(fields, fieldNames, fieldTypes)
}

function toApiContractState(state: ContractState): node.ContractState {
  const stateFields = state.fields ?? {}
  return {
    address: state.address,
    bytecode: state.bytecode,
    codeHash: state.codeHash,
    initialStateHash: state.initialStateHash,
    immFields: extractFields(stateFields, state.fieldsSig, false),
    mutFields: extractFields(stateFields, state.fieldsSig, true),
    asset: toApiAsset(state.asset)
  }
}

function toApiFields(fields: Fields, fieldsSig: FieldsSig): node.Val[] {
  return toApiVals(fields, fieldsSig.names, fieldsSig.types)
}

function toApiArgs(args: Arguments, funcSig: FunctionSig): node.Val[] {
  return toApiVals(args, funcSig.paramNames, funcSig.paramTypes)
}

export function toApiVals(fields: Fields, names: string[], types: string[]): node.Val[] {
  return names.map((name, index) => {
    const val = getVal(fields, name)
    const tpe = types[`${index}`]
    return toApiVal(val, tpe)
  })
}

function toApiInputAsset(inputAsset: InputAsset): node.TestInputAsset {
  return { address: inputAsset.address, asset: toApiAsset(inputAsset.asset) }
}

function toApiInputAssets(inputAssets?: InputAsset[]): node.TestInputAsset[] | undefined {
  return typeof inputAssets !== 'undefined' ? inputAssets.map(toApiInputAsset) : undefined
}

export interface TestContractParams<F extends Fields = Fields, A extends Arguments = Arguments> {
  group?: number // default 0
  address?: string
  blockHash?: string
  blockTimeStamp?: number
  txId?: string
  initialFields: F
  initialAsset?: Asset // default 1 OXM
  testArgs: A
  existingContracts?: ContractState[] // default no existing contracts
  inputAssets?: InputAsset[] // default no input asserts
}

export interface ContractEvent<T extends Fields = Fields> {
  txId: string
  blockHash: string
  contractAddress: string
  eventIndex: number
  name: string
  fields: T
}

export type DebugMessage = node.DebugMessage

export interface TestContractResult<R> {
  contractId: string
  contractAddress: string
  returns: R
  gasUsed: number
  contracts: ContractState[]
  txOutputs: Output[]
  events: ContractEvent[]
  debugMessages: DebugMessage[]
}
export declare type Output = AssetOutput | ContractOutput
export interface AssetOutput extends Asset {
  type: string
  address: string
  lockTime: number
  message: string
}
export interface ContractOutput {
  type: string
  address: string
  alphAmount: Number256
  tokens?: Token[]
}

function fromApiOutput(output: node.Output): Output {
  if (output.type === 'AssetOutput') {
    const asset = output as node.AssetOutput
    return {
      type: 'AssetOutput',
      address: asset.address,
      alphAmount: fromApiNumber256(asset.attoOxmAmount),
      tokens: fromApiTokens(asset.tokens),
      lockTime: asset.lockTime,
      message: asset.message
    }
  } else if (output.type === 'ContractOutput') {
    const asset = output as node.ContractOutput
    return {
      type: 'ContractOutput',
      address: asset.address,
      alphAmount: fromApiNumber256(asset.attoOxmAmount),
      tokens: fromApiTokens(asset.tokens)
    }
  } else {
    throw new Error(`Unknown output type: ${output}`)
  }
}

export function randomTxId(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return binToHex(bytes)
}

export interface DeployContractParams<P extends Fields = Fields> {
  initialFields: P
  initialAttoOxmAmount?: Number256
  initialTokenAmounts?: Token[]
  issueTokenAmount?: Number256
  gasAmount?: number
  gasPrice?: Number256
}
assertType<
  Eq<
    Omit<DeployContractParams<undefined>, 'initialFields'>,
    Omit<SignDeployContractTxParams, 'signerAddress' | 'signerKeyType' | 'bytecode'>
  >
>
export type DeployContractResult<T extends ContractInstance> = Omit<
  SignDeployContractTxResult,
  'contractId' | 'contractAddress' | 'groupIndex'
> & {
  contractInstance: T
}

export abstract class ContractFactory<I extends ContractInstance, F extends Fields = Fields> {
  readonly contract: Contract

  constructor(contract: Contract) {
    this.contract = contract
  }

  abstract at(address: string): I

  async deploy(signer: SignerProvider, deployParams: DeployContractParams<F>): Promise<DeployContractResult<I>> {
    const signerParams = await this.contract.txParamsForDeployment(signer, {
      ...deployParams,
      initialFields: addStdIdToFields(this.contract, deployParams.initialFields)
    })
    const result = await signer.signAndSubmitDeployContractTx(signerParams)
    return {
      ...result,
      contractInstance: this.at(result.contractAddress)
    }
  }

  // This is used for testing contract functions
  stateForTest(initFields: F, asset?: Asset, address?: string): ContractState<F> {
    const newAsset = {
      alphAmount: asset?.alphAmount ?? ONE_OXM,
      tokens: asset?.tokens
    }
    return this.contract.toState(addStdIdToFields(this.contract, initFields), newAsset, address)
  }
}

export class ExecutableScript<P extends Fields = Fields> {
  readonly script: Script

  constructor(script: Script) {
    this.script = script
  }

  async execute(signer: SignerProvider, params: ExecuteScriptParams<P>): Promise<ExecuteScriptResult> {
    const signerParams = await this.script.txParamsForExecution(signer, params)
    return await signer.signAndSubmitExecuteScriptTx(signerParams)
  }
}

export interface ExecuteScriptParams<P extends Fields = Fields> {
  initialFields: P
  attoOxmAmount?: Number256
  tokens?: Token[]
  gasAmount?: number
  gasPrice?: Number256
}

export interface ExecuteScriptResult {
  groupIndex: number
  unsignedTx: string
  txId: string
  signature: string
  gasAmount: number
  gasPrice: Number256
}

export interface CallContractParams<T extends Arguments = Arguments> {
  args: T
  worldStateBlockHash?: string
  txId?: string
  existingContracts?: string[]
  inputAssets?: node.TestInputAsset[]
}

export interface CallContractResult<R> {
  returns: R
  gasUsed: number
  contracts: ContractState[]
  txInputs: string[]
  txOutputs: Output[]
  events: ContractEvent[]
}

function specialContractAddress(n: number): string {
  const bytes = new Uint8Array(32).fill(0)
  bytes[31] = n
  return addressFromContractId(binToHex(bytes))
}

export const CreateContractEventAddress = specialContractAddress(-1)
export const DestroyContractEventAddress = specialContractAddress(-2)

export type ContractCreatedEventFields = {
  address: Address
  parentAddress?: Address
  stdInterfaceIdGuessed?: HexString
}
export type ContractDestroyedEventFields = {
  address: Address
}
export type ContractCreatedEvent = ContractEvent<ContractCreatedEventFields>
export type ContractDestroyedEvent = ContractEvent<ContractDestroyedEventFields>

function decodeSystemEvent(event: node.ContractEvent, eventSig: EventSig, eventIndex: number): Fields {
  if (event.eventIndex !== eventIndex) {
    throw new Error(`Invalid event index: ${event.eventIndex}, expected: ${eventIndex}`)
  }
  return fromApiEventFields(event.fields, eventSig, true)
}

function toContractCreatedEventFields(fields: Fields): ContractCreatedEventFields {
  const parentAddress = fields['parentAddress'] as string
  const stdInterfaceId = fields['stdInterfaceId'] as string
  return {
    address: fields['address'] as Address,
    parentAddress: parentAddress === '' ? undefined : (parentAddress as Address),
    stdInterfaceIdGuessed: stdInterfaceId === '' ? undefined : (stdInterfaceId as HexString)
  }
}

export function decodeContractCreatedEvent(event: node.ContractEvent): Omit<ContractCreatedEvent, 'contractAddress'> {
  const fields = decodeSystemEvent(event, Contract.ContractCreatedEvent, Contract.ContractCreatedEventIndex)
  return {
    blockHash: event.blockHash,
    txId: event.txId,
    eventIndex: event.eventIndex,
    name: Contract.ContractCreatedEvent.name,
    fields: toContractCreatedEventFields(fields)
  }
}

export function decodeContractDestroyedEvent(
  event: node.ContractEvent
): Omit<ContractDestroyedEvent, 'contractAddress'> {
  const fields = decodeSystemEvent(event, Contract.ContractDestroyedEvent, Contract.ContractDestroyedEventIndex)
  return {
    blockHash: event.blockHash,
    txId: event.txId,
    eventIndex: event.eventIndex,
    name: Contract.ContractDestroyedEvent.name,
    fields: { address: fields['address'] as Address }
  }
}

export function subscribeEventsFromContract<T extends Fields, M extends ContractEvent<T>>(
  options: EventSubscribeOptions<M>,
  address: string,
  eventIndex: number,
  decodeFunc: (event: node.ContractEvent) => M,
  fromCount?: number
): EventSubscription {
  const messageCallback = (event: node.ContractEvent): Promise<void> => {
    if (event.eventIndex !== eventIndex) {
      return Promise.resolve()
    }
    return options.messageCallback(decodeFunc(event))
  }

  const errorCallback = (err: any, subscription: Subscription<node.ContractEvent>): Promise<void> => {
    return options.errorCallback(err, subscription as unknown as Subscription<M>)
  }
  const opt: EventSubscribeOptions<node.ContractEvent> = {
    pollingInterval: options.pollingInterval,
    messageCallback: messageCallback,
    errorCallback: errorCallback,
    onEventCountChanged: options.onEventCountChanged
  }
  return subscribeToEvents(opt, address, fromCount)
}

export function addStdIdToFields<F extends Fields>(
  contract: Contract,
  fields: F
): F | (F & { __stdInterfaceId: HexString }) {
  const stdInterfaceIdPrefix = '414c5048' // the hex of 'OXM'
  return contract.stdInterfaceId === undefined
    ? fields
    : { ...fields, __stdInterfaceId: stdInterfaceIdPrefix + contract.stdInterfaceId }
}

export async function testMethod<I extends ContractInstance, F extends Fields, A extends Arguments, R>(
  contract: ContractFactory<I, F>,
  methodName: string,
  params: Optional<TestContractParams<F, A>, 'testArgs' | 'initialFields'>
): Promise<TestContractResult<R>> {
  const txId = params?.txId ?? randomTxId()
  const initialFields = params.initialFields === undefined ? {} : params.initialFields
  const apiParams = contract.contract.toApiTestContractParams(methodName, {
    ...params,
    txId: txId,
    initialFields: addStdIdToFields(contract.contract, initialFields),
    testArgs: params.testArgs === undefined ? {} : params.testArgs
  })
  const apiResult = await getCurrentNodeProvider().contracts.postContractsTestContract(apiParams)
  const testResult = contract.contract.fromApiTestContractResult(methodName, apiResult, txId)
  contract.contract.printDebugMessages(methodName, testResult.debugMessages)
  return testResult as TestContractResult<R>
}

export abstract class ContractInstance {
  readonly address: Address
  readonly contractId: string
  readonly groupIndex: number

  constructor(address: Address) {
    this.address = address
    this.contractId = binToHex(contractIdFromAddress(address))
    this.groupIndex = groupOfAddress(address)
  }
}

export async function fetchContractState<F extends Fields, I extends ContractInstance>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance
): Promise<ContractState<F>> {
  const contractState = await getCurrentNodeProvider().contracts.getContractsAddressState(instance.address, {
    group: instance.groupIndex
  })
  const state = contract.contract.fromApiContractState(contractState)
  return {
    ...state,
    fields: state.fields as F
  }
}

export function subscribeContractCreatedEvent(
  options: EventSubscribeOptions<ContractCreatedEvent>,
  fromCount?: number
): EventSubscription {
  return subscribeEventsFromContract(
    options,
    CreateContractEventAddress,
    Contract.ContractCreatedEventIndex,
    (event) => {
      return {
        ...decodeContractCreatedEvent(event),
        contractAddress: CreateContractEventAddress
      }
    },
    fromCount
  )
}

export function subscribeContractDestroyedEvent(
  options: EventSubscribeOptions<ContractDestroyedEvent>,
  fromCount?: number
): EventSubscription {
  return subscribeEventsFromContract(
    options,
    DestroyContractEventAddress,
    Contract.ContractDestroyedEventIndex,
    (event) => {
      return {
        ...decodeContractDestroyedEvent(event),
        contractAddress: DestroyContractEventAddress
      }
    },
    fromCount
  )
}

export function decodeEvent<F extends Fields, M extends ContractEvent<F>>(
  contract: Contract,
  instance: ContractInstance,
  event: node.ContractEvent,
  targetEventIndex: number
): M {
  if (
    event.eventIndex !== targetEventIndex &&
    !(targetEventIndex >= 0 && targetEventIndex < contract.eventsSig.length)
  ) {
    throw new Error('Invalid event index: ' + event.eventIndex + ', expected: ' + targetEventIndex)
  }
  const eventSig = contract.eventsSig[`${targetEventIndex}`]
  const fieldNames = eventSig.fieldNames
  const fieldTypes = eventSig.fieldTypes
  const fields = fromApiVals(event.fields, fieldNames, fieldTypes)
  return {
    contractAddress: instance.address,
    blockHash: event.blockHash,
    txId: event.txId,
    eventIndex: event.eventIndex,
    name: eventSig.name,
    fields: fields
  } as M
}

export function subscribeContractEvent<F extends Fields, M extends ContractEvent<F>>(
  contract: Contract,
  instance: ContractInstance,
  options: EventSubscribeOptions<M>,
  eventName: string,
  fromCount?: number
): EventSubscription {
  const eventIndex = contract.eventsSig.findIndex((sig) => sig.name === eventName)
  return subscribeEventsFromContract<F, M>(
    options,
    instance.address,
    eventIndex,
    (event) => decodeEvent(contract, instance, event, eventIndex),
    fromCount
  )
}

export function subscribeContractEvents(
  contract: Contract,
  instance: ContractInstance,
  options: EventSubscribeOptions<ContractEvent<any>>,
  fromCount?: number
): EventSubscription {
  const messageCallback = (event: node.ContractEvent): Promise<void> => {
    return options.messageCallback({
      ...decodeEvent(contract, instance, event, event.eventIndex),
      contractAddress: instance.address
    })
  }
  const errorCallback = (err: any, subscription: Subscription<node.ContractEvent>): Promise<void> => {
    return options.errorCallback(err, subscription as unknown as Subscription<ContractEvent<any>>)
  }
  const opt: EventSubscribeOptions<node.ContractEvent> = {
    pollingInterval: options.pollingInterval,
    messageCallback: messageCallback,
    errorCallback: errorCallback,
    onEventCountChanged: options.onEventCountChanged
  }
  return subscribeToEvents(opt, instance.address, fromCount)
}

export async function callMethod<I extends ContractInstance, F extends Fields, A extends Arguments, R>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance,
  methodName: string,
  params: Optional<CallContractParams<A>, 'args'>,
  getContractByCodeHash?: (codeHash: string) => Contract
): Promise<CallContractResult<R>> {
  const methodIndex = contract.contract.getMethodIndex(methodName)
  const txId = params?.txId ?? randomTxId()
  const callParams = contract.contract.toApiCallContract(
    { ...params, txId: txId, args: params.args === undefined ? {} : params.args },
    instance.groupIndex,
    instance.address,
    methodIndex
  )
  const result = await getCurrentNodeProvider().contracts.postContractsCallContract(callParams)
  const callResult = contract.contract.fromApiCallContractResult(result, txId, methodIndex, getContractByCodeHash)
  return callResult as CallContractResult<R>
}

export async function multicallMethods<I extends ContractInstance, F extends Fields>(
  contract: ContractFactory<I, F>,
  instance: ContractInstance,
  calls: Record<string, Optional<CallContractParams<any>, 'args'>>,
  getContractByCodeHash?: (codeHash: string) => Contract
): Promise<Record<string, CallContractResult<any>>> {
  const callEntries = Object.entries(calls)
  const callsParams = callEntries.map((entry) => {
    const [methodName, params] = entry
    const methodIndex = contract.contract.getMethodIndex(methodName)
    const txId = params?.txId ?? randomTxId()
    return contract.contract.toApiCallContract(
      { ...params, txId: txId, args: params.args === undefined ? {} : params.args },
      instance.groupIndex,
      instance.address,
      methodIndex
    )
  })
  const result = await getCurrentNodeProvider().contracts.postContractsMulticallContract({ calls: callsParams })
  const callsResult: Record<string, CallContractResult<any>> = {}
  callsParams.forEach((call, index) => {
    const methodIndex = call.methodIndex
    const callResult = result.results[`${methodIndex}`]
    const methodName = callEntries[`${index}`][`0`]
    callsResult[`${methodName}`] = contract.contract.fromApiCallContractResult(
      callResult,
      call.txId!,
      methodIndex,
      getContractByCodeHash
    ) as CallContractResult<any>
  })
  return callsResult
}

export async function getContractEventsCurrentCount(contractAddress: Address): Promise<number> {
  return getCurrentNodeProvider()
    .events.getEventsContractContractaddressCurrentCount(contractAddress)
    .catch((error) => {
      if (error instanceof Error && error.message.includes(`${contractAddress} not found`)) {
        return 0
      }
      throw error
    })
}

// This function only works in the simple case where a single non-subcontract is created in the tx
export const getContractIdFromTxId = async (
  nodeProvider: NodeProvider,
  txId: string,
  groupIndex: number
): Promise<HexString> => {
  const txDetails = await nodeProvider.transactions.getTransactionsDetailsTxid(txId, {
    fromGroup: groupIndex,
    toGroup: groupIndex
  })
  const outputIndex = txDetails.unsigned.fixedOutputs.length
  const hex = txId + outputIndex.toString(16).padStart(8, '0')
  const hashHex = binToHex(blake.blake2b(hexToBinUnsafe(hex), undefined, 32))
  return hashHex.slice(0, 62) + groupIndex.toString(16).padStart(2, '0')
}

// This function only works in the simple case where a single non-subcontract is created in the tx
export const getTokenIdFromTxId = getContractIdFromTxId

/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  Asset,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  signExecuteMethod,
  addStdIdToFields,
  encodeContractFields,
  Narrow,
} from "@oxygenium/web3";
import { default as DeprecatedNFTTest7ContractJson } from "../nft/DeprecatedNFTTest7.ral.json";
import { getContractByCodeHash, registerContract } from "./contracts";
import {
  AddStruct1,
  AddStruct2,
  Balances,
  MapValue,
  TokenBalance,
  AllStructs,
} from "./types";

// Custom types for the contract
export namespace DeprecatedNFTTest7Types {
  export type Fields = {
    collectionId: HexString;
    uri: HexString;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getTokenUri: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    returnNegativeIndex: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<[HexString, bigint]>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
  export type MulticallReturnType<Callss extends MultiCallParams[]> = {
    [index in keyof Callss]: MultiCallResults<Callss[index]>;
  };

  export interface SignExecuteMethodTable {
    getTokenUri: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    returnNegativeIndex: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  DeprecatedNFTTest7Instance,
  DeprecatedNFTTest7Types.Fields
> {
  encodeFields(fields: DeprecatedNFTTest7Types.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): DeprecatedNFTTest7Instance {
    return new DeprecatedNFTTest7Instance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest7Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params, getContractByCodeHash);
    },
    returnNegativeIndex: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest7Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<[HexString, bigint]>> => {
      return testMethod(
        this,
        "returnNegativeIndex",
        params,
        getContractByCodeHash
      );
    },
  };

  stateForTest(
    initFields: DeprecatedNFTTest7Types.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const DeprecatedNFTTest7 = new Factory(
  Contract.fromJson(
    DeprecatedNFTTest7ContractJson,
    "",
    "b95c9acf088b090f5d9d34f28ab079cf22b9e53af8ae6864113c71172231ef4c",
    AllStructs
  )
);
registerContract(DeprecatedNFTTest7);

// Use this class to interact with the blockchain
export class DeprecatedNFTTest7Instance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<DeprecatedNFTTest7Types.State> {
    return fetchContractState(DeprecatedNFTTest7, this);
  }

  view = {
    getTokenUri: async (
      params?: DeprecatedNFTTest7Types.CallMethodParams<"getTokenUri">
    ): Promise<DeprecatedNFTTest7Types.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        DeprecatedNFTTest7,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    returnNegativeIndex: async (
      params?: DeprecatedNFTTest7Types.CallMethodParams<"returnNegativeIndex">
    ): Promise<
      DeprecatedNFTTest7Types.CallMethodResult<"returnNegativeIndex">
    > => {
      return callMethod(
        DeprecatedNFTTest7,
        this,
        "returnNegativeIndex",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getTokenUri: async (
      params: DeprecatedNFTTest7Types.SignExecuteMethodParams<"getTokenUri">
    ): Promise<
      DeprecatedNFTTest7Types.SignExecuteMethodResult<"getTokenUri">
    > => {
      return signExecuteMethod(DeprecatedNFTTest7, this, "getTokenUri", params);
    },
    returnNegativeIndex: async (
      params: DeprecatedNFTTest7Types.SignExecuteMethodParams<"returnNegativeIndex">
    ): Promise<
      DeprecatedNFTTest7Types.SignExecuteMethodResult<"returnNegativeIndex">
    > => {
      return signExecuteMethod(
        DeprecatedNFTTest7,
        this,
        "returnNegativeIndex",
        params
      );
    },
  };

  async multicall<Calls extends DeprecatedNFTTest7Types.MultiCallParams>(
    calls: Calls
  ): Promise<DeprecatedNFTTest7Types.MultiCallResults<Calls>>;
  async multicall<Callss extends DeprecatedNFTTest7Types.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<DeprecatedNFTTest7Types.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | DeprecatedNFTTest7Types.MultiCallParams
      | DeprecatedNFTTest7Types.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      DeprecatedNFTTest7,
      this,
      callss,
      getContractByCodeHash
    );
  }
}

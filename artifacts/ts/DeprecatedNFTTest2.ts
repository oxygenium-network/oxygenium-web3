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
import { default as DeprecatedNFTTest2ContractJson } from "../nft/DeprecatedNFTTest2.ral.json";
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
export namespace DeprecatedNFTTest2Types {
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
    getCollectionId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
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
    getCollectionId: {
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
  DeprecatedNFTTest2Instance,
  DeprecatedNFTTest2Types.Fields
> {
  encodeFields(fields: DeprecatedNFTTest2Types.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): DeprecatedNFTTest2Instance {
    return new DeprecatedNFTTest2Instance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest2Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params, getContractByCodeHash);
    },
    getCollectionId: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest2Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getCollectionId", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: DeprecatedNFTTest2Types.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const DeprecatedNFTTest2 = new Factory(
  Contract.fromJson(
    DeprecatedNFTTest2ContractJson,
    "",
    "ade9aee476ee752050a1e9e1b19039f05261cb3f53941152617174faf9eae572",
    AllStructs
  )
);
registerContract(DeprecatedNFTTest2);

// Use this class to interact with the blockchain
export class DeprecatedNFTTest2Instance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<DeprecatedNFTTest2Types.State> {
    return fetchContractState(DeprecatedNFTTest2, this);
  }

  view = {
    getTokenUri: async (
      params?: DeprecatedNFTTest2Types.CallMethodParams<"getTokenUri">
    ): Promise<DeprecatedNFTTest2Types.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        DeprecatedNFTTest2,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollectionId: async (
      params?: DeprecatedNFTTest2Types.CallMethodParams<"getCollectionId">
    ): Promise<DeprecatedNFTTest2Types.CallMethodResult<"getCollectionId">> => {
      return callMethod(
        DeprecatedNFTTest2,
        this,
        "getCollectionId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getTokenUri: async (
      params: DeprecatedNFTTest2Types.SignExecuteMethodParams<"getTokenUri">
    ): Promise<
      DeprecatedNFTTest2Types.SignExecuteMethodResult<"getTokenUri">
    > => {
      return signExecuteMethod(DeprecatedNFTTest2, this, "getTokenUri", params);
    },
    getCollectionId: async (
      params: DeprecatedNFTTest2Types.SignExecuteMethodParams<"getCollectionId">
    ): Promise<
      DeprecatedNFTTest2Types.SignExecuteMethodResult<"getCollectionId">
    > => {
      return signExecuteMethod(
        DeprecatedNFTTest2,
        this,
        "getCollectionId",
        params
      );
    },
  };

  async multicall<Calls extends DeprecatedNFTTest2Types.MultiCallParams>(
    calls: Calls
  ): Promise<DeprecatedNFTTest2Types.MultiCallResults<Calls>>;
  async multicall<Callss extends DeprecatedNFTTest2Types.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<DeprecatedNFTTest2Types.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | DeprecatedNFTTest2Types.MultiCallParams
      | DeprecatedNFTTest2Types.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      DeprecatedNFTTest2,
      this,
      callss,
      getContractByCodeHash
    );
  }
}

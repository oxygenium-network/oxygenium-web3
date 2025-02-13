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
} from "@oxygenium-network/web3";
import { default as WrongNFTTestContractJson } from "../nft/WrongNFTTest.ral.json";
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
export namespace WrongNFTTestTypes {
  export type Fields = {
    collectionId: HexString;
    nftIndex: bigint;
    uri: HexString;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getTokenUri: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getCollectionIndex: {
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
    getCollectionIndex: {
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
  WrongNFTTestInstance,
  WrongNFTTestTypes.Fields
> {
  encodeFields(fields: WrongNFTTestTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): WrongNFTTestInstance {
    return new WrongNFTTestInstance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<WrongNFTTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params, getContractByCodeHash);
    },
    getCollectionIndex: async (
      params: Omit<
        TestContractParamsWithoutMaps<WrongNFTTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<[HexString, bigint]>> => {
      return testMethod(
        this,
        "getCollectionIndex",
        params,
        getContractByCodeHash
      );
    },
  };

  stateForTest(
    initFields: WrongNFTTestTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const WrongNFTTest = new Factory(
  Contract.fromJson(
    WrongNFTTestContractJson,
    "",
    "7dd2ed643a98b2a1a52a9b9e536fcdae60d961b583b8109f777d846bfdfcae8d",
    AllStructs
  )
);
registerContract(WrongNFTTest);

// Use this class to interact with the blockchain
export class WrongNFTTestInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<WrongNFTTestTypes.State> {
    return fetchContractState(WrongNFTTest, this);
  }

  view = {
    getTokenUri: async (
      params?: WrongNFTTestTypes.CallMethodParams<"getTokenUri">
    ): Promise<WrongNFTTestTypes.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        WrongNFTTest,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollectionIndex: async (
      params?: WrongNFTTestTypes.CallMethodParams<"getCollectionIndex">
    ): Promise<WrongNFTTestTypes.CallMethodResult<"getCollectionIndex">> => {
      return callMethod(
        WrongNFTTest,
        this,
        "getCollectionIndex",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getTokenUri: async (
      params: WrongNFTTestTypes.SignExecuteMethodParams<"getTokenUri">
    ): Promise<WrongNFTTestTypes.SignExecuteMethodResult<"getTokenUri">> => {
      return signExecuteMethod(WrongNFTTest, this, "getTokenUri", params);
    },
    getCollectionIndex: async (
      params: WrongNFTTestTypes.SignExecuteMethodParams<"getCollectionIndex">
    ): Promise<
      WrongNFTTestTypes.SignExecuteMethodResult<"getCollectionIndex">
    > => {
      return signExecuteMethod(
        WrongNFTTest,
        this,
        "getCollectionIndex",
        params
      );
    },
  };

  async multicall<Calls extends WrongNFTTestTypes.MultiCallParams>(
    calls: Calls
  ): Promise<WrongNFTTestTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends WrongNFTTestTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<WrongNFTTestTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | WrongNFTTestTypes.MultiCallParams
      | WrongNFTTestTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      WrongNFTTest,
      this,
      callss,
      getContractByCodeHash
    );
  }
}

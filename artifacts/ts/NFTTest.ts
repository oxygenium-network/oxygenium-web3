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
  SubscribeOptions,
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
  ContractInstance,
  getContractEventsCurrentCount,
} from "@alephium/web3";
import { default as NFTTestContractJson } from "../nft/NFTTest.ral.json";

// Custom types for the contract
export namespace NFTTestTypes {
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
}

class Factory extends ContractFactory<NFTTestInstance, NFTTestTypes.Fields> {
  at(address: string): NFTTestInstance {
    return new NFTTestInstance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<TestContractParams<NFTTestTypes.Fields, never>, "testArgs">
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getTokenUri", params);
    },
    getCollectionId: async (
      params: Omit<TestContractParams<NFTTestTypes.Fields, never>, "testArgs">
    ): Promise<TestContractResult<HexString>> => {
      return testMethod(this, "getCollectionId", params);
    },
  };
}

// Use this object to test and deploy the contract
export const NFTTest = new Factory(
  Contract.fromJson(
    NFTTestContractJson,
    "",
    "657b46b2236b78c955660db6731d43b42dd8204bb6220181de3c5f8678d90da0"
  )
);

// Use this class to interact with the blockchain
export class NFTTestInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<NFTTestTypes.State> {
    return fetchContractState(NFTTest, this);
  }

  methods = {
    getTokenUri: async (
      params?: NFTTestTypes.CallMethodParams<"getTokenUri">
    ): Promise<NFTTestTypes.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        NFTTest,
        this,
        "getTokenUri",
        params === undefined ? {} : params
      );
    },
    getCollectionId: async (
      params?: NFTTestTypes.CallMethodParams<"getCollectionId">
    ): Promise<NFTTestTypes.CallMethodResult<"getCollectionId">> => {
      return callMethod(
        NFTTest,
        this,
        "getCollectionId",
        params === undefined ? {} : params
      );
    },
  };

  async multicall<Calls extends NFTTestTypes.MultiCallParams>(
    calls: Calls
  ): Promise<NFTTestTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      NFTTest,
      this,
      calls
    )) as NFTTestTypes.MultiCallResults<Calls>;
  }
}

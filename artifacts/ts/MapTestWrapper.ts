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
} from "@alephium/web3";
import { default as MapTestWrapperContractJson } from "../test/MapTestWrapper.ral.json";
import { getContractByCodeHash } from "./contracts";
import {
  AddStruct1,
  AddStruct2,
  Balances,
  MapValue,
  TokenBalance,
  AllStructs,
} from "./types";

// Custom types for the contract
export namespace MapTestWrapperTypes {
  export type Fields = {
    inner: HexString;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    insert: {
      params: CallContractParams<{ key: Address; value: MapValue }>;
      result: CallContractResult<null>;
    };
    update: {
      params: CallContractParams<{ key: Address }>;
      result: CallContractResult<null>;
    };
    remove: {
      params: CallContractParams<{ key: Address }>;
      result: CallContractResult<null>;
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
    insert: {
      params: SignExecuteContractMethodParams<{
        key: Address;
        value: MapValue;
      }>;
      result: SignExecuteScriptTxResult;
    };
    update: {
      params: SignExecuteContractMethodParams<{ key: Address }>;
      result: SignExecuteScriptTxResult;
    };
    remove: {
      params: SignExecuteContractMethodParams<{ key: Address }>;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  MapTestWrapperInstance,
  MapTestWrapperTypes.Fields
> {
  encodeFields(fields: MapTestWrapperTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): MapTestWrapperInstance {
    return new MapTestWrapperInstance(address);
  }

  tests = {
    insert: async (
      params: TestContractParamsWithoutMaps<
        MapTestWrapperTypes.Fields,
        { key: Address; value: MapValue }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "insert", params, getContractByCodeHash);
    },
    update: async (
      params: TestContractParamsWithoutMaps<
        MapTestWrapperTypes.Fields,
        { key: Address }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "update", params, getContractByCodeHash);
    },
    remove: async (
      params: TestContractParamsWithoutMaps<
        MapTestWrapperTypes.Fields,
        { key: Address }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "remove", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: MapTestWrapperTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const MapTestWrapper = new Factory(
  Contract.fromJson(
    MapTestWrapperContractJson,
    "",
    "1d525d3e4cbd1c8f4c0431bf6881e888eeebae012a14532530097f62dd766e9a",
    AllStructs
  )
);

// Use this class to interact with the blockchain
export class MapTestWrapperInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<MapTestWrapperTypes.State> {
    return fetchContractState(MapTestWrapper, this);
  }

  view = {
    insert: async (
      params: MapTestWrapperTypes.CallMethodParams<"insert">
    ): Promise<MapTestWrapperTypes.CallMethodResult<"insert">> => {
      return callMethod(
        MapTestWrapper,
        this,
        "insert",
        params,
        getContractByCodeHash
      );
    },
    update: async (
      params: MapTestWrapperTypes.CallMethodParams<"update">
    ): Promise<MapTestWrapperTypes.CallMethodResult<"update">> => {
      return callMethod(
        MapTestWrapper,
        this,
        "update",
        params,
        getContractByCodeHash
      );
    },
    remove: async (
      params: MapTestWrapperTypes.CallMethodParams<"remove">
    ): Promise<MapTestWrapperTypes.CallMethodResult<"remove">> => {
      return callMethod(
        MapTestWrapper,
        this,
        "remove",
        params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    insert: async (
      params: MapTestWrapperTypes.SignExecuteMethodParams<"insert">
    ): Promise<MapTestWrapperTypes.SignExecuteMethodResult<"insert">> => {
      return signExecuteMethod(MapTestWrapper, this, "insert", params);
    },
    update: async (
      params: MapTestWrapperTypes.SignExecuteMethodParams<"update">
    ): Promise<MapTestWrapperTypes.SignExecuteMethodResult<"update">> => {
      return signExecuteMethod(MapTestWrapper, this, "update", params);
    },
    remove: async (
      params: MapTestWrapperTypes.SignExecuteMethodParams<"remove">
    ): Promise<MapTestWrapperTypes.SignExecuteMethodResult<"remove">> => {
      return signExecuteMethod(MapTestWrapper, this, "remove", params);
    },
  };
}

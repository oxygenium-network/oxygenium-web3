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
import { default as FakeTokenTestContractJson } from "../token/FakeTokenTest.ral.json";
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
export namespace FakeTokenTestTypes {
  export type Fields = {
    a: bigint;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getSymbol: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getName: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getDecimals: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getTotalSupply: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    foo: {
      params: Omit<CallContractParams<{}>, "args">;
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
    getSymbol: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getName: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getDecimals: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getTotalSupply: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    foo: {
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
  FakeTokenTestInstance,
  FakeTokenTestTypes.Fields
> {
  encodeFields(fields: FakeTokenTestTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): FakeTokenTestInstance {
    return new FakeTokenTestInstance(address);
  }

  tests = {
    getSymbol: async (
      params: Omit<
        TestContractParamsWithoutMaps<FakeTokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getSymbol", params, getContractByCodeHash);
    },
    getName: async (
      params: Omit<
        TestContractParamsWithoutMaps<FakeTokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getName", params, getContractByCodeHash);
    },
    getDecimals: async (
      params: Omit<
        TestContractParamsWithoutMaps<FakeTokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getDecimals", params, getContractByCodeHash);
    },
    getTotalSupply: async (
      params: Omit<
        TestContractParamsWithoutMaps<FakeTokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getTotalSupply", params, getContractByCodeHash);
    },
    foo: async (
      params: Omit<
        TestContractParamsWithoutMaps<FakeTokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "foo", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: FakeTokenTestTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const FakeTokenTest = new Factory(
  Contract.fromJson(
    FakeTokenTestContractJson,
    "",
    "52f971cb44d54a5353e94dc8db991d2726f76760af782e79bd8a66a9b5b294b7",
    AllStructs
  )
);
registerContract(FakeTokenTest);

// Use this class to interact with the blockchain
export class FakeTokenTestInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<FakeTokenTestTypes.State> {
    return fetchContractState(FakeTokenTest, this);
  }

  view = {
    getSymbol: async (
      params?: FakeTokenTestTypes.CallMethodParams<"getSymbol">
    ): Promise<FakeTokenTestTypes.CallMethodResult<"getSymbol">> => {
      return callMethod(
        FakeTokenTest,
        this,
        "getSymbol",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getName: async (
      params?: FakeTokenTestTypes.CallMethodParams<"getName">
    ): Promise<FakeTokenTestTypes.CallMethodResult<"getName">> => {
      return callMethod(
        FakeTokenTest,
        this,
        "getName",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDecimals: async (
      params?: FakeTokenTestTypes.CallMethodParams<"getDecimals">
    ): Promise<FakeTokenTestTypes.CallMethodResult<"getDecimals">> => {
      return callMethod(
        FakeTokenTest,
        this,
        "getDecimals",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTotalSupply: async (
      params?: FakeTokenTestTypes.CallMethodParams<"getTotalSupply">
    ): Promise<FakeTokenTestTypes.CallMethodResult<"getTotalSupply">> => {
      return callMethod(
        FakeTokenTest,
        this,
        "getTotalSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    foo: async (
      params?: FakeTokenTestTypes.CallMethodParams<"foo">
    ): Promise<FakeTokenTestTypes.CallMethodResult<"foo">> => {
      return callMethod(
        FakeTokenTest,
        this,
        "foo",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getSymbol: async (
      params: FakeTokenTestTypes.SignExecuteMethodParams<"getSymbol">
    ): Promise<FakeTokenTestTypes.SignExecuteMethodResult<"getSymbol">> => {
      return signExecuteMethod(FakeTokenTest, this, "getSymbol", params);
    },
    getName: async (
      params: FakeTokenTestTypes.SignExecuteMethodParams<"getName">
    ): Promise<FakeTokenTestTypes.SignExecuteMethodResult<"getName">> => {
      return signExecuteMethod(FakeTokenTest, this, "getName", params);
    },
    getDecimals: async (
      params: FakeTokenTestTypes.SignExecuteMethodParams<"getDecimals">
    ): Promise<FakeTokenTestTypes.SignExecuteMethodResult<"getDecimals">> => {
      return signExecuteMethod(FakeTokenTest, this, "getDecimals", params);
    },
    getTotalSupply: async (
      params: FakeTokenTestTypes.SignExecuteMethodParams<"getTotalSupply">
    ): Promise<
      FakeTokenTestTypes.SignExecuteMethodResult<"getTotalSupply">
    > => {
      return signExecuteMethod(FakeTokenTest, this, "getTotalSupply", params);
    },
    foo: async (
      params: FakeTokenTestTypes.SignExecuteMethodParams<"foo">
    ): Promise<FakeTokenTestTypes.SignExecuteMethodResult<"foo">> => {
      return signExecuteMethod(FakeTokenTest, this, "foo", params);
    },
  };

  async multicall<Calls extends FakeTokenTestTypes.MultiCallParams>(
    calls: Calls
  ): Promise<FakeTokenTestTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends FakeTokenTestTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<FakeTokenTestTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | FakeTokenTestTypes.MultiCallParams
      | FakeTokenTestTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      FakeTokenTest,
      this,
      callss,
      getContractByCodeHash
    );
  }
}

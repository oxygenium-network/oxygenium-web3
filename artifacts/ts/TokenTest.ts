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
import { default as TokenTestContractJson } from "../token/TokenTest.ral.json";
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
export namespace TokenTestTypes {
  export type Fields = {
    symbol: HexString;
    name: HexString;
    decimals: bigint;
    totalSupply: bigint;
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
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  TokenTestInstance,
  TokenTestTypes.Fields
> {
  encodeFields(fields: TokenTestTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): TokenTestInstance {
    return new TokenTestInstance(address);
  }

  tests = {
    getSymbol: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getSymbol", params, getContractByCodeHash);
    },
    getName: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getName", params, getContractByCodeHash);
    },
    getDecimals: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getDecimals", params, getContractByCodeHash);
    },
    getTotalSupply: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTestTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getTotalSupply", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: TokenTestTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const TokenTest = new Factory(
  Contract.fromJson(
    TokenTestContractJson,
    "",
    "a2800413eb2c5c23d48068db23df5f8eeaba04653e12c8ed59d589720d96dadd",
    AllStructs
  )
);
registerContract(TokenTest);

// Use this class to interact with the blockchain
export class TokenTestInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<TokenTestTypes.State> {
    return fetchContractState(TokenTest, this);
  }

  view = {
    getSymbol: async (
      params?: TokenTestTypes.CallMethodParams<"getSymbol">
    ): Promise<TokenTestTypes.CallMethodResult<"getSymbol">> => {
      return callMethod(
        TokenTest,
        this,
        "getSymbol",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getName: async (
      params?: TokenTestTypes.CallMethodParams<"getName">
    ): Promise<TokenTestTypes.CallMethodResult<"getName">> => {
      return callMethod(
        TokenTest,
        this,
        "getName",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDecimals: async (
      params?: TokenTestTypes.CallMethodParams<"getDecimals">
    ): Promise<TokenTestTypes.CallMethodResult<"getDecimals">> => {
      return callMethod(
        TokenTest,
        this,
        "getDecimals",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTotalSupply: async (
      params?: TokenTestTypes.CallMethodParams<"getTotalSupply">
    ): Promise<TokenTestTypes.CallMethodResult<"getTotalSupply">> => {
      return callMethod(
        TokenTest,
        this,
        "getTotalSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getSymbol: async (
      params: TokenTestTypes.SignExecuteMethodParams<"getSymbol">
    ): Promise<TokenTestTypes.SignExecuteMethodResult<"getSymbol">> => {
      return signExecuteMethod(TokenTest, this, "getSymbol", params);
    },
    getName: async (
      params: TokenTestTypes.SignExecuteMethodParams<"getName">
    ): Promise<TokenTestTypes.SignExecuteMethodResult<"getName">> => {
      return signExecuteMethod(TokenTest, this, "getName", params);
    },
    getDecimals: async (
      params: TokenTestTypes.SignExecuteMethodParams<"getDecimals">
    ): Promise<TokenTestTypes.SignExecuteMethodResult<"getDecimals">> => {
      return signExecuteMethod(TokenTest, this, "getDecimals", params);
    },
    getTotalSupply: async (
      params: TokenTestTypes.SignExecuteMethodParams<"getTotalSupply">
    ): Promise<TokenTestTypes.SignExecuteMethodResult<"getTotalSupply">> => {
      return signExecuteMethod(TokenTest, this, "getTotalSupply", params);
    },
  };

  async multicall<Calls extends TokenTestTypes.MultiCallParams>(
    calls: Calls
  ): Promise<TokenTestTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends TokenTestTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<TokenTestTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | TokenTestTypes.MultiCallParams
      | TokenTestTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      TokenTest,
      this,
      callss,
      getContractByCodeHash
    );
  }
}

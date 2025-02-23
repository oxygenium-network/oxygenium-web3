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
import { Val, toApiAddress, toApiBoolean, toApiByteVec, toApiNumber256 } from '../api'
import { bs58, isHexString } from '../utils'
import { Fields, FieldsSig } from './contract'

const bigIntZero = BigInt(0)

class UnSigned {
  static readonly oneByteBound = BigInt(0x40)
  static readonly twoByteBound = UnSigned.oneByteBound << BigInt(8)
  static readonly fourByteBound = UnSigned.oneByteBound << BigInt(8 * 3)
  static readonly u256UpperBound = BigInt(1) << BigInt(256)
}

class Signed {
  static readonly oneByteBound = BigInt(0x20)
  static readonly twoByteBound = Signed.oneByteBound << BigInt(8)
  static readonly fourByteBound = Signed.oneByteBound << BigInt(8 * 3)
  static readonly i256UpperBound = BigInt(1) << BigInt(255)
  static readonly i256LowerBound = -this.i256UpperBound
}

class CompactInt {
  static readonly oneBytePrefix = 0x00
  static readonly oneByteNegPrefix = 0xc0
  static readonly twoBytePrefix = 0x40
  static readonly twoByteNegPrefix = 0x80
  static readonly fourBytePrefix = 0x80
  static readonly fourByteNegPrefix = 0x40
  static readonly multiBytePrefix = 0xc0
}

export function encodeBool(bool: boolean): Uint8Array {
  return bool ? Uint8Array.from([1]) : Uint8Array.from([0])
}

export function encodeI256(i256: bigint): Uint8Array {
  if (i256 >= bigIntZero) {
    return encodeI256Positive(i256)
  } else {
    return encodeI256Negative(i256)
  }
}

// n should be positive
function toByteArray(n: bigint, signed: boolean, notBit: boolean): Uint8Array {
  let hex = n.toString(16)
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  } else if (signed && hex[0] >= '8') {
    hex = '00' + hex // add the byte for sign
  }

  const byteLength = hex.length / 2
  const bytes = new Uint8Array(byteLength + 1)
  for (let index = 0; index < byteLength; index++) {
    const offset = index * 2
    const byte = parseInt(hex.slice(offset, offset + 2), 16)
    bytes[`${index + 1}`] = notBit ? ~byte : byte
  }

  const header = byteLength - 4 + CompactInt.multiBytePrefix
  bytes[0] = header
  return bytes
}

function encodeI256Positive(i256: bigint): Uint8Array {
  if (i256 < Signed.oneByteBound) {
    return new Uint8Array([Number(i256) + CompactInt.oneBytePrefix])
  } else if (i256 < Signed.twoByteBound) {
    const num = Number(i256)
    return new Uint8Array([(num >> 8) + CompactInt.twoBytePrefix, num & 0xff])
  } else if (i256 < Signed.fourByteBound) {
    const num = Number(i256)
    return new Uint8Array([(num >> 24) + CompactInt.fourBytePrefix, (num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff])
  } else if (i256 < Signed.i256UpperBound) {
    return toByteArray(i256, true, false)
  } else {
    throw Error(`Too large number for i256: ${i256}`)
  }
}

function encodeI256Negative(i256: bigint): Uint8Array {
  if (i256 >= -Signed.oneByteBound) {
    const num = Number(i256)
    return new Uint8Array([(num ^ CompactInt.oneByteNegPrefix) & 0xff])
  } else if (i256 >= -Signed.twoByteBound) {
    const num = Number(i256)
    return new Uint8Array([((num >> 8) ^ CompactInt.twoByteNegPrefix) & 0xff, num & 0xff])
  } else if (i256 >= -Signed.fourByteBound) {
    const num = Number(i256)
    return new Uint8Array([
      ((num >> 24) ^ CompactInt.fourByteNegPrefix) & 0xff,
      (num >> 16) & 0xff,
      (num >> 8) & 0xff,
      num & 0xff
    ])
  } else if (i256 >= Signed.i256LowerBound) {
    return toByteArray(~i256, true, true)
  } else {
    throw Error(`Too small number for i256: ${i256}`)
  }
}

export function encodeU256(u256: bigint): Uint8Array {
  if (u256 < bigIntZero) {
    throw Error(`Negative number for U256: ${u256}`)
  } else if (u256 < UnSigned.oneByteBound) {
    return new Uint8Array([Number(u256) + CompactInt.oneBytePrefix])
  } else if (u256 < UnSigned.twoByteBound) {
    const num = Number(u256)
    return new Uint8Array([((num >> 8) & 0xff) + CompactInt.twoBytePrefix, num & 0xff])
  } else if (u256 < UnSigned.fourByteBound) {
    const num = Number(u256)
    return new Uint8Array([
      ((num >> 24) & 0xff) + CompactInt.fourBytePrefix,
      (num >> 16) & 0xff,
      (num >> 8) & 0xff,
      num & 0xff
    ])
  } else if (u256 < UnSigned.u256UpperBound) {
    return toByteArray(u256, false, false)
  } else {
    throw Error(`Too large number for U256: ${u256}`)
  }
}

export function encodeByteVec(bytes: string): Uint8Array {
  if (!isHexString(bytes)) {
    throw Error(`Given value ${bytes} is not a valid hex string`)
  }

  const buffer0 = Buffer.from(bytes, 'hex')
  const buffer1 = Buffer.from(encodeI256(BigInt(buffer0.length)))
  return Buffer.concat([buffer1, buffer0])
}

export function encodeAddress(address: string): Uint8Array {
  return bs58.decode(address)
}

function invalidScriptField(tpe: string, value: Val): Error {
  return Error(`Invalid script field ${value} for type ${tpe}`)
}

enum Instruction {
  trueConst = 3,
  falseConst = 4,
  i256Const0 = 5,
  i256Const1 = 6,
  i256Const2 = 7,
  i256Const3 = 8,
  i256Const4 = 9,
  i256Const5 = 10,
  i256ConstN1 = 11,
  u256Const0 = 12,
  u256Const1 = 13,
  u256Const2 = 14,
  u256Const3 = 15,
  u256Const4 = 16,
  u256Const5 = 17,
  i256Const = 18,
  u256Const = 19,
  bytesConst = 20,
  addressConst = 21
}

// TODO: optimize
function encodeScriptFieldI256(value: bigint): Uint8Array {
  return new Uint8Array([Instruction.i256Const, ...encodeI256(value)])
}

// TODO: optimize
function encodeScriptFieldU256(value: bigint): Uint8Array {
  return new Uint8Array([Instruction.u256Const, ...encodeU256(value)])
}

export function encodeScriptFieldAsString(tpe: string, value: Val): string {
  return Buffer.from(encodeScriptField(tpe, value)).toString('hex')
}

// TODO: support array type
export function encodeScriptField(tpe: string, value: Val): Uint8Array {
  switch (tpe) {
    case 'Bool':
      const byte = toApiBoolean(value) ? Instruction.trueConst : Instruction.falseConst
      return new Uint8Array([byte])
    case 'I256':
      const i256 = toApiNumber256(value)
      return encodeScriptFieldI256(BigInt(i256))
    case 'U256':
      const u256 = toApiNumber256(value)
      return encodeScriptFieldU256(BigInt(u256))
    case 'ByteVec':
      const hexStr = toApiByteVec(value)
      return new Uint8Array([Instruction.bytesConst, ...encodeByteVec(hexStr)])
    case 'Address':
      const address = toApiAddress(value)
      return new Uint8Array([Instruction.addressConst, ...encodeAddress(address)])
  }

  throw invalidScriptField(tpe, value)
}

const scriptFieldRegex = /\{([0-9]*)\}/g

export function buildScriptByteCode(bytecodeTemplate: string, fields: Fields, fieldsSig: FieldsSig): string {
  return bytecodeTemplate.replace(scriptFieldRegex, (_, fieldIndex: string) => {
    const fieldName = fieldsSig.names[`${fieldIndex}`]
    const fieldType = fieldsSig.types[`${fieldIndex}`]
    if (fieldName in fields) {
      const fieldValue = fields[`${fieldName}`]
      return _encodeField(fieldName, () => encodeScriptFieldAsString(fieldType, fieldValue))
    } else {
      throw new Error(`The value of field ${fieldName} is not provided`)
    }
  })
}

function _encodeField<T>(fieldName: string, encodeFunc: () => T): T {
  try {
    return encodeFunc()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid ${fieldName}, error: ${error.message}`)
    }
    throw error
  }
}

function encodeFields(fields: Fields, fieldsSig: FieldsSig, mutable: boolean) {
  const fieldIndexes = fieldsSig.isMutable
    .map((_, index) => index)
    .filter((index) => fieldsSig.isMutable[`${index}`] === mutable)
  const fieldsEncoded = fieldIndexes.flatMap((fieldIndex) => {
    const fieldName = fieldsSig.names[`${fieldIndex}`]
    const fieldType = fieldsSig.types[`${fieldIndex}`]
    if (fieldName in fields) {
      const fieldValue = fields[`${fieldName}`]
      return _encodeField(fieldName, () => encodeContractField(fieldType, fieldValue))
    } else {
      throw new Error(`The value of field ${fieldName} is not provided`)
    }
  })
  const fieldsLength = Buffer.from(encodeI256(BigInt(fieldsEncoded.length))).toString('hex')
  return fieldsLength + fieldsEncoded.map((f) => Buffer.from(f).toString('hex')).join('')
}

export function buildContractByteCode(bytecode: string, fields: Fields, fieldsSig: FieldsSig): string {
  const encodedImmFields = encodeFields(fields, fieldsSig, false)
  const encodedMutFields = encodeFields(fields, fieldsSig, true)
  return bytecode + encodedImmFields + encodedMutFields
}

enum ApiValType {
  Bool = 0,
  I256 = 1,
  U256 = 2,
  ByteVec = 3,
  Address = 4
}

function encodeContractFieldI256(value: bigint): Uint8Array {
  return new Uint8Array([ApiValType.I256, ...encodeI256(value)])
}

function encodeContractFieldU256(value: bigint): Uint8Array {
  return new Uint8Array([ApiValType.U256, ...encodeU256(value)])
}

function encodeContractFieldArray(tpe: string, val: Val): Uint8Array[] {
  if (!Array.isArray(val)) {
    throw new Error(`Expected array, got ${val}`)
  }

  const semiColonIndex = tpe.lastIndexOf(';')
  if (semiColonIndex == -1) {
    throw new Error(`Invalid Array type: ${tpe}`)
  }

  const subType = tpe.slice(1, semiColonIndex)
  const dim = parseInt(tpe.slice(semiColonIndex + 1, -1))
  if ((val as Val[]).length != dim) {
    throw new Error(`Invalid val dimension: ${val}`)
  } else {
    return (val as Val[]).flatMap((v) => encodeContractField(subType, v))
  }
}

export function encodeContractField(tpe: string, value: Val): Uint8Array[] {
  switch (tpe) {
    case 'Bool':
      const byte = toApiBoolean(value) ? 1 : 0
      return [new Uint8Array([ApiValType.Bool, byte])]
    case 'I256':
      const i256 = toApiNumber256(value)
      return [encodeContractFieldI256(BigInt(i256))]
    case 'U256':
      const u256 = toApiNumber256(value)
      return [encodeContractFieldU256(BigInt(u256))]
    case 'ByteVec':
      const hexStr = toApiByteVec(value)
      return [new Uint8Array([ApiValType.ByteVec, ...encodeByteVec(hexStr)])]
    case 'Address':
      const address = toApiAddress(value)
      return [new Uint8Array([ApiValType.Address, ...encodeAddress(address)])]

    default:
      // Array type
      return encodeContractFieldArray(tpe, value)
  }
}

export function buildDebugBytecode(bytecode: string, bytecodePatch: string): string {
  if (bytecodePatch === '') {
    return bytecode
  }

  const pattern = /[=+-][0-9a-f]*/g
  let result = ''
  let index = 0
  for (const parts of bytecodePatch.matchAll(pattern)) {
    const part = parts[0]
    const diffType = part[0]
    if (diffType === '=') {
      const length = parseInt(part.substring(1))
      result = result + bytecode.slice(index, index + length)
      index = index + length
    } else if (diffType === '+') {
      result = result + part.substring(1)
    } else {
      const length = parseInt(part.substring(1))
      index = index + length
    }
  }
  return result
}

// export function buildContractByteCode(
//   compiled: node.TemplateContractByteCode,
//   templateVariables: TemplateVariables
// ): string {
//   const methodsBuilt = compiled.methodsByteCode.map((template) => buildByteCode(template, templateVariables))
//   let count = 0
//   const methodIndexes = methodsBuilt.map((hex) => {
//     count += hex.length / 2
//     return count
//   })
//   return (
//     binToHex(encodeI256(BigInt(compiled.filedLength))) +
//     binToHex(encodeI256(BigInt(methodIndexes.length))) +
//     methodIndexes.map((index) => binToHex(encodeI256(BigInt(index)))).join('') +
//     methodsBuilt.join('')
//   )
// }

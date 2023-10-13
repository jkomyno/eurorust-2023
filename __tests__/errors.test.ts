import { expect, describe, test, assert } from 'vitest'
import { isWasmPanic } from '../src/utils/isWasmPanic'
import * as wasm from '../src/wasm/demo_errors'

// Note: "year" is missing!
const eventAsStr = '{ "name": "EuroRust" }'

describe('demo-errors', () => {
  describe('parseWithPanic (no panic hook)', () => {
    test('throws a `RuntimeError` saying `unreachable`', () => {

      try {
        wasm.parseWithPanic(eventAsStr)
        assert(false, 'this should fail')
      } catch (error) {
        const e = error as Error

        assert(e instanceof Error)
        expect(e.name).toEqual('RuntimeError')
        expect(e.message).toMatchInlineSnapshot('"unreachable"')
        assert(isWasmPanic(e))
      }
    })
  })

  describe('parseWithError', () => {
    test('throws an `Error`', () => {
      try {
        wasm.parseWithError(eventAsStr)
        assert(false, 'this should fail')
      } catch (error) {
        const e = error as Error

        assert(e instanceof Error)
        expect(e.name).toEqual('Error')
        expect(e.message).toMatchInlineSnapshot('"missing field `year` at line 1 column 22"')
        assert(!isWasmPanic(e))
      }
    })
  })

  describe('parseWithCustomError', () => {
    test('throws an `Error` with a custom message', () => {
      try {
        wasm.parseWithCustomError(eventAsStr)
        assert(false, 'this should fail')
      } catch (error) {
        const e = error as Error

        assert(e instanceof Error)
        expect(e.name).toEqual('Error')
        expect(e.message).toMatchInlineSnapshot('"[CustomError] missing field `year` at line 1 column 22"')
        assert(!isWasmPanic(e))
      }
    })
  })

  describe('parseWithStringError', () => {
    test('throws a `String`', () => {
      try {
        wasm.parseWithStringError(eventAsStr)
        assert(false, 'this should fail')
      } catch (error) {
        const e = error as string

        assert(typeof e === 'string')
        expect(e).toMatchInlineSnapshot('"missing field `year` at line 1 column 22"')
      }
    })
  })
})

import { expect, describe, test, assert, vi, afterEach } from 'vitest'
import * as wasm from '../src/wasm/demo_io'

describe('demo-io', () => {
  const fn = vi.fn((n: number) => n + 1)

  const asyncFn = (n: number) => {
    const inner = fn(n)
    return Promise.resolve(inner)
  }

  describe('simple', () => {
    afterEach(() => {
      fn.mockClear()
    })

    test('syncFn', () => {
      const result = wasm.callSimpleSyncFn(fn, 2023)
      expect(fn).toHaveBeenCalledWith(2023)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBe(2024)
    })

    test('asyncFn', async () => {
      const result = await wasm.callSimpleAsyncFn(asyncFn, 2023)
      expect(fn).toHaveBeenCalledWith(2023)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBe(2024)
    })
  })

  describe('advanced', () => {
    afterEach(() => {
      fn.mockClear()
    })

    test('syncFn', () => {
      wasm.callAdvancedSyncFn(fn, 2023)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(2023)
    })

    test('asyncFn', async () => {
      await wasm.callAdvancedAsyncFn(asyncFn, 2023)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(2023)
    })

    test('syncFnTyped(u32)', () => {
      const result = wasm.callAdvancedSyncFnTyped(fn, 2023)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(2023)
      expect(result).toBe(2024)
    })

    test('asyncFnTyped(u32)', async () => {
      const result = await wasm.callAdvancedAsyncFnTyped(asyncFn, 2023)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(2023)
      expect(result).toBe(2024)
    })

    test('syncFnTyped throws when wrong type is provided', () => {
      try {
        wasm.callAdvancedSyncFnTyped(fn, '2023' as unknown as number)
      } catch (error) {
        const e = error as Error

        expect(fn).toHaveBeenCalledTimes(1)
        assert(e instanceof Error)
        expect(e.message).toMatchInlineSnapshot('"invalid type: unit value, expected u32"')
      }
    })

    test('asyncFnTyped throws when wrong type is provided', async () => {
      try {
        await wasm.callAdvancedAsyncFnTyped(asyncFn, '2023' as unknown as number)
      } catch (error) {
        const e = error as Error

        expect(fn).toHaveBeenCalledTimes(1)
        assert(e instanceof Error)
        expect(e.message).toMatchInlineSnapshot('"invalid type: unit value, expected u32"')
      }
    })
  })
})

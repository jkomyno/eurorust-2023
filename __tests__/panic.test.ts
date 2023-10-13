import { expect, describe, test, assert, beforeAll, afterAll } from 'vitest'
import { isWasmPanic, type WasmPanic } from '../src/utils/isWasmPanic'
import * as wasm from '../src/wasm/demo_panic'
import { WasmPanicRegistry } from '../src/utils/WasmPanicRegistry'
import { getWasmPanicError, globalWithWasm } from '../src/utils/getWasmPanicError'

describe('demo-panic', () => {
  describe('triggerPanic (with panic hook)', () => {
    beforeAll(() => {
      wasm.setPanicHook()
      /**
       * Set up a global registry for Wasm panics.
       * This allows us to retrieve the panic message from the Wasm panic hook,
       * which is not possible otherwise.
       */
      globalWithWasm.WASM_PANIC_REGISTRY = new WasmPanicRegistry()
    })

    afterAll(() => {
      globalWithWasm.WASM_PANIC_REGISTRY = undefined
      delete globalWithWasm.WASM_PANIC_REGISTRY
    })
    
    test('throws a `RuntimeError` reporting panic info', () => {
      try {
        wasm.triggerPanic('panic cause')
        assert(false, 'this should fail')
      } catch (error) {
        const e = error as WasmPanic

        assert(e instanceof Error)
        expect(e.name).toEqual('RuntimeError')

        if (isWasmPanic(e)) {
          expect(getWasmPanicError(e).message).toMatchInlineSnapshot(`
            "panicked at demo-panic/src/lib.rs:13:5:
            panic cause"
          `)
        } else {
          assert(false, 'this should fail')
        }
      }
    })
  })
})

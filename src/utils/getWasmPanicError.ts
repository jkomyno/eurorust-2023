import { WasmPanicRegistry } from './WasmPanicRegistry'
import { WasmPanic } from './isWasmPanic'

export const globalWithWasm = globalThis as typeof global & {
  WASM_PANIC_REGISTRY: WasmPanicRegistry | undefined
}

export function getWasmPanicError(error: WasmPanic) {
  const message = globalWithWasm.WASM_PANIC_REGISTRY?.get()
  const stack = [message, ...(error.stack || 'NO_BACKTRACE').split('\n').slice(1)].join('\n')

  return { message, stack }
}

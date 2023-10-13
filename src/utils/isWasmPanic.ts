/**
 * Branded type for Wasm panics.
 */
export type WasmPanic = Error & { name: 'RuntimeError' }

/**
 * Returns true if the given error is a Wasm panic.
 */
export function isWasmPanic(error: Error): error is WasmPanic {
  return error.name === 'RuntimeError'
}

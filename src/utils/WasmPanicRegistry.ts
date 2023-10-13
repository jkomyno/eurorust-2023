export class WasmPanicRegistry {
  private panicInfo?: string

  get() {
    return this.panicInfo
  }

  // Don't use this method directly, it's only used by the Wasm panic hook in `playground-wasm-panic`.
  private setPanicInfo(panicInfo: string) {
    this.panicInfo = panicInfo
  }
}

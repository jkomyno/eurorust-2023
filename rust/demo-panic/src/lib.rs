use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    /// This function registers the reason for a Wasm panic via the
    /// JS function `globalThis.WASM_PANIC_REGISTRY.setPanicInfo()`
    #[wasm_bindgen(js_namespace = ["global", "WASM_PANIC_REGISTRY"], js_name = "setPanicInfo")]
    fn set_wasm_panic_info(s: &str);
}

#[wasm_bindgen(js_name = "triggerPanic")]
pub fn trigger_panic(message: &str) -> () {
    panic!("{}", &message);
}

/// Registers a singleton panic hook that will register the reason for the Wasm panic in JS.
/// Without this, the panic message would be lost: you'd see `RuntimeError: unreachable` message in JS,
/// with no reference to the Rust function and line that panicked.
/// This function should be manually called before any other public function in this module.
/// Note: no method is safe to call after a panic has occurred.
#[wasm_bindgen(js_name = "setPanicHook")]
pub fn set_panic_hook() {
    // The panic hook is invoked when a thread panics, but before the panic runtime is invoked.
    std::panic::set_hook(Box::new(|info| {
        set_wasm_panic_info(&info.to_string());
    }));
}

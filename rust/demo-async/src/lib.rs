use once_cell::sync::Lazy;
use std::sync::Arc;
use tokio::sync::RwLock;
use wasm_bindgen::prelude::wasm_bindgen;

static SHARED_DATA: Lazy<Arc<RwLock<i32>>> = Lazy::new(|| Arc::new(RwLock::new(0)));

#[wasm_bindgen(js_name = "setShared")]
pub async fn set_shared(n: i32) -> () {
    let shared_data = SHARED_DATA.clone();
    let mut data = shared_data.write().await;
    *data = n;
}

#[wasm_bindgen(js_name = "getShared")]
pub async fn get_shared() -> i32 {
    let n = SHARED_DATA.read().await;
    n.clone()
}

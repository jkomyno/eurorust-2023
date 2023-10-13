use async_trait::async_trait;
use js_sys::{Function as JsFunction, Promise as JsPromise};
use serde::{de::DeserializeOwned, Serialize};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};
use wasm_bindgen_futures::JsFuture;

type Result<T> = core::result::Result<T, JsValue>;

#[async_trait(?Send)]
trait JsAsyncFunc {
    async fn call1_async(&self, arg1: JsValue) -> Result<JsValue>;

    async fn call1_async_typed<T, R>(&self, arg1: T) -> Result<R>
    where
        T: Serialize,
        R: DeserializeOwned;

    fn call1_sync(&self, arg1: JsValue) -> Result<JsValue>;

    fn call1_sync_typed<T, R>(&self, arg1: T) -> Result<R>
    where
        T: Serialize,
        R: DeserializeOwned;
}

#[async_trait(?Send)]
impl JsAsyncFunc for JsFunction {
    async fn call1_async(&self, arg1: JsValue) -> Result<JsValue> {
        let promise = self.call1(&JsValue::null(), &arg1)?;
        let future = JsFuture::from(JsPromise::from(promise));
        let value = future.await?;
        Ok(value)
    }

    async fn call1_async_typed<T, R>(&self, arg1: T) -> Result<R>
    where
        T: Serialize,
        R: DeserializeOwned,
    {
        let arg1 = serde_wasm_bindgen::to_value(&arg1).map_err(|err| JsError::from(&err))?;
        let promise = self.call1(&JsValue::null(), &arg1)?;
        let future = JsFuture::from(JsPromise::from(promise));
        let value = future.await?;
        serde_wasm_bindgen::from_value(value).map_err(|err| JsValue::from(err))
    }

    fn call1_sync(&self, arg1: JsValue) -> Result<JsValue> {
        let value = self.call1(&JsValue::null(), &arg1)?;
        Ok(value)
    }

    fn call1_sync_typed<T, R>(&self, arg1: T) -> Result<R>
    where
        T: Serialize,
        R: DeserializeOwned,
    {
        let arg1 = serde_wasm_bindgen::to_value(&arg1)
            .map_err(|err| js_sys::Error::new(&err.to_string()))?;

        let value = self.call1(&JsValue::null(), &arg1)?;
        serde_wasm_bindgen::from_value(value).map_err(|err| JsValue::from(err))
    }
}

#[wasm_bindgen(js_name = "callAdvancedAsyncFn")]
pub async fn call_async_fn(async_fn: JsValue, arg1: JsValue) -> Result<JsValue> {
    let async_fn = JsFunction::from(async_fn);
    async_fn.call1_async(arg1).await
}

#[wasm_bindgen(js_name = "callAdvancedAsyncFnTyped")]
pub async fn call_async_fn_typed_u32(async_fn: JsValue, arg1: u32) -> Result<u32> {
    let async_fn = JsFunction::from(async_fn);
    let result: u32 = async_fn.call1_async_typed(arg1).await?;

    Ok(result)
}

#[wasm_bindgen(js_name = "callAdvancedSyncFn")]
pub fn call_sync_fn(sync_fn: JsValue, arg1: JsValue) -> Result<JsValue> {
    let sync_fn = JsFunction::from(sync_fn);
    sync_fn.call1_sync(arg1)
}

#[wasm_bindgen(js_name = "callAdvancedSyncFnTyped")]
pub fn call_sync_fn_typed_u32(sync_fn: JsValue, arg1: u32) -> Result<u32> {
    let sync_fn = JsFunction::from(sync_fn);
    let result: u32 = sync_fn.call1_sync_typed(arg1)?;

    Ok(result)
}

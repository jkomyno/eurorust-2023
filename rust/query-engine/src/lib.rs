use async_trait::async_trait;
use ducktor::FromJsValue as DuckType;
use js_sys::{Function as JsFunction, Object as JsObject, Promise as JsPromise};
use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

type JsResult<T> = core::result::Result<T, JsValue>;

#[wasm_bindgen(getter_with_clone)]
#[derive(DuckType, Default)]
struct Driver {
    // (sql: string) => Promise<data>
    query_raw: JsFunction,

    // (sql: string) => Promise<u32>
    execute_raw: JsFunction,
}

#[async_trait(?Send)]
trait JsAsyncFunc {
    async fn call1_async(&self, arg1: JsValue) -> JsResult<JsValue>;
}

#[async_trait(?Send)]
impl JsAsyncFunc for JsFunction {
    async fn call1_async(&self, arg1: JsValue) -> JsResult<JsValue> {
        let promise = self.call1(&JsValue::null(), &arg1)?;
        let future = wasm_bindgen_futures::JsFuture::from(JsPromise::from(promise));
        let value = future.await?;

        Ok(value)
    }
}

/// Gets translated to `INSERT INTO table (field) VALUES (data)`
#[derive(Debug, Deserialize, Serialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct InsertQuery {
    pub data: serde_json::Value,
    pub table: String,
    pub field: String,
}

/// Gets translated to `SELECT field FROM table`
#[derive(Debug, Deserialize, Serialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct SelectQuery {
    pub table: String,
    pub field: String,
}

#[derive(Debug, Deserialize, Serialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(tag = "_tag", content = "value", rename_all = "camelCase")]
pub enum Query {
    Insert(InsertQuery),
    Select(SelectQuery),
}

#[derive(Debug)]
pub enum QueryResult {
    Insert(u32),
    Select(JsValue),
}

#[wasm_bindgen]
pub struct QueryEngine {
    driver: Driver,
}

#[wasm_bindgen]
impl QueryEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(driver: &JsObject) -> Self {
        let driver: Driver = Driver::from(&driver.into());
        QueryEngine { driver }
    }

    #[wasm_bindgen]
    pub async fn query(&self, query: Query) -> Result<JsValue, JsValue> {
        log::info!("query: {:?}", query);

        let result = match query {
            Query::Insert(query) => self.insert(query).await,
            Query::Select(query) => self.select(query).await,
        };

        result
    }

    async fn insert(&self, query: InsertQuery) -> JsResult<JsValue> {
        let sql = format!(
            r#"INSERT INTO {} ({}) VALUES (json('{}'))"#,
            &query.table, &query.field, &query.data
        );

        log::info!("[rust] execute_raw({})", &sql);
        let js_result = self.driver.execute_raw.call1_async(sql.into()).await?;

        Ok(js_result)
    }

    async fn select(&self, query: SelectQuery) -> JsResult<JsValue> {
        let sql = format!(
            r#"SELECT "id", json("{}") as "{}" FROM "{}" ORDER BY "id" DESC"#,
            &query.field, &query.field, &query.table
        );

        log::info!("[rust] query_raw(json({}))", &sql);
        let js_result = self
            .driver
            .query_raw
            .call1_async(JsValue::from(sql))
            .await?;

        Ok(js_result)
    }
}

#[wasm_bindgen]
extern "C" {
    /// This function registers the reason for a Wasm panic via the
    /// JS function `globalThis.WASM_PANIC_REGISTRY.setPanicInfo()`
    #[wasm_bindgen(js_namespace = ["global", "WASM_PANIC_REGISTRY"], js_name = "setPanicInfo")]
    fn set_wasm_panic_info(s: &str);
}

#[wasm_bindgen(js_name = "initLogs")]
pub fn init_logs() {
    wasm_logger::init(wasm_logger::Config::default());
}

#[wasm_bindgen(js_name = "setPanicHook")]
pub fn set_panic_hook() {
    // The panic hook is invoked when a thread panics, but before the panic runtime is invoked.
    std::panic::set_hook(Box::new(|info| {
        set_wasm_panic_info(&info.to_string());
    }));
}

mod custom_error;
mod event;

use custom_error::CustomError;
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

pub use event::Event;

#[wasm_bindgen(js_name = "parseWithStringError")]
pub fn parse_with_string_error(event: &str) -> Result<Event, String> {
    let event: Event = serde_json::from_str(event).map_err(|e| e.to_string())?;
    Ok(event)
}

#[wasm_bindgen(js_name = "parseWithError")]
pub fn parse_with_error(event: &str) -> Result<Event, JsError> {
    let event: Event = serde_json::from_str(event).map_err(|e| JsError::from(e))?;
    Ok(event)
}

#[wasm_bindgen(js_name = "parseWithCustomError")]
pub fn parse_with_custom_error(event: &str) -> Result<Event, JsError> {
    let event: Event = serde_json::from_str(event).map_err(|e| CustomError::new(e))?;
    Ok(event)
}

#[wasm_bindgen(js_name = "parseWithPanic")]
pub fn parse_with_panic(event: &str) -> Event {
    let event: Event = serde_json::from_str(event).unwrap();
    event
}

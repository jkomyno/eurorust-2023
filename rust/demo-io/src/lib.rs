mod advanced;
mod simple;

pub use advanced::call_async_fn as call_advanced_async_fn;
pub use advanced::call_async_fn_typed_u32 as call_advanced_async_fn_typed_u32;
pub use advanced::call_sync_fn as call_advanced_sync_fn;
pub use advanced::call_sync_fn_typed_u32 as call_advanced_sync_fn_typed_u32;
pub use simple::call_async_fn as call_simple_async_fn;
pub use simple::call_sync_fn as call_simple_sync_fn;

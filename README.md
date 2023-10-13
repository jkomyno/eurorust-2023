# Underrated gems of Rust & WebAssembly: Errors · Async · I/O

---

Slides for this talk are also available [here](https://jkomyno-eurorust-2023.vercel.app/).

## Abstract

WebAssembly has revolutionised cross-platform development, enabling developers to compile their code just once, regardless of the runtime operating system or CPU architecture. While Rust boasts the best language support for WebAssembly through the wasm-bindgen tool, developers often encounter unexpected challenges and differences in execution models. Similarly to no_std, not every Rust code can be compiled to Wasm out of the box.

For example, in a Rust library compiled to Wasm, panics cannot be unwinded (and their stacktrace location is lost), and async functions à la tokio cannot be awaited. Moreover, no I/O operation can be performed in WebAssembly: that means no network connections nor file handles can be opened. The WASI specification partially overcomes this limitation, but that’s still unstable and doesn’t cover network sockets.

What if you wanted to write a production async Rust library that needs both robust error handling and I/O, and you needed to run it in JavaScript runtimes like Node.js?

In this talk, we will explore uncharted territories in Wasm land, where you’ll learn how to confidently integrate your familiar Rust patterns with powerful - but fragile - WebAssembly runtimes. As a motivating example, we will present a database query engine prototype written in Rust+Wasm that accepts a JSON query, parses it into an equivalent SQL query, runs such query asynchronously and returns the results to the caller.

Just like pirates in a sea of compilation errors, we will bend the rules to conquer new horizons in the realm of truly cross-platform Rust libraries!

### Requirements

- [Rust 1.73.0](https://www.rust-lang.org/tools/install) or superior*
- [Node.js 20.0.0](https://nodejs.org/en) or superior*
- [pnpm 8.0.0](https://pnpm.io/installation) or superior*

(*) These are the versions used to develop this repository. Older versions might work as well, but they haven't been tested.

Furthermore, you'll need to install:

- `wasm-bindgen`, via:
  ```sh
  cargo install -f wasm-bindgen-cli@0.2.87
  ```

You'll also need to enable the `wasm32-unknown-unknown` compilation target for Rust, via:

```sh
rustup target add wasm32-unknown-unknown
```

### Setup

- Compile the [Rust codebase](./rust) and generate bindings for WebAssembly via:
  ```sh
  ./build.sh
  ```

  The generated WebAssembly bindings are in [./src/wasm](./src/wasm), and are compatible both with Node.js / ESM, as well as Cloudflare Workers.

- Run the TypeScript tests via:
  ```sh
  pnpm test
  ```

## Query Engine Demo

### How to setup

**Locally**:

- To initialise the database from [this SQL schema](./d1/schema.sql), run:
  ```sh
  npx wrangler d1 execute eurorust-2023 \
    --local --file=d1/schema.sql \
    --persistTo=.wrangler/state
  ```

**On Cloudflare Workers**

- Authorize your CLI to interact with Cloudflare via:

  ```sh
  npx wrangler login
  ```

- To initialise the database from [this SQL schema](./d1/schema.sql), run:

  ```sh
  npx wrangler d1 execute eurorust-2023 \
    --file=d1/schema.sql
  ```

### How to run

**Locally**:

- Run
  ```sh
  pnpm run start
  ```
- Open [`http://127.0.0.1:8787`](http://127.0.0.1:8787) in your browser and follow the instructions therein.

**On Cloudflare Workers**:

- Run
  ```sh
  pnpm run deploy
  ```
- Open the URL that follows `Published eurorust-2023` in the terminal window (e.g., `https://eurorust-2023.jkomyno.workers.dev`), and follow the instructions therein.

## Demos

### `demo-errors`

The local [`demo-errors`](./rust/demo-errors/src/lib.rs) crate demonstrates how to export Rust functions that may fail with a runtime error to TypeScript. It also contains the simplest case of panic: one without any panic hook.

```rust
use serde::{Deserialize, Serialize};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

#[derive(Serialize, Deserialize, ...)]
pub struct Event {
    name: String,
    year: u16,
}

#[wasm_bindgen(js_name = "parseWithError")]
pub fn parse_with_error(event: &str) -> Result<Event, JsError> {
    serde_json::from_str(event).map_err(|e| JsError::from(e))
}
```

The correspondent TypeScript tests are in [`./__tests__/errors.test.ts`](./__tests__/errors.test.ts).

### `demo-panic`

The local [`demo-panic`](./rust/demo-panic/src/lib.rs) crate demonstrates how to export Rust functions that may trigger a panic. It also contains a custom panic hook initialiser in order to let the JavaScript runtime understand in which Rust file the panic was originated.

The correspondent TypeScript tests are in [`./__tests__/panic.test.ts`](./__tests__/panic.test.ts).

### `demo-async`

The local [`demo-async`](./rust/demo-async/src/lib.rs) crate demonstrates how to use `tokio` utilities such as `tokio::sync::RwLock` with WebAssembly.

The correspondent TypeScript tests are in [`./__tests__/async.test.ts`](./__tests__/async.test.ts).

### `demo-io`

The local [`demo-io`](./rust/demo-io/src/lib.rs) crate demonstrates how to programmatically trigger `I/O` tasks from Rust / WebAssembly, via JavaScript functions.

The correspondent TypeScript tests are in [`./__tests__/io.test.ts`](./__tests__/io.test.ts).

## 👤 Author

**Alberto Schiabel**

* Twitter: [@jkomyno](https://twitter.com/jkomyno)
* Github: [@jkomyno](https://github.com/jkomyno)

Please consider supporting my work by following me on Twitter and starring my projects on GitHub.
I mostly post about TypeScript, Rust, and WebAssembly. Thanks!

## 📝 License

Built with ❤️ by [Alberto Schiabel](https://github.com/jkomyno).
This project is [MIT](https://github.com/jkomyno/rust-capnp-wasm/blob/main/LICENSE) licensed.

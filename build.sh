#!/bin/sh

OUT_FOLDER="./src/wasm"

# 1. Build the Rust library / update the Rust capnp bindings
(
  cd ./rust

  for crate in demo-errors demo-panic demo-async demo-io query-engine; do
    cargo build -p ${crate} --release --target wasm32-unknown-unknown
  done
)

# 2. Build the WebAssembly modules
for wasm in demo_errors demo_panic demo_async demo_io query_engine; do
  wasm-bindgen --target bundler \
    --out-dir ${OUT_FOLDER} \
    ./rust/target/wasm32-unknown-unknown/release/${wasm}.wasm
done

enable_cf_in_bindings() {
    # Enable Cloudflare Workers in the generated JS bindings.
    # The generated bindings are compatible with:
    # - Node.js
    # - Cloudflare Workers / Miniflare

    local FILE="$1" # e.g., `query_engine.js`
    local BG_FILE="${FILE%.js}_bg.js"
    local OUTPUT_FILE="${OUT_FOLDER}/${FILE}"

    cat <<EOF > "$OUTPUT_FILE"
import * as imports from "./${BG_FILE}";

// switch between both syntax for Node.js and for workers (Cloudflare Workers)
import * as wkmod from "./${BG_FILE%.js}.wasm";
import * as nodemod from "./${BG_FILE%.js}.wasm";
if ((typeof process !== 'undefined') && (process.release.name === 'node')) {
    imports.__wbg_set_wasm(nodemod);
} else {
    const instance = new WebAssembly.Instance(wkmod.default, { "./${BG_FILE}": imports });
    imports.__wbg_set_wasm(instance.exports);
}

export * from "./${BG_FILE}";
EOF
}

sleep 1

enable_cf_in_bindings "demo_errors.js"
enable_cf_in_bindings "demo_panic.js"
enable_cf_in_bindings "demo_async.js"
enable_cf_in_bindings "demo_io.js"
enable_cf_in_bindings "query_engine.js"

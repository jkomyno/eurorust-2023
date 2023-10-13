import { describe, test, expect } from 'vitest'
import * as wasm from '../src/wasm/demo_async'

describe('demo-async', () => {
  describe('setShared with tokio Mutex', () => {
    test('locks writes sequentially', async () => {
      const promises = Array
        .from({ length: 100 })
        .map((_, i) => wasm.setShared(i + 1))
    
      // execute all promises concurrently
      await Promise.all(promises)
      const result = await wasm.getShared()

      expect(result).toBe(100)
    })
  })
})

import { setTimeout } from 'node:timers/promises'
import * as wasm from './wasm/query_engine'

async function executeRaw(query: string) {
  console.log('\n[js] executeRaw', query, '\n')
  await setTimeout(200)
  return 42
}

async function queryRaw(query: string) {
  console.log('\n[js] queryRaw', query, '\n')
  await setTimeout(200)

  return [
    {
      id: 1,
      name: 'John'
    },
    {
      id: 2,
      name: 'Jane'
    }
  ]
}

async function main() {
  wasm.initLogs()

  const driver = {
    execute_raw: executeRaw,
    query_raw: queryRaw,
  }

  const engine = new wasm.QueryEngine(driver)

  const insertQueryResult = await engine.query({
    _tag: 'insert',
    value: {
      data: {
        id: 1,
        name: 'John',
      },
      table: 'users',
      field: 'name',
    },
  })
  console.log('insertQueryResult', insertQueryResult, '\n')

  const selectQueryResult = await engine.query({
    _tag: 'select',
    value: {
      table: 'users',
      field: 'name',
    },
  })
  console.log('selectQueryResult', selectQueryResult, '\n')
}

main()

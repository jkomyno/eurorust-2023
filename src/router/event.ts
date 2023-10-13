import { Router } from 'itty-router'
import { render } from './index'
import * as wasm from '../wasm/query_engine'
import { isWasmPanic } from '../utils/isWasmPanic'
import { globalWithWasm } from '../utils/getWasmPanicError'

wasm.initLogs()
wasm.setPanicHook()

export const router = Router({ base: '/api/event' })

router
  /**
   * List events
   */
  .get('/', async (_request, env: Env) => {
    const query_raw = async (query: string) => {
      const { results } = await env.DB.prepare(query).all()
      return results
    }

    try {
      const engine = new wasm.QueryEngine({
        query_raw,
        execute_raw: () => Promise.resolve(),
      })
  
      const resultsJSON = await engine.query({
        _tag: 'select',
        value: {
          field: 'data',
          table: 'event',
        }
      })

      // @ts-ignore
      const eventList = resultsJSON.map(item => {
        const data = JSON.parse(item.data)

        const jsonValue = {
          id: item.id,
          data,
        }

        return JSON.stringify(jsonValue, null, 2)
      }) as string[]

      const eventListJSX = eventList.map(item => {
        return `<li><code>${item}</code></li>`
      })

      const content = `
        <h1 class="text-4xl">WebAssembly I/O: Query Engine</h1>
        <p class="mt-8">Press the "Create" button to insert a new random event in the database</p>
        <div class="mt-8 w-full">
          <form action="/api/event" method="POST">
            <button type="submit" class="btn bg-purple-300 pointer px-16 py-2">
              Create
            </button>
          </form>
          <ul class="mt-8">
            ${eventListJSX}
          </ul>
        </div>
      `
  
      return new Response(render(content), {
        headers: {
          'content-type': 'text/html',
        },
      })
    } catch (error) {
      const e = error as Error
      return handleError(e)
    }
  })

  .post('/', async (request, env: Env) => {
    const execute_raw = async (query: string) => {
      const result = await env.DB.exec(query)

      return {
        rowsImpacted: result.count,
      }
    }

    try {
      const engine = new wasm.QueryEngine({
        execute_raw,
        query_raw: () => Promise.resolve(),
      })

      const nameChoices = ['EuroRust', 'RustLab', 'RustNation', 'RustConf', 'RustFest']
      const randomName = nameChoices[Math.floor(Math.random() * nameChoices.length)]

      const yearChoices = [2020, 2021, 2022, 2023, 2024, 2025]
      const randomYear = yearChoices[Math.floor(Math.random() * yearChoices.length)]

      const { rowsImpacted } = await engine.query({
        _tag: 'insert',
        value: {
          table: 'event',
          data: {
            name: randomName,
            year: randomYear,
          },
          field: 'data',
        }
      })

      console.log('Inserted new event', rowsImpacted)

      return Response.redirect(request.url, 301)
    } catch (error) {
      const e = error as Error
      return handleError(e)
    }
  })

function handleError<T>(e: Error): Response {
  if (isWasmPanic(e)) {
    const message = globalWithWasm.WASM_PANIC_REGISTRY?.get()

    const errorResponse = {
      panic: true,
      message,
    }

    return new Response(JSON.stringify(errorResponse, null, 2), {
      headers: {
        'content-type': 'text/json',
      },
    })
  } else {
    const errorResponse = {
      panic: false,
      message: e.message,
    }

    return new Response(JSON.stringify(errorResponse, null, 2), {
      headers: {
        'content-type': 'text/json',
      },
    })
  }
}

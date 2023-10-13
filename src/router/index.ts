import { Router } from 'itty-router'
import { router as routerEvent } from './event'

const router = Router()

router
  .all('/api/event/*', routerEvent.handle)
  .all('*', () => new Response('Not Found.', { status: 404 }))

export default router

/**
 * Poor man version of React.js, lol
 */
export const render = (content: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="container mx-auto mt-8 text-2xl">
      ${content}
    </body>
    </html>
  `
}

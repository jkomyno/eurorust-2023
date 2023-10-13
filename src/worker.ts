import apiRouter, { render } from './router'

// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url)

		if (url.pathname.startsWith('/api/')) {
			return apiRouter.handle(request, env)
		}

		return new Response(
			render(`
				<h1 class="text-4xl">Can Wasm + I/O work on Cloudflare Workers? ✅</h1>
				<p class="mt-8">Try making requests to:</p>
				<ul class="mt-8 ml-8 list-disc text-2xl">
					<li><code class="mx-2">GET <a class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="/api/event">/api/event</a></code> to interact with a D1 SQL database via a demo Wasm Query Engine</li>
				</ul>
			`),
			{
				headers: {
					'Content-Type': 'text/html',
				},
			}
		)
	},
}

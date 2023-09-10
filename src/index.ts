/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	COUNTER: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export class CounterObject {
	counter: number;
	constructor() {
		this.counter = 0;
	}

	async fetch(request: Request) {
		const { pathname } = new URL(request.url);

		switch (pathname) {
			case '/':
				return new Response(this.counter.toString());
			case '/+':
				this.counter++;
				return new Response(this.counter.toString());
			case '/-':
				this.counter--;
				return new Response(this.counter.toString());
			default:
				return new Response(null, {
					status: 404,
				});
		}
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const id = env.COUNTER.idFromName('counter');
		const durableObject = env.COUNTER.get(id);
		const response = await durableObject.fetch(request);
		return response;
	},
};

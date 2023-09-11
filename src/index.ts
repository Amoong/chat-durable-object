//@ts-ignore
import home from './home.html';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	CHAT: DurableObjectNamespace;
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

export class ChatRoom {
	state: DurableObjectState;
	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
	}

	async getCounter() {
		const counter: string | undefined = await this.state.storage.get('counter');

		if (!counter) {
			return 0;
		} else {
			return parseInt(counter);
		}
	}

	handleHome() {
		return new Response(home, {
			headers: {
				'Content-type': 'text/html',
			},
		});
	}

	handleConnect(request: Request) {
		const pairs = new WebSocketPair();

		this.handleWebSocket(pairs[1]);

		return new Response(null, { status: 101, webSocket: pairs[0] });
	}

	handleWebSocket(webSocket: WebSocket) {
		webSocket.accept();
		setTimeout(() => {
			webSocket.send(JSON.stringify({ message: 'hello from backend!' }));
		}, 3000);
	}

	handleNotFound() {
		return new Response(null, {
			status: 404,
		});
	}

	async fetch(request: Request) {
		const { pathname } = new URL(request.url);

		switch (pathname) {
			case '/':
				return this.handleHome();
			case '/connect':
				return this.handleConnect(request);

			default:
				return this.handleNotFound();
		}
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const id = env.CHAT.idFromName('counter');
		const durableObject = env.CHAT.get(id);
		const response = await durableObject.fetch(request);
		return response;
	},
};

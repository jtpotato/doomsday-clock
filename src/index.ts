import type { Env } from './types';
import { notionHandler } from './handlers/notion';

export default {
	async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/notion':
				return notionHandler(env);
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;

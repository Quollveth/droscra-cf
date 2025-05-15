export interface Env {
	MYBROWSER: Fetcher;
	DB: D1Database;
	DB_TOKEN: string;
	SITE_URL: string;
}

export default {
	async fetch(request, env): Promise<Response> {
		/*
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': env.SITE_URL,
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}
		*/

		const pathname = new URL(request.url);

		if (pathname.pathname === '/hello') {
			return Response.json('world');
		}

		return Response.json(pathname.pathname);
	},
} satisfies ExportedHandler<Env>;

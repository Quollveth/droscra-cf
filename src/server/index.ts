import { DurableObject } from 'cloudflare:workers';

const DB_CREATE_QUERY = `
	CREATE TABLE IF NOT EXISTS queries(
		query TEXT PRIMARY KEY,
		items INTEGER
	);
	`;

export class DroscraObj extends DurableObject<Env> {
	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		this.sql = ctx.storage.sql;
		this.sql.exec(DB_CREATE_QUERY);
	}

	async speak(): Promise<string> {
		let result = this.ctx.storage.sql.exec("SELECT 'Hello, World!' as greeting").one();
		return result.greeting as string;
	}

	async save(data: string): Promise<boolean> {
		this.sql.exec(`INSERT INTO queries (query, items) VALUES (?,0);`, [data]);
		return true;
	}

	async load(): Promise<string> {
		const cursor = this.sql.exec('SELECT * FROM queries;');

		let ret = '';
		for (let row of cursor) {
			ret += row.query + ',';
		}

		return ret;
	}
}

export default {
	async fetch(request, env): Promise<Response> {
		const pathname = new URL(request.url).pathname;
		/*
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': env.ORIGIN,
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}
		*/

		const id: DurableObjectId = env.DROSCRA_OBJ.idFromName('object');
		const stub = env.DROSCRA_OBJ.get(id);

		try {
			if (pathname === '/save') {
				if (request.method !== 'POST') {
					throw Error('invalid method');
				}
				const form = await request.formData();
				const data = form.get('data');

				await stub.save(data as string);
				return Response.json(`data ${data} saved`);
			}

			if (pathname === '/load') {
				if (request.method !== 'GET') {
					throw Error('invalid method');
				}
				const data = await stub.load();
				return Response.json(data);
			}

			if (pathname === '/speak') {
				if (request.method !== 'GET') {
					throw Error('invalid method');
				}
				const data = await stub.speak();
				return Response.json(data);
			}
		} catch (e) {
			console.log(e);
			return Response.json(`exception: ${e}`);
		}

		return Response.json(`Request sent to ${pathname}`);
	},
} satisfies ExportedHandler<Env>;

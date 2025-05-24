import { DurableObject } from 'cloudflare:workers';
import {
	ENDPOINT_GET_QUERIES,
	ENDPOINT_SAVE_QUERIES,
	type ItemsRow,
	type QueriesRow,
} from '../shared';

const DB_CREATE_QUERY = `
	CREATE TABLE IF NOT EXISTS queries(
		query TEXT PRIMARY KEY,
		items INTEGER
	);
	CREATE TABLE IF NOT EXISTS items(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		url TEXT,
		image TEXT,
		price REAL,
		query TEXT
	);
`;

export class DroscraObj extends DurableObject<Env> {
	storage: DurableObjectStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.storage = ctx.storage;
		this.storage.sql.exec(DB_CREATE_QUERY);
	}

	async queriesGet(): Promise<QueriesRow[]> {
		const result = this.storage.sql.exec('SELECT * FROM queries;');
		if (result.rowsRead == 0) {
			console.warn('queriesGet: no rows read');
			return [];
		}

		const rows: QueriesRow[] = [];
		for await (let row of result) {
			rows.push({ query: row['query'] as string, items: row['items'] as number });
		}
		return rows;
	}

	async queriesAdd(q: QueriesRow): Promise<Error | null> {
		try {
			this.storage.sql.exec(
				'INSERT OR REPLACE INTO queries (query, items) VALUES (?, ?);',
				q.query,
				q.items,
			);
			return null;
		} catch (e) {
			console.error('queriesAdd error:', e);
			return new Error('Error adding query');
		}
	}

	async queriesAddBatch(qArr: QueriesRow[]): Promise<Error | null> {
		console.log('received queries to save: ', qArr);

		try {
			this.storage.transaction(async (txn) => {
				for (const q of qArr) {
					await txn.put({
						query: q.query,
						items: q.items,
					});
				}
			});

			return null;
		} catch (e) {
			console.error('queriesAddBatch error:', e);
			return new Error('Error saving queries');
		}
	}

	async itemsGetAll(): Promise<ItemsRow[]> {
		const result = this.storage.sql.exec('SELECT * FROM items;');
		const rows: ItemsRow[] = [];
		for await (const row of result) {
			rows.push({
				id: row['id'] as number,
				name: row['name'] as string,
				url: row['url'] as string,
				image: row['image'] as string,
				price: row['price'] as number,
				query: row['query'] as string,
			});
		}
		return rows;
	}

	async itemsGetFromQuery(q: QueriesRow): Promise<ItemsRow[]> {
		const result = this.storage.sql.exec('SELECT * FROM items WHERE query = ?;', [
			q.query,
		]);
		const rows: ItemsRow[] = [];
		for await (const row of result) {
			rows.push({
				id: row['id'] as number,
				name: row['name'] as string,
				url: row['url'] as string,
				image: row['image'] as string,
				price: row['price'] as number,
				query: row['query'] as string,
			});
		}
		return rows;
	}

	async itemsAdd(i: ItemsRow): Promise<Error | null> {
		try {
			this.storage.sql.exec(
				'INSERT INTO items (name, url, image, price, query) VALUES (?, ?, ?, ?, ?);',
				[i.name, i.url, i.image, i.price, i.query],
			);
			return null;
		} catch (e) {
			console.error('itemsAdd error:', e);
			return new Error(e as string);
		}
	}

	async itemsUpdate(id: number, data: ItemsRow): Promise<Error | null> {
		try {
			this.storage.sql.exec(
				'UPDATE items SET name = ?, url = ?, image = ?, price = ?, query = ? WHERE id = ?;',
				[data.name, data.url, data.image, data.price, data.query, id],
			);
			return null;
		} catch (e) {
			console.error('Error in itemsUpdate:', e);
			return new Error('Error updating item');
		}
	}

	async itemsDelete(id: number): Promise<Error | null> {
		try {
			this.storage.sql.exec('DELETE FROM items WHERE id = ?;', [id]);
			return null;
		} catch (e) {
			console.error('itemsDelete error:', e);
			return new Error('Error deleting item');
		}
	}
}

const RESP_EMPTY_OK = new Response(null, { status: 200 });
const RESP_UNSUPPORTED = new Response(null, {
	status: 403,
	statusText: 'This endpoint does not support this method',
});

async function maybeResponse(error: Promise<Error | null>): Promise<Response> {
	if (error === null) {
		return RESP_EMPTY_OK;
	}

	return new Response(JSON.stringify(error), {
		status: 500,
		statusText: 'Internal Server Error',
	});
}

async function HandleEndpoint(
	req: Request,
	stub: DurableObjectStub<DroscraObj>,
): Promise<Response> {
	const pathname = new URL(req.url).pathname;

	switch (pathname) {
		case ENDPOINT_GET_QUERIES:
			//prettier-ignore
			if(req.method !== 'GET'){return RESP_UNSUPPORTED}
			const result = await stub.queriesGet();
			return Response.json(result);

		case ENDPOINT_SAVE_QUERIES:
			//prettier-ignore
			if(req.method !== 'POST'){return RESP_UNSUPPORTED}
			const data: QueriesRow[] = await req.json();
			//TODO: valdiate

			//prettier-ignore
			return maybeResponse(
				stub.queriesAddBatch(data as QueriesRow[]),
			);

		default:
			return new Response(null, { status: 404, statusText: 'Invalid endpoint' });
	}
}

export default {
	async fetch(request, env): Promise<Response> {
		if (!env.DEBUG) {
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
		}

		const id: DurableObjectId = env.DROSCRA_OBJ.idFromName('object');
		const stub = env.DROSCRA_OBJ.get(id);

		try {
			return HandleEndpoint(request, stub);
		} catch (e) {
			console.error(e);
			return new Response(null, {
				status: 500,
				statusText: 'Server had an unknown error',
			});
		}
	},
} satisfies ExportedHandler<Env>;

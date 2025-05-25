import { DurableObject } from 'cloudflare:workers';
import {
	ENDPOINT_DELETE_ITEM,
	ENDPOINT_DELETE_QUERY,
	ENDPOINT_GET_ITEMS,
	ENDPOINT_GET_ITEMS_QUERIES,
	ENDPOINT_GET_QUERIES,
	ENDPOINT_RENAME_ITEM,
	ENDPOINT_SAVE_QUERY,
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
	);`;

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
		try {
			qArr.forEach((q) => {
				this.storage.sql.exec(
					'INSERT OR REPLACE INTO queries (query, items) VALUES (?, ?);',
					q.query,
					q.items,
				);
			});

			return null;
		} catch (e) {
			console.error('queriesAddBatch error:', e);
			return new Error('Error saving queries');
		}
	}

	async queriesDelete(id: string): Promise<Error | null> {
		try {
			this.storage.sql.exec('DELETE FROM queries WHERE query = ?;', id);
			return null;
		} catch (e) {
			console.error('queriesDelete error:', e);
			return new Error('Error deleting query');
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

	async itemsGetFromQuery(q: string): Promise<ItemsRow[]> {
		const result = this.storage.sql.exec('SELECT * FROM items WHERE query = ?;', q);
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

	async itemsGetFromQueries(q: string[]): Promise<ItemsRow[]> {
		const placeholders = q.map(() => '?').join(', ');

		const sql = `SELECT * FROM items WHERE query IN (${placeholders});`;

		const result = this.storage.sql.exec(sql, ...q);

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
				i.name,
				i.url,
				i.image,
				i.price,
				i.query,
			);
			return null;
		} catch (e) {
			console.error('itemsAdd error:', e);
			return new Error(e as string);
		}
	}

	async itemsRename(id: number, name: string): Promise<Error | null> {
		try {
			this.storage.sql.exec('UPDATE items SET name = ? WHERE id = ?;', name, id);
			return null;
		} catch (e) {
			console.error('Error in itemsUpdate:', e);
			return new Error('Error updating item');
		}
	}

	async itemsDelete(id: number): Promise<Error | null> {
		try {
			this.storage.sql.exec('DELETE FROM items WHERE id = ?;', id);
			return null;
		} catch (e) {
			console.error('itemsDelete error:', e);
			return new Error('Error deleting item');
		}
	}
}

const RESP_EMPTY_OK = new Response(null, { status: 204 });
const RESP_UNSUPPORTED = new Response(null, {
	status: 405,
	statusText: 'This endpoint does not support this method',
});

function maybeResponse(error: Error | null): Response {
	if (error === null) {
		return RESP_EMPTY_OK;
	}

	return new Response(JSON.stringify(error), {
		status: 500,
		statusText: 'Internal Server Error',
	});
}
function jsonResponse(data: any): Response {
	// exists in case headers (like cors) need to be setup for all responses
	const resp = Response.json(data);
	return resp;
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
			return jsonResponse(await stub.queriesGet());

		case ENDPOINT_SAVE_QUERY:
			//prettier-ignore
			if(req.method !== 'POST'){return RESP_UNSUPPORTED}
			const qta: QueriesRow = await req.json();
			//TODO: valdiate
			return maybeResponse(await stub.queriesAdd(qta));

		case ENDPOINT_DELETE_QUERY:
			//prettier-ignore
			if(req.method !== 'POST'){return RESP_UNSUPPORTED}
			const qtd: { id: string } = await req.json();
			//TODO: valdiate
			const qitd = qtd.id;
			return maybeResponse(await stub.queriesDelete(qitd));

		case ENDPOINT_GET_ITEMS:
			//prettier-ignore
			if(req.method !== 'GET'){return RESP_UNSUPPORTED}
			return jsonResponse(await stub.itemsGetAll());

		case ENDPOINT_DELETE_ITEM:
			//prettier-ignore
			if(req.method !== 'POST'){return RESP_UNSUPPORTED}
			const itd: { id: number } = await req.json();
			//TODO: valdiate
			const iitd = itd.id;
			return maybeResponse(await stub.itemsDelete(iitd));

		case ENDPOINT_GET_ITEMS_QUERIES:
			//prettier-ignore
			if(req.method !== 'POST'){return RESP_UNSUPPORTED}

			const qts: string[] = await req.json();
			if (qts.length === 0) {
				return RESP_EMPTY_OK;
			}

			if (qts.length === 1) {
				return jsonResponse(await stub.itemsGetFromQuery(qts[0]));
			}

			return jsonResponse(await stub.itemsGetFromQueries(qts));

		case ENDPOINT_RENAME_ITEM:
			//prettier-ignore
			if(req.method !== 'POST'){return RESP_UNSUPPORTED}

			const dtr: { id: number; name: string } = await req.json();
			return maybeResponse(await stub.itemsRename(dtr.id, dtr.name));

		default:
			return new Response(null, { status: 404, statusText: 'Invalid endpoint' });
	}
}

export default {
	async fetch(request, env): Promise<Response> {
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

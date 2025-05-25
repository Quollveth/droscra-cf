import type { ItemsRow, QueriesRow } from '../shared';
import {
	ENDPOINT_SAVE_QUERIES,
	ENDPOINT_GET_QUERIES,
	ENDPOINT_DELETE_QUERY,
	ENDPOINT_SAVE_QUERY,
	ENDPOINT_GET_ITEMS,
	ENDPOINT_DELETE_ITEM,
	ENDPOINT_GET_ITEMS_QUERIES,
    ENDPOINT_RENAME_ITEM,
} from '../shared';
import type { Item } from './context';

export async function ApiGetQueries(): Promise<QueriesRow[]> {
	try {
		const response = await fetch(ENDPOINT_GET_QUERIES, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch queries: ${response.statusText}`);
		}

		const data: QueriesRow[] = await response.json();
		return data;
	} catch (error) {
		console.error('ApiGetQueries error:', error);
		return [];
	}
}

export async function ApiSaveQueries(queries: QueriesRow[]): Promise<boolean> {
	try {
		const response = await fetch(ENDPOINT_SAVE_QUERIES, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(queries),
		});

		if (!response.ok) {
			throw new Error(`Failed to save queries: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('ApiSaveQueries error:', error);
		return false;
	}
}

export async function ApiSaveQuery(query: QueriesRow): Promise<boolean> {
	try {
		const response = await fetch(ENDPOINT_SAVE_QUERY, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(query),
		});

		if (!response.ok) {
			throw new Error(`Failed to save query: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('ApiSaveQueries error:', error);
		return false;
	}
}

export async function ApiDeleteQuery(query: QueriesRow): Promise<boolean> {
	try {
		const response = await fetch(ENDPOINT_DELETE_QUERY, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: query.query }),
		});

		if (!response.ok) {
			throw new Error(`Failed to delete query: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('ApiDeleteQuery error:', error);
		return false;
	}
}

export async function ApiGetItems(): Promise<ItemsRow[]> {
	try {
		const response = await fetch(ENDPOINT_GET_ITEMS, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch items: ${response.statusText}`);
		}

		const data: ItemsRow[] = await response.json();
		return data;
	} catch (error) {
		console.error('ApiGetItems error:', error);
		return [];
	}
}

export async function ApiDeleteItem(item: Item) {
	try {
		const response = await fetch(ENDPOINT_DELETE_ITEM, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: item.id }),
		});

		if (!response.ok) {
			throw new Error(`Failed to delete item: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('ApiDeleteItem error:', error);
		return false;
	}
}

export async function ApiGetItemsQueries(queries: string[]): Promise<ItemsRow[]> {
	try {
		const response = await fetch(ENDPOINT_GET_ITEMS_QUERIES, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(queries),
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch items: ${response.statusText}`);
		}

		const data: ItemsRow[] = await response.json();
		return data;
	} catch (error) {
		console.error('ApiGetItemsQueries error:', error);
		return [];
	}
}

export async function ApiRenameItem(id: number, name: string): Promise<boolean> {
	try {
		const response = await fetch(ENDPOINT_RENAME_ITEM, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: id, name: name }),
		});

		if (!response.ok) {
			throw new Error(`Failed to rename item: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('ApiRenameItem error:', error);
		return false;
	}
}

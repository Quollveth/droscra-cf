import type { QueriesRow } from '../shared';
import { ENDPOINT_SAVE_QUERIES, ENDPOINT_GET_QUERIES } from '../shared';

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

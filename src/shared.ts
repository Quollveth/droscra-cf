// QueriesRow -> void
export const ENDPOINT_SAVE_QUERY = '/api/addQuery';

// QueriesRow[] -> void
export const ENDPOINT_SAVE_QUERIES = '/api/addQueries';

// void -> QueriesRow[]
export const ENDPOINT_GET_QUERIES = '/api/getQueries';

// {id:string} -> void
export const ENDPOINT_DELETE_QUERY = '/api/deleteQuery';

type integer = number;
type url = string;

export interface QueriesRow {
	query: string;
	items: integer;
}

export interface ItemsRow {
	id: integer;
	name: string;
	url: url;
	image: url;
	price: number;
	query: string;
}

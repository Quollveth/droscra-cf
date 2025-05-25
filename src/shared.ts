// QueriesRow -> void
export const ENDPOINT_SAVE_QUERY = '/api/addQuery';

// QueriesRow[] -> void
export const ENDPOINT_SAVE_QUERIES = '/api/addQueries';

// void -> QueriesRow[]
export const ENDPOINT_GET_QUERIES = '/api/getQueries';

// {id:string} -> void
export const ENDPOINT_DELETE_QUERY = '/api/deleteQuery';

// void -> ItemsRow[]
export const ENDPOINT_GET_ITEMS = '/api/getItems';

// {id:integer} ->  void
export const ENDPOINT_DELETE_ITEM = '/api/deleteItem';

// {id:string[]} -> ItemsRow[]
export const ENDPOINT_GET_ITEMS_QUERIES = '/api/getItemsQueries';

// {id:integer, name:string} -> void
export const ENDPOINT_RENAME_ITEM = '/api/renameItem';

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

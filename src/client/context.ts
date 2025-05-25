import React from 'react';
import type { ItemsRow, QueriesRow } from '../shared';

export interface Query extends QueriesRow {
	selected: boolean;
}
export interface Item extends ItemsRow {}

export interface AppData {
	queries: Query[];
	items: Item[];
}

export function EmptyData(): AppData {
	return {
		queries: [],
		items: [],
	};
}

export type AppContextType = [AppData, React.Dispatch<React.SetStateAction<AppData>>];

export const AppContext = React.createContext<AppContextType>([
	EmptyData(),
	() => {
		alert('some dumbass consumed the context without a provider');
	},
]);

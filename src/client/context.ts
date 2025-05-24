import React from 'react';
import type { QueriesRow } from '../shared';

interface Query extends QueriesRow {
	selected: boolean;
}

export interface AppData {
	queries: Query[];
}

export function EmptyData(): AppData {
	return {
		queries: [],
	};
}

export type AppContextType = [AppData, React.Dispatch<React.SetStateAction<AppData>>];

export const AppContext = React.createContext<AppContextType>([
	EmptyData(),
	() => {
		alert('some dumbass consumed the context without a provider');
	},
]);

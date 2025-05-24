type ListReducerAction<T> =
	| { type: 'Add'; data: T }
	| { type: 'Remove'; idx: number }
	| { type: 'Edit'; idx: number; data: T };

//prettier-ignore
export function GenericListReducer<T>(
    state: T[],
    action: ListReducerAction<T>
): T[] {
    switch (action.type) {
        case 'Add':
            return [...state, action.data];
        case 'Remove':
            return state.filter((_, i) => i !== action.idx);
        case 'Edit':
            return state.map((it, idx) =>
                idx === action.idx ? action.data : it
            );
        default:
            const exhaustive: never = action;
            throw new Error(`Dumbass broke the reducer: ${exhaustive}`);
    }
}

import React, { StrictMode, useContext, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/main.css';

import Swal from 'sweetalert2';

import { AppContext, EmptyData, type AppData, type Item } from './context';
import { AddIcon } from './assets/addIcon';
import { RemoveIcon } from './assets/removeIcon';
import { CheckIcon } from './assets/checkIcon';
import {
	ApiDeleteItem,
	ApiDeleteQuery,
	ApiGetItemsQueries,
	ApiGetQueries,
	ApiRenameItem,
	ApiSaveQuery,
} from './api';
import type { QueriesRow } from '../shared';
import { SyncIcon } from './assets/syncIcon';
import { RightIcon } from './assets/rightIcon';
import { LeftIcon } from './assets/leftIcon';
import { DownloadIcon } from './assets/downloadIcon';

function showError(e: string) {
	Swal.fire({
		title: e,
		icon: 'error',
		toast: true,
		position: 'top-end',
		timer: 5000,
		showConfirmButton: false,
	});
}

function TestPanel() {
	const output = useRef<HTMLTextAreaElement>(null);
	async function test() {
		const response = await fetch('/api/testing', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		output.current!.value = JSON.stringify(await response.json());
	}

	return (
		<div className="flex flex-row">
			<li>
				<button
					onClick={test}
					className="rounded cursor-pointer w-full p-2 bg-green-100 hover:bg-green-200 text-green-700 border border-green-200"
				>
					<p>test</p>
				</button>
			</li>
			<textarea
				ref={output}
				readOnly
				className="resize-none w-full"
				style={{ minHeight: '500px', height: '100%' }}
			/>
		</div>
	);
}

function ControlPanel() {
	const [data, setData] = useContext(AppContext);

	async function addQuery() {
		const { value: q } = await Swal.fire({
			title: 'Query',
			input: 'text',
		});
		if (!q) {
			return;
		}

		const copy = [...data.queries];
		const newq: QueriesRow = { query: q, items: 0 };
		copy.push({ ...newq, selected: false });

		const suc = await ApiSaveQuery(newq);
		if (!suc) {
			showError('Error saving query');
			return;
		}

		setData((prev) => {
			return { ...prev, queries: copy };
		});
	}

	async function fullSync() {
		location.reload();
	}

	async function getItems() {
		const selected = data.queries.filter((q) => q.selected).map((q) => q.query);

		const fetched = await ApiGetItemsQueries(selected);

		setData((prev) => {
			return { ...prev, items: fetched };
		});
	}

	return (
		<ul className="space-y-1 p-1 w-full max-w-xs">
			<li>
				<button
					onClick={fullSync}
					className="flex cursor-pointer items-center justify-between w-full space-x-2 p-2 text-sm bg-amber-100 hover:bg-amber-200 rounded text-amber-700 border border-amber-200"
				>
					<p>Sync</p>
					<SyncIcon />
				</button>
			</li>
			<li>
				<button
					onClick={addQuery}
					className="flex cursor-pointer items-center justify-between w-full space-x-2 p-2 text-sm bg-blue-100 hover:bg-blue-200 rounded text-blue-700 border border-blue-200"
				>
					<p>Add Query</p>
					<AddIcon />
				</button>
			</li>

			<li>
				<button
					onClick={getItems}
					className="flex cursor-pointer items-center justify-between w-full space-x-2 p-2 text-sm bg-pink-100 hover:bg-pink-200 rounded text-pink-700 border border-pink-200"
				>
					<p>Get Items</p>
					<DownloadIcon />
				</button>
			</li>
		</ul>
	);
}

function QueriesTable() {
	const [data, setData] = useContext(AppContext);

	function selectQuery(idx: number) {
		const copy = [...data.queries];
		copy[idx].selected = !copy[idx].selected;
		setData((prev) => {
			return { ...prev, queries: copy };
		});
	}

	async function removeQuery(idx: number) {
		const copy = [...data.queries];
		const removed = copy.splice(idx, 1);

		const suc = await ApiDeleteQuery(removed[0]);
		if (!suc) {
			showError('Error deleting query');
			return;
		}

		setData((prev) => {
			return { ...prev, queries: copy };
		});
	}

	if (data.queries.length === 0) {
		return <div />;
	}

	return (
		<ul className="space-y-1 border-1 border-slate-600">
			{data.queries.map((q, i) => (
				<li
					key={i}
					className={
						'flex items-center justify-between px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 '
					}
				>
					<div className="flex flex-1 items-center space-x-2">
						<button
							onClick={() => {
								removeQuery(i);
							}}
							className="text-red-500 hover:text-red-700 cursor-pointer"
						>
							<RemoveIcon />
						</button>
						<h3 className="text-sm font-medium w-full">{q.query}</h3>
						<button
							onClick={() => selectQuery(i)}
							className={`cursor-pointer ${q.selected ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
						>
							<CheckIcon />
						</button>
					</div>
					<div className="text-sm ml-2 text-gray-600">{q.items}</div>
				</li>
			))}
		</ul>
	);
}

type ItemCardProps = {
	item: Item;
	onDelete: (id: number) => void;
	onRename: (id: number, name: string) => void;
};

function ItemCard({ item, onDelete, onRename }: ItemCardProps) {
	return (
		<div className="relative flex-shrink-0 w-48 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
			<button
				onClick={() => onDelete(item.id)}
				className="cursor-pointer absolute top-2 right-2 bg-white text-red-500 rounded-full hover:text-red-600 transition"
				aria-label="Delete item"
			>
				<RemoveIcon />
			</button>
			<a href={item.url} className="block">
				<img
					src={item.image}
					alt={item.name}
					className="w-full h-32 object-cover rounded-xl mb-2"
				/>
			</a>

			<input
				defaultValue={item.name}
				className="text-lg font-semibold truncate"
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					onRename(item.id, e.target.value);
				}}
			/>
			<p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
		</div>
	);
}

type Procedure = (...args: any[]) => void;
function debounce<T extends Procedure>(callback: T, wait: number): T {
	let timeoutId: number | null = null;

	const debouncedFunction = (...args: Parameters<T>) => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			callback(...args);
		}, wait);
	};

	return debouncedFunction as T;
}

export default function ItemsCarousel() {
	const [data, setData] = useContext(AppContext);
	const items: Item[] = data.items;

	async function deleteItem(id: number) {
		const rix = data.items.findIndex((i) => i.id == id);

		const suc = await ApiDeleteItem(data.items[rix]!);
		if (!suc) {
			showError('Error deleting item');
			return;
		}
		const copy = [...data.items];
		copy.splice(rix, 1);

		setData((prev) => {
			return { ...prev, items: copy };
		});
	}

	async function renameItem(id: number, name: string) {
		await ApiRenameItem(id, name);
	}

	const debouncedRename = useMemo(
		() => debounce((id: number, name: string) => renameItem(id, name), 300),
		[],
	);

	const carouselRef = useRef<HTMLDivElement>(null);

	const scrollLeft = () => {
		if (carouselRef.current) {
			carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
		}
	};

	const scrollRight = () => {
		if (carouselRef.current) {
			carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
		}
	};

	if (items.length === 0) {
		return <></>;
	}

	return (
		<div className="relative">
			<button
				onClick={scrollLeft}
				className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
			>
				<LeftIcon />
			</button>

			<div ref={carouselRef} className="overflow-x-auto scrollbar-hide">
				<div className="flex space-x-4 py-4">
					{items.map((item) => (
						<ItemCard
							key={item.id}
							item={item}
							onDelete={deleteItem}
							onRename={debouncedRename}
						/>
					))}
				</div>
			</div>

			<button
				onClick={scrollRight}
				className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
			>
				<RightIcon />
			</button>
		</div>
	);
}

const reduxAtHome: AppData = EmptyData();

function App() {
	const [data, setData] = useState(reduxAtHome);

	return (
		<StrictMode>
			<AppContext.Provider value={[data, setData]}>
				<TestPanel />

				<ControlPanel />
				<div className="max-w-1/3 my-4">
					<QueriesTable />
				</div>
				<ItemsCarousel />
			</AppContext.Provider>
		</StrictMode>
	);
}

ApiGetQueries().then((value) => {
	if (value.length !== 0) {
		reduxAtHome.queries = value.map((q) => {
			return { ...q, selected: false };
		});
	}

	createRoot(document.getElementById('root')!).render(<App />);
});

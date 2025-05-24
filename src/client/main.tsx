import { StrictMode, useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/main.css';

import Swal from 'sweetalert2';

import { AppContext, EmptyData } from './context';
import { UploadIcon } from './assets/uploadIcon';
import { AddIcon } from './assets/addIcon';
import { RemoveIcon } from './assets/removeIcon';
import { CheckIcon } from './assets/checkIcon';
import { ApiSaveQueries } from './api';

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
		copy.push({ query: q, items: 0, selected: false });
		setData((prev) => {
			return { ...prev, queries: copy };
		});
	}

	async function saveQueries() {
		const suc = await ApiSaveQueries(data.queries);
		if (!suc) {
			Swal.fire({
				title: 'Error saving queries',
				icon: 'error',
				toast: true,
				position: 'top-end',
				timer: 5000,
				showConfirmButton: false,
			});
		}
	}

	return (
		<ul className="space-y-1 p-1 w-full max-w-xs">
			<li>
				<button
					onClick={saveQueries}
					className="flex cursor-pointer items-center justify-between w-full space-x-2 p-2 text-sm bg-amber-100 hover:bg-amber-200 rounded text-amber-700 border border-amber-200"
				>
					<p>Save Queries</p>
					<UploadIcon />
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

	function removeQuery(idx: number) {
		const copy = [...data.queries];
		copy.splice(idx, 1);
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

function App() {
	const [data, setData] = useState(EmptyData());

	return (
		<StrictMode>
			<AppContext.Provider value={[data, setData]}>
				<ControlPanel />
				<div className="max-w-1/3 flex flex-col gap-5">
					<QueriesTable />
				</div>
			</AppContext.Provider>
		</StrictMode>
	);
}

createRoot(document.getElementById('root')!).render(<App />);

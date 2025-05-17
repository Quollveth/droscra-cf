import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/main.css';

function App() {
	return (
		<StrictMode>
			<h1>Hello, World!</h1>
		</StrictMode>
	);
}

createRoot(document.getElementById('root')!).render(<App />);

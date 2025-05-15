CREATE TABLE Items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT,
	url TEXT,
	image TEXT,
	approved INTEGER,
	price REAL,
	query TEXT,
	FOREIGN KEY(query) REFERENCES Search(query)
);

CREATE TABLE Search (
	query TEXT PRIMARY KEY
);

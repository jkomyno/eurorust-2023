DROP TABLE IF EXISTS Event;
CREATE TABLE IF NOT EXISTS Event (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);

INSERT INTO Event (id, data) VALUES (1, '{ "name": "EuroRust", "year": 2023, "location": "Brussel" }');

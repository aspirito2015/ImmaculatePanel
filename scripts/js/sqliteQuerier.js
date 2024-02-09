export async function sqliteQuery(queryString) {
    // Fetch your SQLite database file (replace 'your_database_file.db' with the path to your SQLite database file)
    var response = await fetch('/data/ip.db');
    var buffer = await response.arrayBuffer();
    var results;
    var url = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm';
    var result_json = {};

    await initSqlJs({ locateFile: () => url }).then(SQL => {
        // Create a new database instance
        const db = new SQL.Database(new Uint8Array(buffer));

        // Execute queries, e.g., SELECT statement
        results = db.exec(queryString);
        // Close the database connection
        db.close();
        if (results[0]!==undefined) {
            // turn results into json
            let columns = results[0].columns;
            let values = results[0].values;
            for (let x = 0; x < values.length; x++) {
                let j = {};
                for (let y = 0; y < columns.length; y++) {
                    j[columns[y]] = values[x][y];
                }
                result_json[values[x][0]] = j;
            }
        }
    });
    return result_json;
}

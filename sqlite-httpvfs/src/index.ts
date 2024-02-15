import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL(
    "sql.js-httpvfs/dist/sqlite.worker.js",
    import.meta.url
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

export async function query_sqlite(q: string) {
    let url = window.location.href;
    let s = "";
    if (url.includes("aspirito2015.github.io")) { s = "/MarvelGrid_HTML"; }
    const worker = await createDbWorker(
        [
            {
                from: "inline",
                config: {
                    serverMode: "full",
                    url: `${s}/data/ip.db`,
                    requestChunkSize: 4096,
                },
            },
        ],
        workerUrl.toString(),
        wasmUrl.toString()
    );

    const result = await worker.db.query(q);

    return result;
}
